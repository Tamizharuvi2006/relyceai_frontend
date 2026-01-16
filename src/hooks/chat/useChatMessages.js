import { useEffect, useCallback, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebaseConfig';
import ChatService from '../../services/chatService';
import ShareService from '../../services/shareService';
import PDFService from '../../services/pdfService';

export default function useChatMessages({ core, currentSessionId, userId, onMessagesUpdate }) {
    const {
        messagesRef, setMessages, setBotTyping, setCurrentMessageId,
        setWsConnected, setIsReconnecting, isReconnecting,
        chatMode, setFileUploads
    } = core;

    // Refs for tracking messages - persist across StrictMode double-renders
    const processedMessageIdsRef = useRef(new Set());
    const activeMessageIdsRef = useRef(new Set());
    const streamingMessagesRef = useRef(new Map());

    useEffect(() => {
        if (!userId || typeof userId !== 'string' || userId.length < 10) return;

        try {
            ChatService.setUserId(userId);
            if (currentSessionId && typeof currentSessionId === 'string') {
                ChatService.setCurrentSessionId(currentSessionId);
            }
        } catch { /* silent */ }

        const initWebSocket = async () => {
            try {
                const { wsManager } = await import('../../utils/api');
                const { getAuth } = await import('firebase/auth');

                wsManager.clearAllMessageHandlers();

                const auth = getAuth();
                if (auth.currentUser) {
                    try {
                        const idToken = await auth.currentUser.getIdToken();
                        wsManager.setAuthToken(idToken);
                    } catch { /* silent */ }
                }

                wsManager.setUserId(userId);
                if (currentSessionId) wsManager.setCurrentSessionId(currentSessionId);

                await wsManager.connect();
                setWsConnected(true);

                const connectionHandler = (status) => {
                    if (status === 'connected') { setWsConnected(true); setIsReconnecting(false); }
                    else if (status === 'disconnected' || status === 'error') setWsConnected(false);
                };

                // Use refs for tracking (persists across StrictMode double-renders)
                const processedMessageIds = processedMessageIdsRef.current;
                const activeMessageIds = activeMessageIdsRef.current;
                const streamingMessages = streamingMessagesRef.current;
                
                const messageHandler = async (data) => {
                    if (!data || typeof data !== 'object') return;

                    // Handle "searching" status - show skeleton loader with search query
                    if (data.type === 'searching' && data.messageId) {
                        const msgKey = data.messageId;
                        
                        // Skip if already processed or active (synchronous check)
                        if (processedMessageIds.has(msgKey) || activeMessageIds.has(msgKey)) {
                            return;
                        }
                        activeMessageIds.add(msgKey);
                        
                        // Check if message already exists in state
                        setMessages(prev => {
                            const exists = prev.some(m => m.id === msgKey);
                            if (exists) return prev;
                            
                            return [...prev, {
                                id: msgKey,
                                role: 'bot',
                                content: '',
                                timestamp: new Date().toISOString(),
                                isSearching: true,
                                searchQuery: data.query || '',
                                mode: data.mode
                            }];
                        });
                    }
                    // Handle "sources" - update message with source links
                    else if (data.type === 'sources' && data.messageId && data.sources) {
                        const msgKey = data.messageId;
                        
                        // Update the message with sources
                        setMessages(prev => prev.map(msg => 
                            msg.id === msgKey 
                                ? { ...msg, sources: data.sources, isSearching: false, isGenerating: true }
                                : msg
                        ));
                    }
                    // Handle streaming start - start showing response text
                    else if (data.type === 'stream_start' && data.messageId) {
                        const msgKey = data.messageId;
                        
                        // Initialize streaming message
                        streamingMessages.set(msgKey, '');
                        
                        // Update existing message or create new one
                        setMessages(prev => {
                            const exists = prev.some(m => m.id === msgKey);
                            if (exists) {
                                return prev.map(msg => 
                                    msg.id === msgKey 
                                        ? { ...msg, isSearching: false, isGenerating: false, isStreaming: true, sources: data.sources || msg.sources }
                                        : msg
                                );
                            } else {
                                return [...prev, {
                                    id: msgKey,
                                    role: 'bot',
                                    content: '',
                                    timestamp: new Date().toISOString(),
                                    isStreaming: true,
                                    sources: data.sources || []
                                }];
                            }
                        });
                    }
                    // Handle streaming chunk - update message content
                    else if (data.type === 'stream' && data.messageId && data.text) {
                        const msgKey = data.messageId;
                        const currentContent = streamingMessages.get(msgKey) || '';
                        const newContent = currentContent + data.text;
                        streamingMessages.set(msgKey, newContent);
                        
                        // Update the message in state
                        setMessages(prev => prev.map(msg => 
                            msg.id === msgKey 
                                ? { ...msg, content: newContent, isStreaming: true }
                                : msg
                        ));
                    }
                    // Handle streaming end - finalize message
                    else if (data.type === 'stream_end' && data.messageId) {
                        const msgKey = data.messageId;
                        processedMessageIds.add(msgKey);
                        streamingMessages.delete(msgKey);
                        
                        setBotTyping(false);
                        setCurrentMessageId(null);
                        
                        // Update final message state with sources
                        setMessages(prev => prev.map(msg => 
                            msg.id === msgKey 
                                ? { ...msg, content: data.text, isStreaming: false, isSearching: false, isGenerating: false, sources: data.sources || msg.sources }
                                : msg
                        ));

                        // Save to Firebase
                        if (userId && currentSessionId && data.text) {
                            try { await ChatService.addMessage(userId, currentSessionId, 'bot', data.text); }
                            catch { /* silent */ }
                        }
                    }
                    // Legacy: Handle non-streaming bot messages
                    else if (data.type === 'bot' && data.text) {
                        const msgKey = data.messageId || data.chatId || `${Date.now()}`;
                        if (processedMessageIds.has(msgKey)) return;
                        processedMessageIds.add(msgKey);

                        setBotTyping(false);
                        setCurrentMessageId(null);
                        
                        setMessages(prev => [...prev, {
                            id: msgKey,
                            role: 'bot',
                            content: data.text,
                            timestamp: new Date().toISOString()
                        }]);

                        if (userId && currentSessionId) {
                            try { await ChatService.addMessage(userId, currentSessionId, 'bot', data.text); }
                            catch { /* silent */ }
                        }
                    } else if (data.type === 'error') {
                        setBotTyping(false);
                        setCurrentMessageId(null);
                        setMessages(prev => [...prev, {
                            id: `error_${Date.now()}`,
                            role: 'bot',
                            content: `Error: ${data.text}`,
                            timestamp: new Date().toISOString(),
                            isError: true
                        }]);
                    }
                };

                wsManager.addConnectionHandler(connectionHandler);
                wsManager.addMessageHandler(messageHandler);
                return { wsManager, connectionHandler, messageHandler };
            } catch {
                setWsConnected(false);
                return null;
            }
        };

        const cleanupRef = { current: null };
        initWebSocket().then(result => { cleanupRef.current = result; });

        return () => {
            if (cleanupRef.current) {
                cleanupRef.current.wsManager.removeConnectionHandler(cleanupRef.current.connectionHandler);
                cleanupRef.current.wsManager.removeMessageHandler(cleanupRef.current.messageHandler);
            }
        };
    }, [currentSessionId, userId]);

    const handleReconnect = async () => {
        if (isReconnecting) return;
        setIsReconnecting(true);
        try { await ChatService.reconnect(); }
        catch { /* silent */ }
        finally { setIsReconnecting(false); }
    };

    const handleStop = useCallback(() => {
        setBotTyping(false);
        setCurrentMessageId(null);
        if (ChatService.isConnected()) ChatService.sendStopSignal();
    }, []);

    const handleFileUpload = useCallback((fileName) => {
        const uploadId = `${fileName}-${Date.now()}`;
        setFileUploads(prev => ({ ...prev, [uploadId]: { name: fileName, progress: 0, status: 'uploading' } }));
        return uploadId;
    }, []);

    const handleFileUploadComplete = useCallback((uploadId, success, filePath) => {
        setFileUploads(prev => {
            const updated = { ...prev };
            if (updated[uploadId]) {
                updated[uploadId] = { ...updated[uploadId], progress: 100, status: success ? 'completed' : 'failed', filePath: success ? filePath : null };
            }
            return updated;
        });
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

        if (text.trim() || files.length > 0) {
            const messageId = await ChatService.addMessage(userId, currentSessionId, "user", text, files);
            setCurrentMessageId(messageId);
            setBotTyping(true);

            if (currentSessionId && userId) {
                try {
                    const sessionRef = doc(db, "users", userId, "chatSessions", currentSessionId);
                    const sessionSnap = await getDoc(sessionRef);
                    if (sessionSnap.exists() && sessionSnap.data().name === 'New Chat') {
                        const plainText = text.replace(/[#>*_`\[\]]/g, '').trim();
                        let chatName = plainText.substring(0, 60);
                        if (chatName.length < plainText.length) chatName += '...';
                        if (!chatName) chatName = 'Conversation';
                        await ChatService.updateSessionName(userId, currentSessionId, chatName);
                    }
                } catch { /* silent */ }
            }

            if (ChatService.isConnected()) {
                const result = ChatService.sendMessage(text, currentSessionId, chatMode, isWebSearch);
                if (!result.success) {
                    setBotTyping(false);
                    setCurrentMessageId(null);
                    setTimeout(() => ChatService.addMessage(userId, currentSessionId, "bot", "Sorry, I'm having trouble connecting."), 1000);
                }
            } else {
                setTimeout(() => {
                    ChatService.addMessage(userId, currentSessionId, "bot", "I'm currently offline. Please check your connection.");
                    setBotTyping(false);
                    setCurrentMessageId(null);
                }, 1000);
            }
        }
    }, [userId, currentSessionId, chatMode, messagesRef]);

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
