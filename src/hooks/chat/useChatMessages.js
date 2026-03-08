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
    const pendingFlushRef = useRef('');
    const streamModeRef = useRef('normal');
    const wsCallbacksRef = useRef(null);
    const tokenProviderRef = useRef(null);

    const finalizeStream = useCallback(() => {
        const botMsgId = streamingMessageIdRef.current;
        if (!botMsgId) return;
        const chunk = tokenBufferRef.current;
        const pendingChunk = pendingFlushRef.current;
        tokenBufferRef.current = "";
        pendingFlushRef.current = "";

        setMessages(prev => prev.map(msg =>
            msg.id === botMsgId
                ? {
                    ...msg,
                    content: (msg.content || '') + pendingChunk + chunk,
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
                        let parsedInfo = null;

                        if (infoText === "processing") {
                            isSearching = false;
                        } else if (infoText === "stopped") {
                            isSearching = false;
                        } else if (infoText.startsWith("Searching with:")) {
                            isSearching = true;
                            searchQuery = infoText.replace("Searching with:", "").trim();
                            tokenBufferRef.current = ""; // Clear buffer on search start
                            pendingFlushRef.current = "";
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
                                parsedInfo = JSON.parse(infoText);
                                
                                const hasFollowups = Array.isArray(parsedInfo.followups);
                                const hasActionChips = Array.isArray(parsedInfo.action_chips);

                                // Ignore unrelated INFO payloads, but keep followup payloads even without agent_state.
                                if (!parsedInfo.agent_state && !agentMeta?.agent_state && !hasFollowups && !hasActionChips && !parsedInfo.followup_mode) {
                                    return msg;
                                }

                                const nextMeta = parsedInfo.agent_state ? { ...agentMeta, ...parsedInfo } : agentMeta;

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

                        const nextFollowups = Array.isArray(parsedInfo?.followups)
                            ? parsedInfo.followups
                            : (Array.isArray(msg.followups) ? msg.followups : []);
                        const nextActionChips = Array.isArray(parsedInfo?.action_chips)
                            ? parsedInfo.action_chips
                            : (Array.isArray(msg.actionChips) ? msg.actionChips : []);
                        const nextFollowupMode = parsedInfo?.followup_mode || msg.followupMode || null;

                        return {
                            ...msg,
                            isSearching,
                            searchQuery,
                            intelligence,
                            agentMeta,
                            executionLog,
                            followups: nextFollowups,
                            actionChips: nextActionChips,
                            followupMode: nextFollowupMode,
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
        let pendingContent = pendingFlushRef.current || "";
        let isScheduled = false;

        const performFlush = (timestamp) => {
            isScheduled = false;
            animationFrameId = null;

            // Keep agent streaming unchanged; smooth normal/deepsearch by batching larger token chunks.
            const isNormalLike = streamModeRef.current === 'normal' || streamModeRef.current === 'deepsearch';
            const flushIntervalMs = isNormalLike ? 80 : 40;
            const flushCharThreshold = isNormalLike ? 96 : 48;

            const chunk = tokenBufferRef.current;
            if (chunk) {
                tokenBufferRef.current = '';
                pendingContent += chunk;
                pendingFlushRef.current = pendingContent;
            }

            if (pendingContent.length > 0 && streamingMessageIdRef.current) {
                if ((timestamp - lastFlushTime) < flushIntervalMs && pendingContent.length < flushCharThreshold) {
                    scheduleFlush();
                    return;
                }
                const botMsgId = streamingMessageIdRef.current;
                const contentToFlush = pendingContent;
                pendingContent = "";
                pendingFlushRef.current = "";
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

            // Keep scheduling only while there is buffered content to flush.
            if (tokenBufferRef.current || pendingContent) {
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

        const bufferCheckInterval = setInterval(checkBuffer, 45);

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
        pendingFlushRef.current = "";
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


    const isPdfMakerRequest = useCallback((input = '') => {
        const q = String(input || '').toLowerCase();
        if (!q.includes('pdf')) return false;
        return /(make|create|convert|export|download|save|generate)/.test(q);
    }, []);

    const resolvePdfContent = useCallback((input = '') => {
        const q = String(input || '').trim();
        const lower = q.toLowerCase();
        const quoted = q.match(/"([\s\S]+?)"|'([\s\S]+?)'/);

        if (/\b(this chat|full chat|entire chat|all chat|these chats|whole chat)\b/.test(lower)) {
            return { type: 'chat', content: '', title: 'Chat Conversation' };
        }

        if (/\b(last answer|last response|last message)\b/.test(lower)) {
            const lastBot = [...(messagesRef.current || [])].reverse().find(m => m.role === 'bot' && (m.content || '').trim());
            if (lastBot) {
                return { type: 'text', content: String(lastBot.content || ''), title: 'Last Assistant Response' };
            }
        }

        if (quoted && (quoted[1] || quoted[2])) {
            return { type: 'text', content: String(quoted[1] || quoted[2]), title: 'Requested Content' };
        }

        const cleaned = q
            .replace(/\b(make|create|convert|export|download|save|generate)\b/gi, '')
            .replace(/\b(this|these|that|as|to|into|in)\b/gi, '')
            .replace(/\b(pdf|document|file|content|chat|please)\b/gi, '')
            .replace(/[\s:,-]+/g, ' ')
            .trim();

        if (cleaned) {
            return { type: 'text', content: cleaned, title: 'Requested Content' };
        }

        return { type: 'chat', content: '', title: 'Chat Conversation' };
    }, [messagesRef]);

    const safePdfFilename = useCallback((title = 'relyce-export') => {
        const base = String(title || 'relyce-export').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'relyce-export';
        return `${base}-${new Date().toISOString().slice(0, 10)}.pdf`;
    }, []);
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

        const trimmedText = text.trim();
        if (trimmedText && files.length === 0 && isPdfMakerRequest(trimmedText)) {
            const tempMessageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            const botMessageId = `bot_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            const userMessage = {
                id: tempMessageId,
                role: 'user',
                content: trimmedText,
                timestamp: new Date().toISOString(),
            };

            try {
                const target = resolvePdfContent(trimmedText);
                const filename = safePdfFilename(target.title || 'relyce-export');
                if (target.type === 'chat') {
                    const exportMessages = (messagesRef.current || []).filter(m => (m.content || '').trim());
                    await PDFService.generateAndDownloadChatPDF(
                        exportMessages,
                        { title: target.title || 'Chat Conversation', date: new Date(), participants: ['User', 'Relyce AI'] },
                        filename
                    );
                } else {
                    await PDFService.generateAndDownloadTextPDF(
                        target.content,
                        { title: target.title || 'Document Export', date: new Date(), participants: ['User', 'Relyce AI'] },
                        filename
                    );
                }

                setMessages(prev => [...prev, userMessage, {
                    id: botMessageId,
                    role: 'bot',
                    content: `PDF ready. Downloaded as ${filename}`,
                    timestamp: new Date().toISOString(),
                }]);
            } catch (error) {
                console.error('PDF maker failed:', error);
                setMessages(prev => [...prev, userMessage, {
                    id: botMessageId,
                    role: 'bot',
                    content: 'PDF generation failed. Please try again.',
                    isError: true,
                    timestamp: new Date().toISOString(),
                }]);
            }
            return;
        }

        if (trimmedText || files.length > 0) {
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
                streamModeRef.current = effectiveMode;
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
                                    agentMeta: chunk.payload.agent_state ? { ...msg.agentMeta, ...chunk.payload } : (msg.agentMeta || {}),
                                    executionLog: newLog && !currentLogs.includes(newLog) 
                                      ? [...currentLogs, newLog] 
                                      : currentLogs,
                                    followups: Array.isArray(chunk.payload?.followups)
                                      ? chunk.payload.followups
                                      : (Array.isArray(msg.followups) ? msg.followups : []),
                                    actionChips: Array.isArray(chunk.payload?.action_chips)
                                      ? chunk.payload.action_chips
                                      : (Array.isArray(msg.actionChips) ? msg.actionChips : []),
                                    followupMode: chunk.payload?.followup_mode || msg.followupMode || null,
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
    }, [userId, currentSessionId, chatMode, userUniqueId, setMessages, setBotTyping, setCurrentMessageId, setIsDeepSearchActive, activePersonality, userProfile, setWsConnected, finalizeStream, failStream, isPdfMakerRequest, resolvePdfContent, safePdfFilename, messagesRef]);

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













