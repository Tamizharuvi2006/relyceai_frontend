import React, { memo, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { LogIn } from 'lucide-react';
import ChatInput from './ChatInput';
import useChat from '../../../hooks/useChat';
import ChatWindowHeader from './ChatWindowHeader';
import MessageComponent from './MessageComponent';
import TypingIndicator from './TypingIndicator';
import { LoadingSpinner } from '../../../components/loading';
import BotSkeletonLoader from './BotSkeletonLoader';
import logo from '../../../assets/logo.svg';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const inferContinueMeta = (content) => {
  if (!content) return null;
  if (/CONTINUE_AVAILABLE/i.test(content)) return null;
  if (!/```/.test(content)) return null;
  if (!/^##\s+[A-Za-z0-9_.-]+/m.test(content)) return null;

  const fileRegex = /^##\s+([A-Za-z0-9_.-]+)\s*$/gm;
  let lastFile = null;
  let lastIndex = -1;
  let match;
  while ((match = fileRegex.exec(content)) !== null) {
    lastFile = match[1];
    lastIndex = match.index + match[0].length;
  }
  if (!lastFile || lastIndex < 0) return null;

  const tail = content.slice(lastIndex);
  const saveRegex = new RegExp(`Save as:\\s*${escapeRegex(lastFile)}\\b`, "i");
  if (saveRegex.test(tail)) return null;

  const fenceCount = (tail.match(/```/g) || []).length;
  const unclosedFence = fenceCount % 2 === 1;
  const endsWithFence = /```\s*$/.test(content.trim());
  const looksIncomplete = unclosedFence || !endsWithFence;
  if (!looksIncomplete) return null;

  let mode = null;
  if (/\.(jsx|tsx)$/i.test(lastFile)) mode = "ui_react";
  else if (/\.(html|css|js)$/i.test(lastFile)) mode = "ui_demo_html";
  else return null;

  return { file: lastFile, mode };
};

const extractContinueMeta = (content) => {
  if (!content) return null;
  const match = content.match(/CONTINUE_AVAILABLE\s*(\{[\s\S]*?\})/i);
  if (!match) return inferContinueMeta(content);
  try {
    const meta = JSON.parse(match[1]);
    if (!meta || typeof meta.file !== "string" || typeof meta.mode !== "string") return null;
    const allowedModes = new Set(["ui_demo_html", "ui_react", "ui_implementation"]);
    if (!allowedModes.has(meta.mode)) return null;
    return {
      file: meta.file,
      mode: meta.mode,
      lines: Number.isFinite(meta.lines) ? meta.lines : undefined,
    };
  } catch {
    return null;
  }
};

const buildContinuePrompt = (meta, content) => {
  return [
    "Continue generating UI code.",
    `Mode: ${meta.mode}`,
    `File: ${meta.file}`,
    "Rules:",
    "- Continue from the exact last line of the previous output.",
    "- Do not repeat any previous content.",
    "- Continue the same file only.",
    "- Do not output any explanations or extra text.",
    "- If you must stop again, append a CONTINUE_AVAILABLE comment with updated metadata.",
    "",
    "<PREVIOUS_OUTPUT>",
    content || "",
    "</PREVIOUS_OUTPUT>",
  ].join("\n");
};

const ChatWindow = memo(function ChatWindow({
  currentSessionId,
  userId,
  chatSessions = [],
  showHeader = false,
  sidebarExpanded = true,
  onToggleSidebar,
  onMessagesUpdate,
  chatMode: externalChatMode,
  onChatModeChange: externalOnChatModeChange,
  personalities: externalPersonalities,
  activePersonality: externalActivePersonality,
  setActivePersonality: externalSetActivePersonality,
}) {
  // Enforce dark theme
  const theme = 'dark';
  const { currentUser: user, userProfile, loading: authLoading } = useAuth();

  // Use the custom chat hook for all logic
  const {
    // State
    messages,
    loading,
    wsConnected,
    botTyping,
    isReconnecting,
    showScrollToBottom,
    chatMode,
    isTransitioning,
    isDeepSearchActive,

    // Refs
    messagesContainerRef,

    // Handlers
    setChatMode,
    handleSend,
    handleStop,
    handleReconnect,
    scrollToBottom,
    copyMessageToClipboard,
    handleFileUpload,
    handleFileUploadComplete,
    handleDownloadPDF,
    handleShare,
    handleCopyLink,
    handleDelete,
    
    // Personality
    personalities,
    activePersonality,
    setActivePersonality,
  } = useChat({
    currentSessionId,
    userId,
    chatSessions,
    onMessagesUpdate,
    chatMode: externalChatMode,
    onChatModeChange: externalOnChatModeChange,
    activePersonality: externalActivePersonality,
    setActivePersonality: externalSetActivePersonality,
    personalities: externalPersonalities,
  });

  const handleContinue = useCallback((msg, meta) => {
    if (!msg || !meta) return;
    if (chatMode !== 'normal') return;
    const prompt = buildContinuePrompt(meta, msg.content);
    handleSend({ text: prompt });
  }, [chatMode, handleSend]);

  // ... (refs) ... 
  // (skipping unchanged code) since this is a view-replace tool, I need to be careful. 
  // I will just update the destructuring part first.

  // Refs for tracking messages and scroll behavior
  const prevMessagesLengthRef = useRef(messages.length);
  const isAutoScrollingRef = useRef(false);
  const lastUserMessageRef = useRef(null);
  const lastBotMessageRef = useRef(null);
  const prevSessionIdRef = useRef(currentSessionId);
  const isSessionSwitchingRef = useRef(false);

  // Track session changes to prevent welcome screen flash
  useEffect(() => {
    if (prevSessionIdRef.current !== currentSessionId && prevSessionIdRef.current !== null) {
      isSessionSwitchingRef.current = true;
      // Reset after messages load (short delay)
      const timer = setTimeout(() => {
        isSessionSwitchingRef.current = false;
      }, 500);
      return () => clearTimeout(timer);
    }
    prevSessionIdRef.current = currentSessionId;
  }, [currentSessionId]);

  // Helper function to scroll to a specific message element
  const scrollToMessage = (element) => {
    if (!messagesContainerRef.current || !element) return;

    const container = messagesContainerRef.current;
    const elementRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Calculate the scroll position to center the element
    const scrollTop = elementRect.top - containerRect.top + container.scrollTop;

    container.scrollTo({
      top: scrollTop,
      behavior: 'smooth'
    });
  };

  // Helper function to scroll a new user message to the top of visible area
  const scrollNewUserMessageToTop = () => {
    if (!messagesContainerRef.current || messages.length === 0) return;

    const container = messagesContainerRef.current;
    const lastMessage = messages[messages.length - 1];

    // Only for user messages
    if (lastMessage.role === 'user') {
      // Small delay to ensure the DOM has updated with the new message
      setTimeout(() => {
        if (container && lastUserMessageRef.current) {
          // Get the position of the last user message relative to the container
          const messageElement = lastUserMessageRef.current;
          const containerRect = container.getBoundingClientRect();
          const messageRect = messageElement.getBoundingClientRect();

          // Calculate the scroll position to show the message near the top
          const messageTop = messageRect.top - containerRect.top + container.scrollTop;
          const visibleHeight = container.clientHeight;

          // Scroll to position the message about 20% from the top of the visible area
          const targetScrollTop = Math.max(0, messageTop - (visibleHeight * 0.2));

          container.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
          });

          // Set auto-scrolling flag to true so bot responses follow
          isAutoScrollingRef.current = true;
        } else {
          // Fallback: scroll to bottom
          setTimeout(() => {
            if (container) {
              container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
              });
            }
          }, 50);
        }
      }, 100);
    }
  };

  // ============ ChatGPT-Style Scroll Behavior ============
  // Simple rule: Always scroll to bottom when new messages arrive or while bot is typing
  
  // Effect 1: Scroll to bottom when messages change
  useEffect(() => {
    if (!messagesContainerRef.current || messages.length === 0) return;
    
    const container = messagesContainerRef.current;
    const isNewMessage = messages.length > prevMessagesLengthRef.current;
    
    if (isNewMessage) {
      // For any new message (User or Bot), scroll to bottom
      isAutoScrollingRef.current = true;
      
      // Use requestAnimationFrame to ensure the DOM has updated
      requestAnimationFrame(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      });
    }
    
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  // Effect 2: Keep scrolling while bot is typing (for streaming effect)
  useEffect(() => {
    if (!messagesContainerRef.current || !botTyping || !isAutoScrollingRef.current) return;

    const container = messagesContainerRef.current;
    
    // Initial scroll when typing starts
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth'
    });

    // Keep following the bottom while streaming
    const scrollInterval = setInterval(() => {
      if (container && isAutoScrollingRef.current) {
        // More aggressive near-bottom check
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
        if (isNearBottom) {
          container.scrollTop = container.scrollHeight;
        }
      }
    }, 100);

    return () => clearInterval(scrollInterval);
  }, [botTyping]);

  // Effect 3: Reset auto-scroll flag when user manually scrolls up
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      if (!isNearBottom && !botTyping) {
        isAutoScrollingRef.current = false;
      } else if (isNearBottom) {
        isAutoScrollingRef.current = true;
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [botTyping]);

  // If still loading auth state, show a loading indicator
  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-900">
        <LoadingSpinner size="default" message="Loading..." />
      </div>
    );
  }

  // If user is not authenticated, show a sign in prompt
  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <LogIn size={48} className="mx-auto text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-white">
            Sign in required
          </h2>
          <p className="mb-6 text-slate-400">
            Please sign in to access the chat
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Use the loading animation hook - simplified approach
  const showTypingAnimation = botTyping;

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full font-sans overflow-hidden relative transition-colors duration-300 bg-[#0f0f10]">
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fadeIn 0.2s ease-out forwards;
          }
          
          /* Smooth chat transition for session switching */
          .chat-messages-container {
            transition: none;
          }
          .chat-messages-container.transitioning {
            opacity: 1;
          }
          
          /* Mobile input container styles */
          @media (max-width: 768px) {
            .mobile-input-container {
              padding: 0 !important;
              border-top: none !important;
            }
            /* Add extra padding at the bottom of messages container on mobile */
            .mobile-messages-container {
              padding-bottom: 100px !important;
            }
          }
          
          /* Ensure user messages have proper max width on desktop */
          @media (min-width: 769px) {
            .user-message-desktop {
              max-width: 60%;
            }
          }
          
          /* Custom scrollbar styles */
          .zeto-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          
          .zeto-scrollbar::-webkit-scrollbar-track {
            background: #18181b; /* dark theme scrollbar track */
            border-left: 3px solid #003925;
          }
          
          .zeto-scrollbar::-webkit-scrollbar-thumb {
            background: #005a3e;
            border-radius: 4px;
            border: none;
          }
          
          .zeto-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #007a55;
          }
          
          /* Firefox scrollbar */
          .zeto-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #005a3e #18181b; /* thumb color, track color */
          }
          
          /* Mobile viewport fixes for keyboard */
          @supports (height: 100dvh) {
            .mobile-full-height {
              height: 100dvh;
            }
          }
          
          /* Ensure header stays visible on mobile when keyboard opens */
          @media (max-width: 768px) {
            .mobile-sticky-header {
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              right: 0 !important;
              z-index: 100 !important;
            }
            
            .mobile-chat-container {
              padding-top: 56px !important; /* Space for fixed header */
            }
            
            /* Fix iOS keyboard push behavior */
            .mobile-input-fixed {
              position: fixed !important;
              bottom: 0 !important;
              left: 0 !important;
              right: 0 !important;
              padding-bottom: env(safe-area-inset-bottom, 0) !important;
            }
          }
        `}
      </style>

      {/* Transparent Header */}
      {showHeader && (
        <ChatWindowHeader
          onToggleSidebar={onToggleSidebar}
          sidebarExpanded={sidebarExpanded}
          currentSessionId={currentSessionId}
          userId={userId}
          userUniqueId={null} // This would be fetched in the hook
          messages={messages}
          theme={theme}
          chatMode={chatMode}
          onChatModeChange={setChatMode}
          onDownloadPDF={handleDownloadPDF}
          onShare={handleShare}
          onCopyLink={handleCopyLink}
          onDelete={handleDelete}
          personalities={personalities}
          activePersonality={activePersonality}
          setActivePersonality={setActivePersonality}
        />
      )}

      <div
        ref={messagesContainerRef}
        className={`flex-1 overflow-y-auto overflow-x-hidden smooth-scroll relative pb-40 mobile-messages-container pt-[60px] md:pt-0 bg-zinc-900 chat-messages-container ${isTransitioning ? 'transitioning' : ''}`}
      >
        {/* Loading spinner removed - using only the auth loading spinner */}
        {/* Only show empty state when truly empty and not transitioning or switching sessions */}
        {!loading && !isTransitioning && !isSessionSwitchingRef.current && messages.length === 0 && (
          <div className="flex items-center justify-center h-full overflow-x-hidden">
            <div className="text-center max-w-md px-4">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center">
                  <img src={logo} alt="Relyce AI" className="w-[100%] h-[100%] rounded-[50%]" />
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-1 text-white">
                Hello, <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  {user?.displayName?.split(' ')[0] || 'there'}
                </span>
              </h1>
              <p className="text-lg font-medium text-gray-300 mb-6">
                Welcome to Relyce AI
              </p>
              <div className="flex flex-col gap-2">
                <div className="text-left bg-zinc-800 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-200">Try asking:</p>
                  <ul className="mt-1 text-sm text-gray-400 list-disc list-inside space-y-1">
                    <li>How can I improve my business strategy?</li>
                    <li>What are the latest market trends in my industry?</li>
                    <li>Can you analyze my business proposal?</li>
                    <li>Help me understand financial forecasting</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Always show messages if they exist - prevents flash during loading/transitions */}
        {messages.length > 0 && (
          <div className="max-w-4xl mx-auto w-full px-4 py-6 overflow-x-hidden">
            {messages.map((msg, index) => {
              const continueMeta = chatMode === 'normal' ? extractContinueMeta(msg.content) : null;
              const thinkingVisibility = userProfile?.settings?.personalization?.thinkingVisibility || 'auto';
              return (
              <MessageComponent
                key={msg.id}
                ref={(el) => {
                  if (el) {
                    if (msg.role === 'user') lastUserMessageRef.current = el;
                    if (index === messages.length - 1 && msg.role === 'bot') lastBotMessageRef.current = el;
                  }
                }}
                msg={msg}
                index={index}
                theme={theme}
                chatMode={chatMode}
                onCopyMessage={copyMessageToClipboard}
                onContinue={handleContinue}
                continueMeta={continueMeta}
                isLastMessage={index === messages.length - 1}
                thinkingVisibility={thinkingVisibility}
              />
              );
            })}
            
          </div>
        )}

        {/* ChatGPT-style scroll spacer */}
        <div className="h-[140px] w-full flex-shrink-0" aria-hidden="true" />

        {/* Scroll to bottom button - Side panel version for both mobile and desktop */}
        {showScrollToBottom && (
          <button
            onClick={scrollToBottom}
            className="fixed top-1/2 -translate-y-1/2 -right-2 p-2 rounded-l-lg shadow-lg z-10 transition-all duration-300 bg-emerald-600 text-white hover:bg-emerald-700"
            aria-label="Scroll to bottom"
            style={{ transform: 'translateY(-50%)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        )}
      </div>

      {/* Improved chat input container with overlay positioning */}
      <div className="absolute bottom-0 left-0 right-0 p-1 backdrop-blur-sm z-20 mobile-input-container mobile-input-fixed bg-zinc-900/90">
        <div className="max-w-5xl mx-auto">
          <ChatInput
            onSend={handleSend}
            onFileUpload={handleFileUpload}
            onFileUploadComplete={handleFileUploadComplete}
            wsConnected={wsConnected}
            botTyping={botTyping}
            isReconnecting={isReconnecting}
            onReconnect={handleReconnect}
            onStop={handleStop}
            sessionId={currentSessionId}
            chatMode={chatMode}
          />
        </div>
      </div>
    </div>
  );
});

export default ChatWindow;
