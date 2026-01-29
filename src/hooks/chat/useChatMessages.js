import { useEffect, useCallback, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebaseConfig';
import ChatService from '../../services/chatService';
import ShareService from '../../services/shareService';
import PDFService from '../../services/pdfService';
import { streamChatMessage } from '../../utils/api';

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
                console.warn('useChatMessages: FastAPI backend not connected.');
            }
        });

        return () => { /* cleanup */ };
    }, [currentSessionId, userId, setWsConnected]);

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
            
            // Save user message to Firebase
            const messageId = await ChatService.addMessage(userId, currentSessionId, "user", text, files);
            setCurrentMessageId(messageId);

            // Update session name if needed
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

            // Send to FastAPI backend with STREAMING
            try {
                const fileIds = files.filter(f => f.fileId).map(f => f.fileId);
                const effectiveMode = isWebSearch ? 'deepsearch' : chatMode;
                
                let fullResponse = '';
                
                // Use streaming API - token by token
                // PERSONALIZATION CONSTRAINT: Only applies to NORMAL mode
                const personalityToSend = (effectiveMode === 'normal' || chatMode === 'normal') ? activePersonality : null;
                const userSettings = userProfile?.settings || null;

                for await (const token of streamChatMessage(text, currentSessionId, userUniqueId || userId, effectiveMode, fileIds, personalityToSend, userSettings)) {
                    // Check if streaming was stopped
                    if (streamingMessageIdRef.current !== botMessageId) break;
                    
                    fullResponse += token;
                    
                    // Parse [INFO] block for searching status
                    let displayContent = fullResponse;
                    let isSearching = false;
                    let searchQuery = "";

                    if (fullResponse.startsWith('[INFO]')) {
                        const infoMatch = fullResponse.match(/^\[INFO\] Searching with: (.*?)\n+/);
                        if (infoMatch) {
                            // We have the info block, strip it
                            const cleanContent = fullResponse.substring(infoMatch[0].length);
                            if (!cleanContent.trim()) {
                                // Still searching (no real content yet)
                                isSearching = true;
                                searchQuery = infoMatch[1];
                                displayContent = "";
                            } else {
                                // Search done, content flowing
                                displayContent = cleanContent;
                            }
                        } else {
                            // Partial info block (haven't reached the newline yet)
                            isSearching = true;
                            displayContent = "";
                        }
                    }

                    // Update the bot message with accumulated content
                    setMessages(prev => prev.map(msg => 
                        msg.id === botMessageId 
                            ? { 
                                ...msg, 
                                content: displayContent,
                                isSearching: isSearching,
                                isGenerating: !isSearching && displayContent.length === 0,
                                searchQuery: isSearching ? searchQuery : null,
                                isStreaming: true
                              }
                            : msg
                    ));
                }
                
                // Mark streaming as complete
                setMessages(prev => prev.map(msg => 
                    msg.id === botMessageId 
                        ? { ...msg, isStreaming: false, isGenerating: false, isSearching: false }
                        : msg
                ));
                
                setBotTyping(false);
                setIsDeepSearchActive(false);
                setCurrentMessageId(null);
                streamingMessageIdRef.current = null;
                
                // Save bot response to Firebase
                if (fullResponse) {
                    await ChatService.addMessage(userId, currentSessionId, "bot", fullResponse);
                }
                
            } catch (error) {
                console.error('Error streaming message:', error);
                
                // Update bot message with error
                setMessages(prev => prev.map(msg => 
                    msg.id === botMessageId 
                        ? { 
                            ...msg, 
                            content: `⚠️ Error: ${error.message || 'Failed to get response from backend.'}`,
                            isError: true,
                            isStreaming: false
                        }
                        : msg
                ));
                
                setBotTyping(false);
                setIsDeepSearchActive(false);
                setCurrentMessageId(null);
                streamingMessageIdRef.current = null;
            }
        }
    }, [userId, currentSessionId, chatMode, userUniqueId, setMessages, setBotTyping, setCurrentMessageId, setIsDeepSearchActive, activePersonality]);

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
