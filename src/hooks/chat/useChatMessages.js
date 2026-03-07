import { useEffect, useCallback, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../utils/firebaseConfig';
import ShareService from '../../services/shareService';
import PDFService from '../../services/pdfService';
import ChatService from '../../services/chatService';
import { WebSocketChatManager, streamChatMessage, API_BASE_URL } from '../../utils/api';

let sharedWsManager = null;
let currentSessionId = null;

const getWsManager = (sessionId) => {
    if (sharedWsManager && currentSessionId !== sessionId) {
        sharedWsManager.disconnect();
        sharedWsManager = null;
    }
    if (!sharedWsManager) {
        sharedWsManager = new WebSocketChatManager();
        currentSessionId = sessionId;
    }
    return sharedWsManager;
};

const resetWsManager = () => {
    if (sharedWsManager) {
        sharedWsManager.disconnect();
        sharedWsManager = null;
        currentSessionId = null;
    }
};

export default function useChatMessages({ core, currentSessionId, userId, onMessagesUpdate }) {
    const {
        messagesRef, setMessages, setBotTyping, setCurrentMessageId,
        setWsConnected, setIsReconnecting, isReconnecting,
        chatMode, setFileUploads, userUniqueId, setIsDeepSearchActive,
        activePersonality, userProfile
    } = core;

    const lastSessionIdRef = useRef(null);
    const streamingMessageIdRef = useRef(null);
    const wsManagerRef = useRef(null);
    const tokenBufferRef = useRef('');
    const wsCallbacksRef = useRef(null);
    const tokenProviderRef = useRef(null);

    const finalizeStream = useCallback(() => {
        const botMsgId = streamingMessageIdRef.current;
        if (!botMsgId) return;
        const chunk = tokenBufferRef.current;
        tokenBufferRef.current = "";

        setMessages(prev => prev.map(msg =>
            msg.id === botMsgId
                ? {
                    ...msg,
                    content: (msg.content || '') + chunk,
                    isStreaming: false,
                    isGenerating: false,
                    isSearching: false
                  }
                : msg
        ));
        setBotTyping(false);
        setIsDeepSearchActive(false);
        setCurrentMessageId(null);
        streamingMessageIdRef.current = null;
    }, [setMessages, setBotTyping, setIsDeepSearchActive, setCurrentMessageId]);

    const failStream = useCallback((err) => {
        const botMsgId = streamingMessageIdRef.current;
        if (botMsgId) {
            const buffered = tokenBufferRef.current;
            const existing = messagesRef.current?.find(msg => msg.id === botMsgId);
            const hasContent = Boolean((existing?.content || '').trim()) || Boolean(buffered);

            if (hasContent) {
                finalizeStream();
                return;
            }

            setMessages(prev => prev.map(msg =>
                msg.id === botMsgId
                    ? {
                        ...msg,
                        content: (msg.content || '') + `\nError: ${err}`,
                        isError: true,
                        isStreaming: false,
                        isGenerating: false,
                        isSearching: false
                      }
                    : msg
            ));
        }
        setBotTyping(false);
        setIsDeepSearchActive(false);
        setCurrentMessageId(null);
        streamingMessageIdRef.current = null;
    }, [finalizeStream, messagesRef, setMessages, setBotTyping, setIsDeepSearchActive, setCurrentMessageId]);

    // --- UI Control Global Wiring ---
    useEffect(() => {
        window.handleAgentConfirm = async (confirmStatus, executionId) => {
            if (!executionId) return;
            try {
                await fetch(`${API_BASE_URL}/agent/confirm/${executionId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ confirm: confirmStatus })
                });
                
                // Optimistically update the UI to avoid lag
                setMessages(prev => prev.map(msg => {
                    if (msg.agentMeta?.execution_id === executionId) {
                        return {
                            ...msg,
                            agentMeta: {
                                ...msg.agentMeta,
                                agent_state: confirmStatus ? "using_tool" : "cancelled",
                                completed: !confirmStatus
                            }
                        };
                    }
                    return msg;
                }));
            } catch (err) {
                console.warn('Failed to send confirm signal:', err);
            }
        };
        
        return () => {
            delete window.handleAgentConfirm;
        };
    }, [setMessages]);


    useEffect(() => {
        let isActive = true;

        if (!userId || typeof userId !== 'string' || userId.length < 10) return;

        // Clear message tracking when session changes
        if (lastSessionIdRef.current !== currentSessionId) {
            if (lastSessionIdRef.current && wsManagerRef.current) {
                wsManagerRef.current.disconnect();
                wsManagerRef.current = null;
            }
            lastSessionIdRef.current = currentSessionId;
        }
        
        if (!wsManagerRef.current) {
            wsManagerRef.current = getWsManager(currentSessionId);
        }

        // Initialize WebSocket Connection
        const initWebSocket = async () => {
            if (!currentSessionId) return;
            
            // Skip if already connected to this session or currently connecting
            const manager = wsManagerRef.current;
            if (manager?.chatId === currentSessionId && (manager?.isConnected() || manager?.isConnecting())) {
                return;
            }
            
            const tokenProvider = async () => {
                try {
                    if (auth.currentUser) {
                        return await auth.currentUser.getIdToken(false);
                    }
                    throw new Error('No authenticated user');
                } catch (e) {
                    console.error("Failed to get auth token for WS", e);
                    throw e;
                }
            };
            tokenProviderRef.current = tokenProvider;

            const callbacks = {
                onConnect: () => {
                    setWsConnected(true);
                    setIsReconnecting(false);
                },
                onReconnect: () => {
                    setIsReconnecting(true);
                    setWsConnected(false);
                },
                onToken: (token) => {
                    // Buffer the token
                    tokenBufferRef.current += token;
                },
                onInfo: (infoText) => {
                    const botMsgId = streamingMessageIdRef.current;
                    if (!botMsgId) return;

                    setMessages(prev => prev.map(msg => {
                        if (msg.id !== botMsgId) return msg;

                        // Default to current state to prevent flickering
                        let isSearching = msg.isSearching;
                        let searchQuery = msg.searchQuery;
                        let intelligence = msg.intelligence || null;
                        
                        let agentMeta = msg.agentMeta || {};
                        let executionLog = msg.executionLog || [];

                        if (infoText === "processing") {
                            isSearching = false;
                        } else if (infoText === "stopped") {
                            isSearching = false;
                        } else if (infoText.startsWith("Searching with:")) {
                            isSearching = true;
                            searchQuery = infoText.replace("Searching with:", "").trim();
                            tokenBufferRef.current = ""; // Clear buffer on search start
                        } else if (infoText.startsWith("INTEL:")) {
                            // Intelligence metadata from backend
                            try {
                                const newIntel = JSON.parse(infoText.slice(6));
                                intelligence = intelligence ? { ...intelligence, ...newIntel } : newIntel;
                            } catch (e) {
                                console.warn('[WS] Failed to parse INTEL payload:', e);
                            }
                        } else {
                            try {
                                const parsedInfo = JSON.parse(infoText);
                                
                                // GUARD: Only merge into agentMeta if this is an actual agent signal
                                // (contains agent_state). Prevents non-agent mode JSON from
                                // accidentally triggering AgentMetaBlock/FloatingAgentStatus.
                                if (!parsedInfo.agent_state && !agentMeta?.agent_state) {
                                    return msg; // Skip - not an agent payload
                                }
                                
                                const nextMeta = { ...agentMeta, ...parsedInfo };

                                if (JSON.stringify(nextMeta) === JSON.stringify(agentMeta)) {
                                    return msg;
                                }

                                agentMeta = nextMeta;
                                
                                const buildLogEntry = (info) => {
                                  if (!info.agent_state) return null;
                                  return `[${info.agent_state}] ${info.tool || info.topic || info.trust || info.freshness || ''}`.trim();
                                };
                                
                                const newLog = buildLogEntry(parsedInfo);
                                if (newLog && !executionLog.includes(newLog)) {
                                    executionLog = [...executionLog, newLog].slice(-50); // Cap at 50 entries
                                }
                            } catch (e) {
                                // Not JSON or fallback string
                            }
                        }

                        return {
                            ...msg,
                            isSearching,
                            searchQuery,
                            intelligence,
                            agentMeta,
                            executionLog
                        };
                    }));
                },
                onDone: () => {
                    finalizeStream();
                },
                onError: (err) => {
                    console.error("WS Error:", err);
                    setWsConnected(false);
                    failStream(err);
                }
            };
            wsCallbacksRef.current = callbacks;

            if (!isActive) return;
            wsManagerRef.current.connect(currentSessionId, tokenProvider, callbacks);
        };

        if (currentSessionId) {
            initWebSocket();
        }

        return () => {
            isActive = false;
            if (wsManagerRef.current) {
                wsManagerRef.current.disconnect();
            }
            setWsConnected(false);
        };
    }, [currentSessionId, userId, setWsConnected, setMessages, setBotTyping, setIsDeepSearchActive, setCurrentMessageId, setIsReconnecting, finalizeStream, failStream]);

    // Heartbeat & Buffer Flush Effect - use ref to avoid re-running on every render
    const setMessagesRef = useRef(setMessages);
    useEffect(() => {
        setMessagesRef.current = setMessages;
    }, [setMessages]);

useEffect(() => {
        const pingInterval = setInterval(() => {
             if (wsManagerRef.current) wsManagerRef.current.ping();
        }, 25000);

        let animationFrameId = null;
        let lastFlushTime = 0;
        const FLUSH_INTERVAL_MS = 40;
        const FLUSH_CHAR_THRESHOLD = 48;
        let pendingContent = "";
        let isScheduled = false;

        const performFlush = (timestamp) => {
            isScheduled = false;
            animationFrameId = null;

            const chunk = tokenBufferRef.current;
            if (chunk) {
                tokenBufferRef.current = '';
                pendingContent += chunk;
            }

            if (pendingContent.length > 0 && streamingMessageIdRef.current) {
                if ((timestamp - lastFlushTime) < FLUSH_INTERVAL_MS && pendingContent.length < FLUSH_CHAR_THRESHOLD) {
                    scheduleFlush();
                    return;
                }
                const botMsgId = streamingMessageIdRef.current;
                const contentToFlush = pendingContent;
                pendingContent = "";
                lastFlushTime = timestamp;

                const setMessages = setMessagesRef.current;
                setMessages(prev => {
                    const idx = prev.findIndex(msg => msg.id === botMsgId);
                    if (idx === -1) return prev;
                    if (prev[idx].content === (prev[idx].content || '') + contentToFlush) return prev;
                    const newArr = [...prev];
                    newArr[idx] = {
                        ...prev[idx],
                        content: (prev[idx].content || '') + contentToFlush,
                        isStreaming: true
                    };
                    return newArr;
                });
            }

            // Continuously schedule next frame if there is still data or streaming is active
            if (tokenBufferRef.current || pendingContent || streamingMessageIdRef.current) {
                scheduleFlush();
            }
        };

        const scheduleFlush = () => {
            if (isScheduled) return;
            isScheduled = true;
            animationFrameId = requestAnimationFrame(performFlush);
        };

        // When a token arrives, we now just ensure a flush is scheduled
        // The actual scheduling is triggered by the onToken callback via the manager
        const checkBuffer = () => {
            if (tokenBufferRef.current || pendingContent) {
                scheduleFlush();
            }
        };

        const bufferCheckInterval = setInterval(checkBuffer, 30); // Faster cadence to reduce visible stream lag

        return () => {
            clearInterval(pingInterval);
            clearInterval(bufferCheckInterval);
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, []);

    const handleReconnect = async () => {
        if (isReconnecting) return;
        setIsReconnecting(true);
        try {
            if (currentSessionId && tokenProviderRef.current && wsCallbacksRef.current) {
                wsManagerRef.current.connect(currentSessionId, tokenProviderRef.current, wsCallbacksRef.current);
            }
        } catch { /* silent */ }
        finally { setIsReconnecting(false); }
    };

    const handleStop = useCallback(async () => {
        // Find the execution ID of the current streaming message
        const botMsgId = streamingMessageIdRef.current;
        let activeExecutionId = null;
        if (botMsgId) {
            const currentMsg = messagesRef.current?.find(m => m.id === botMsgId);
            if (currentMsg?.agentMeta?.execution_id) {
                activeExecutionId = currentMsg.agentMeta.execution_id;
            }
        }
        
        if (activeExecutionId) {
            try {
                await fetch(`${API_BASE_URL}/agent/cancel/${activeExecutionId}`, { method: 'POST' });
            } catch (err) {
                console.warn('Failed to send cancel signal to agent execution branch', err);
            }
        }
        
        if (wsManagerRef.current) {
            wsManagerRef.current.stopGeneration();
        }
        tokenBufferRef.current = ""; // Clear buffer
        setBotTyping(false);
        setIsDeepSearchActive(false);
        setCurrentMessageId(null);
        streamingMessageIdRef.current = null;
    }, [setBotTyping, setCurrentMessageId, setIsDeepSearchActive, messagesRef]);

    const handleFileUpload = useCallback((fileName) => {
        const uploadId = `${fileName}-${Date.now()}`;
        setFileUploads(prev => ({ ...prev, [uploadId]: { name: fileName, progress: 0, status: 'uploading' } }));
        return uploadId;
    }, [setFileUploads]);

    const handleFileUploadComplete = useCallback((uploadId, success, filePath, fileId = null) => {
        setFileUploads(prev => {
            const updated = { ...prev };
            if (updated[uploadId]) {
                updated[uploadId] = { 
                    ...updated[uploadId], 
                    progress: 100, 
                    status: success ? 'completed' : 'failed', 
                    filePath: success ? filePath : null,
                    fileId: fileId
                };
            }
            return updated;
        });
    }, [setFileUploads]);


    const handleSend = useCallback(async (messageData) => {
        if (!userId || typeof userId !== 'string' || userId.length < 10) return;
        if (!currentSessionId || typeof currentSessionId !== 'string') return;

        let text = '', files = [], isWebSearch = false;
        if (typeof messageData === 'string') text = messageData;
        else if (messageData && typeof messageData === 'object') {
            text = String(messageData.text || '');
            files = Array.isArray(messageData.files) ? messageData.files : [];
            isWebSearch = Boolean(messageData.isWebSearch);
        }

        if (text.length > 10000) text = text.substring(0, 10000);

        if (text.trim() || files.length > 0) {
            tokenBufferRef.current = "";
            const tempMessageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            const botMessageId = `bot_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            streamingMessageIdRef.current = botMessageId;
            
            // Add user message to UI immediately
            const userMessage = {
                id: tempMessageId,
                role: 'user',
                content: text,
                files: files.map(({ file, ...metadata }) => metadata),
                timestamp: new Date().toISOString(),
            };
            
            // Add empty bot message placeholder for streaming
            const botMessagePlaceholder = {
                id: botMessageId,
                role: 'bot',
                content: '',
                timestamp: new Date().toISOString(),
                isStreaming: true,
                isGenerating: true,
            };
            
            setMessages(prev => [...prev, userMessage, botMessagePlaceholder]);
            setBotTyping(true);
            setIsDeepSearchActive(isWebSearch);
            
            // Save user message to Firebase handled by Backend now
            // const messageId = await ChatService.addMessage(userId, currentSessionId, "user", text, files);
            // setCurrentMessageId(messageId);
            setCurrentMessageId(tempMessageId); // Use temp ID locally

            // Update session name if needed
            if (currentSessionId && userId) {
                try {
                    // Update session name optimistically or lazily
                    const plainText = text.replace(/[#>*_`\[\]]/g, '').trim();
                     // Check current name first
                    const sessionRef = doc(db, "users", userId, "chatSessions", currentSessionId);
                    // Async check without awaiting to blocking UI
                    getDoc(sessionRef).then(sessionSnap => {
                         const currentName = sessionSnap.exists() ? String(sessionSnap.data().name || "").trim() : "";
                         const isDefaultName = !currentName || ["new chat", "new session", "conversation"].includes(currentName.toLowerCase());
                         if (isDefaultName) {
                            let chatName = plainText.substring(0, 60);
                            if (chatName.length < plainText.length) chatName += "...";
                            if (!chatName) chatName = "Conversation";
                            ChatService.updateSessionName(userId, currentSessionId, chatName);
                        }
                    });
                } catch { /* silent */ }
            }

            // Send via WebSocket (preferred), fallback to SSE if not connected
            try {
                const effectiveMode = isWebSearch ? 'deepsearch' : chatMode;
                const personalityToSend = effectiveMode === 'normal' ? activePersonality : null;
                const userSettings = userProfile?.settings || null;
                const fileIds = files.map((f) => f.fileId).filter(Boolean);

                if (wsManagerRef.current && wsManagerRef.current.isConnected()) {
                    wsManagerRef.current.sendMessage(text, effectiveMode, personalityToSend, userSettings);
                    return;
                }

                setWsConnected(false);

                for await (const chunk of streamChatMessage(
                    text,
                    currentSessionId,
                    userId,
                    effectiveMode,
                    personalityToSend,
                    userSettings
                )) {
                    if (chunk.type === 'token') {
                        tokenBufferRef.current += chunk.content;
                    } else if (chunk.type === 'info') {
                        // Dispatch to the message's agentMeta to be tracked by AgentMetaBlock
                        setMessages(prev => prev.map(msg => {
                            if (msg.id === streamingMessageIdRef.current) {
                                const currentLogs = msg.executionLog || [];
                                const newLog = chunk.payload.agent_state 
                                  ? `[${chunk.payload.agent_state}] ${chunk.payload.tool || chunk.payload.topic || ''}`.trim()
                                  : null;
                                
                                return {
                                    ...msg,
                                    agentMeta: { ...msg.agentMeta, ...chunk.payload },
                                    executionLog: newLog && !currentLogs.includes(newLog) 
                                      ? [...currentLogs, newLog] 
                                      : currentLogs
                                };
                            }
                            return msg;
                        }));
                    }
                }

                finalizeStream();

            } catch (error) {
                console.error('Error sending message via WS/SSE:', error);
                if (error?.message?.includes('GOVERNANCE_BLOCK')) {
                    finalizeStream();
                } else {
                    failStream(error?.message || 'Failed to send message.');
                }
            }
        }
    }, [userId, currentSessionId, chatMode, userUniqueId, setMessages, setBotTyping, setCurrentMessageId, setIsDeepSearchActive, activePersonality, userProfile, setWsConnected, finalizeStream, failStream]);

    const handleDownloadPDF = async (msgs) => {
        if (!msgs?.length) return alert('No chat to download!');
        try {
            const blob = await PDFService.generateChatPDF(msgs, { title: 'Chat Conversation', date: new Date(), participants: ['User', 'Relyce AI'] });
            PDFService.downloadPDF(blob, `relyce-chat-${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch { alert('Failed to generate PDF.'); }
    };

    const handleShare = async (msgs) => {
        if (!currentSessionId || !userId || !msgs?.length) return alert('No chat to share!');
        try {
            const shareUrl = await ShareService.shareChat(userId, currentSessionId, msgs);
            if (navigator.share) await navigator.share({ title: 'Relyce AI Chat', url: shareUrl });
            else { await ShareService.copyShareLink(shareUrl); alert('Share link copied!'); }
        } catch { alert('Failed to share chat.'); }
    };

    const handleCopyLink = async (msgs) => {
        if (!currentSessionId || !userId || !msgs?.length) return alert('No chat to share!');
        try {
            const shareUrl = await ShareService.shareChat(userId, currentSessionId, msgs);
            await ShareService.copyShareLink(shareUrl);
            alert('Share link copied!');
        } catch { alert('Failed to create share link.'); }
    };

    return { handleSend, handleStop, handleReconnect, handleFileUpload, handleFileUploadComplete, handleDownloadPDF, handleShare, handleCopyLink };
}
