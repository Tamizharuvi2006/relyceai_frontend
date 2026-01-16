import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ChatService from '../../services/chatService';

export default function useChatCore({
    currentSessionId,
    userId,
    externalChatMode,
    externalOnChatModeChange,
    userProfile
}) {
    const { currentUser: user } = useAuth();
    const { theme } = useTheme();

    // State
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [previousSessionId, setPreviousSessionId] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [wsConnected, setWsConnected] = useState(false);
    const [botTyping, setBotTyping] = useState(false);
    const [isReconnecting, setIsReconnecting] = useState(false);
    const [currentMessageId, setCurrentMessageId] = useState(null);
    const [userUniqueId, setUserUniqueId] = useState(null);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const [internalChatMode, setInternalChatMode] = useState('standard');
    const [fileUploads, setFileUploads] = useState({});

    // Refs
    const messagesRef = useRef(messages);
    const messagesContainerRef = useRef(null);

    // Derived state
    const chatMode = externalChatMode !== undefined ? externalChatMode : internalChatMode;
    const setChatMode = externalOnChatModeChange !== undefined ? externalOnChatModeChange : setInternalChatMode;

    useEffect(() => { messagesRef.current = messages; }, [messages]);

    // Group messages into pairs
    const messagePairs = useMemo(() => {
        const pairs = [];
        let currentPair = null;
        messages.forEach((msg) => {
            if (msg.role === 'user') {
                if (currentPair) pairs.push(currentPair);
                currentPair = { question: msg, answer: null, id: msg.id };
            } else if (msg.role === 'bot' && currentPair) {
                currentPair.answer = msg;
            }
        });
        if (currentPair) pairs.push(currentPair);
        return pairs;
    }, [messages]);

    // Fetch user's unique ID - optimized to use profile first
    useEffect(() => {
        // Use uniqueUserId from userProfile if available (already fetched)
        const effectiveUserId = userProfile?.uniqueUserId;
        if (effectiveUserId) {
            setUserUniqueId(effectiveUserId);
            ChatService.setUserId(effectiveUserId);
            return; // Skip Firebase call!
        }
        
        // Fallback: only fetch if not available in profile
        if (userId) {
            ChatService.getUserUniqueId(userId).then(uniqueId => {
                if (uniqueId) {
                    setUserUniqueId(uniqueId);
                    ChatService.setUserId(uniqueId);
                }
            }).catch(() => { /* silent */ });
        }
    }, [userProfile?.uniqueUserId, userId]);

    return {
        messages, setMessages,
        loading, setLoading,
        previousSessionId, setPreviousSessionId,
        isTransitioning, setIsTransitioning,
        wsConnected, setWsConnected,
        botTyping, setBotTyping,
        isReconnecting, setIsReconnecting,
        currentMessageId, setCurrentMessageId,
        userUniqueId, setUserUniqueId,
        showScrollToBottom, setShowScrollToBottom,
        chatMode, setChatMode,
        fileUploads, setFileUploads,
        theme, user, userProfile,
        messagesRef, messagesContainerRef,
        messagePairs
    };
}
