import { useEffect, useCallback, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../utils/firebaseConfig';
import ShareService from '../../services/shareService';
import PDFService from '../../services/pdfService';
import ChatService from '../../services/chatService';
import { WebSocketChatManager, streamChatMessage } from '../../utils/api';

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
                                intelligence = JSON.parse(infoText.slice(6));
                            } catch (e) {
                                console.warn('[WS] Failed to parse INTEL payload:', e);
                            }
                        }

                        return {
                            ...msg,
                            isSearching,
                            searchQuery,
                            intelligence
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
        const FLUSH_INTERVAL_MS = 50;
        let pendingContent = '';
        let isScheduled = false;

        const scheduleFlush = () => {
            if (isScheduled) return;
            isScheduled = true;
            animationFrameId = requestAnimationFrame(performFlush);
        };

        const performFlush = () => {
            isScheduled = false;
            animationFrameId = null;

            const now = Date.now();
            const chunk = tokenBufferRef.current;
            
            if (chunk) {
                tokenBufferRef.current = '';
                pendingContent += chunk;
            }

            const hasPendingContent = pendingContent.length > 0;
            const timeSinceLastFlush = now - lastFlushTime;
            const shouldFlushNow = hasPendingContent && (timeSinceLastFlush >= FLUSH_INTERVAL_MS || pendingContent.length > 100);

            if (shouldFlushNow && streamingMessageIdRef.current) {
                const botMsgId = streamingMessageIdRef.current;
                const contentToFlush = pendingContent;
                pendingContent = '';
                lastFlushTime = now;

                const setMessages = setMessagesRef.current;
                setMessages(prev => {
                    const idx = prev.findIndex(msg => msg.id === botMsgId);
                    if (idx === -1) return prev;
                    const msg = prev[idx];
                    if (msg.content === (msg.content || '') + contentToFlush) return prev;
                    const newMsg = {
                        ...msg,
                        content: (msg.content || '') + contentToFlush,
                        isStreaming: true
                    };
                    const newArr = prev.slice();
                    newArr[idx] = newMsg;
                    return newArr;
                });
            }

            if (chunk || pendingContent) {
                scheduleFlush();
            }
        };

        const checkBuffer = () => {
            if (tokenBufferRef.current || pendingContent) {
                scheduleFlush();
            }
        };

        const bufferCheckInterval = setInterval(checkBuffer, 30);

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

    const handleStop = useCallback(() => {
        if (wsManagerRef.current) {
            wsManagerRef.current.stopGeneration();
        }
        tokenBufferRef.current = ""; // Clear buffer
        setBotTyping(false);
        setIsDeepSearchActive(false);
        setCurrentMessageId(null);
        streamingMessageIdRef.current = null;
    }, [setBotTyping, setCurrentMessageId, setIsDeepSearchActive]);

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
                         if (sessionSnap.exists() && sessionSnap.data().name === 'New Chat') {
                            let chatName = plainText.substring(0, 60);
                            if (chatName.length < plainText.length) chatName += '...';
                            if (!chatName) chatName = 'Conversation';
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

                for await (const token of streamChatMessage(
                    text,
                    currentSessionId,
                    userId,
                    effectiveMode,
                    fileIds,
                    personalityToSend,
                    userSettings
                )) {
                    tokenBufferRef.current += token;
                }

                finalizeStream();

            } catch (error) {
                console.error('Error sending message via WS/SSE:', error);
                failStream(error?.message || 'Failed to send message.');
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
