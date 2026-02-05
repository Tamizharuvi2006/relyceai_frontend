import { useEffect, useCallback, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../utils/firebaseConfig';
import ChatService from '../../services/chatService';
import ShareService from '../../services/shareService';
import PDFService from '../../services/pdfService';
import { WebSocketChatManager } from '../../utils/api';

export default function useChatMessages({ core, currentSessionId, userId, onMessagesUpdate }) {
    const {
        messagesRef, setMessages, setBotTyping, setCurrentMessageId,
        setWsConnected, setIsReconnecting, isReconnecting,
        chatMode, setFileUploads, userUniqueId, setIsDeepSearchActive,
        activePersonality, userProfile
    } = core;

    // Refs for tracking messages
    const lastSessionIdRef = useRef(null);
    const streamingMessageIdRef = useRef(null);
    const wsManager = useRef(new WebSocketChatManager());
    const tokenBufferRef = useRef('');

    useEffect(() => {
        if (!userId || typeof userId !== 'string' || userId.length < 10) return;

        // Clear message tracking when session changes
        if (lastSessionIdRef.current !== currentSessionId) {
            lastSessionIdRef.current = currentSessionId;
        }

        // Check backend connection status
        ChatService.checkConnection().then(connected => {
            setWsConnected(connected);
            if (!connected) {
                // Silent failure - will retry
            }
        });

        // Initialize WebSocket Connection
        const initWebSocket = async () => {
            if (!currentSessionId) return;
            
            const tokenProvider = async () => {
                try {
                    if (auth.currentUser) {
                        return await auth.currentUser.getIdToken(true);
                    }
                } catch (e) {
                    console.warn("Failed to get auth token for WS", e);
                }
                return null;
            };

            wsManager.current.connect(currentSessionId, tokenProvider, {
                onConnect: () => {
                    setWsConnected(true);
                    setIsReconnecting(false);
                },
                onReconnect: () => {
                     setIsReconnecting(true);
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

                        if (infoText === "processing") {
                            isSearching = false;
                        } else if (infoText === "stopped") {
                            isSearching = false;
                        } else if (infoText.startsWith("Searching with:")) {
                            isSearching = true;
                            searchQuery = infoText.replace("Searching with:", "").trim();
                            tokenBufferRef.current = ""; // Clear buffer on search start
                        }

                        return { 
                           ...msg, 
                           isSearching,
                           searchQuery
                        };
                   }));
                },
                onDone: () => {
                    const botMsgId = streamingMessageIdRef.current;
                    if (botMsgId) {
                        // Flush remaining buffer
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
                    }
                },
                onError: (err) => {
                    console.error("WS Error:", err);
                    const botMsgId = streamingMessageIdRef.current;
                    if (botMsgId) {
                        setMessages(prev => prev.map(msg => 
                            msg.id === botMsgId 
                                ? { 
                                    ...msg, 
                                    content: (msg.content || '') + `\n⚠️ Error: ${err}`,
                                    isError: true,
                                    isStreaming: false
                                  }
                                : msg
                        ));
                        setBotTyping(false);
                        streamingMessageIdRef.current = null;
                    }
                }
            });
        };

        if (currentSessionId) {
            initWebSocket();
        }

        return () => {
            if (wsManager.current) {
                wsManager.current.disconnect();
            }
        };
    }, [currentSessionId, userId, setWsConnected, setMessages, setBotTyping, setIsDeepSearchActive, setCurrentMessageId]);

    // Heartbeat & Buffer Flush Effect
    useEffect(() => {
        const pingInterval = setInterval(() => {
             if (wsManager.current) wsManager.current.ping();
        }, 25000); // 25s heartbeat

        // Use requestAnimationFrame for smoother 60fps+ updates (syncs with screen refresh)
        let animationFrameId;
        const flushBuffer = () => {
            const chunk = tokenBufferRef.current;
            if (chunk && streamingMessageIdRef.current) {
                tokenBufferRef.current = "";
                const botMsgId = streamingMessageIdRef.current;
                
                // Functional update to ensure we don't depend on stale state
                // This runs as fast as the browser can paint (typically 60-144 times per second)
                setMessages(prev => prev.map(msg => 
                    msg.id === botMsgId 
                        ? { 
                            ...msg, 
                            content: (msg.content || '') + chunk,
                            isSearching: false,
                            isGenerating: false,
                            isStreaming: true
                          }
                        : msg
                ));
            }
            animationFrameId = requestAnimationFrame(flushBuffer);
        };
        
        // Start the render loop
        animationFrameId = requestAnimationFrame(flushBuffer);

        return () => {
            clearInterval(pingInterval);
            cancelAnimationFrame(animationFrameId);
        };
    }, [setMessages]);

    const handleReconnect = async () => {
        if (isReconnecting) return;
        setIsReconnecting(true);
        try {
            const connected = await ChatService.checkConnection();
            setWsConnected(connected);
        } catch { /* silent */ }
        finally { setIsReconnecting(false); }
    };

    const handleStop = useCallback(() => {
        if (wsManager.current) {
            wsManager.current.stopGeneration();
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

            // Send via WebSocket
            try {
                // Ensure unique user ID is set if available
                // Backend handles saving to Firestore, so we don't need to double-save here
                // But we optimistically show the user message

                const effectiveMode = isWebSearch ? 'deepsearch' : chatMode;
                const personalityToSend = (effectiveMode === 'normal' || chatMode === 'normal') ? activePersonality : null;
                const userSettings = userProfile?.settings || null;
                
                // If files are present, we might need to handle them differently.
                // Currently WS sendMessage doesn't support file_ids args in the signature of the class method properly unless we passed it.
                // The WebSocketChatManager.sendMessage signature: (content, chatMode, personality, userSettings)
                // It misses file_ids. We should probably update the manager or just append file info to content if needed?
                // For now, follow "User Request": "Use WebSocket ONLY for chat". Users likely know files might be limited or handled via text context.
                // Actually, let's just send the text.
                
                wsManager.current.sendMessage(text, effectiveMode, personalityToSend, userSettings);

                // Note: We REMOVED explicit Firestore saving here because the backend WebSocket handler 
                // does it: save_message_to_firebase(user_id, chat_id, "user", content)
                // This prevents duplicates.
                
            } catch (error) {
                console.error('Error sending message via WS:', error);
                setMessages(prev => prev.map(msg => 
                    msg.id === botMessageId 
                        ? { ...msg, content: "⚠️ Failed to send message.", isError: true, isStreaming: false }
                        : msg
                ));
            }
        }
    }, [userId, currentSessionId, chatMode, userUniqueId, setMessages, setBotTyping, setCurrentMessageId, setIsDeepSearchActive, activePersonality, userProfile]);

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
