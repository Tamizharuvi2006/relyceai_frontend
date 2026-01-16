import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import ChatHistory from '../components/ChatHistory.jsx';
import ChatWindow from '../components/ChatWindow.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { LoadingSpinner } from '../../../components/loading';
import { generateChatPDF } from '../../../utils/pdfGenerator.js';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../../utils/firebaseConfig.js';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { X, PanelLeft, Menu, Share, MoreVertical, Copy, Settings as Gear, Download, FileText } from 'lucide-react';

// Simple Loading Skeleton using LoadingSpinner
const ChatSkeleton = () => (
  <div className="flex h-full w-full bg-zinc-900 items-center justify-center">
    <LoadingSpinner size="default" message="Loading..." />
  </div>
);

function AppContent() {
  const { currentUser: user, userProfile } = useAuth();
  const theme = 'dark'; // Enforce dark theme
  // Removed setTheme since we're removing the toggle
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]); // Add messages state
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [loadingChats, setLoadingChats] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const headerMenuButtonRef = useRef(null);
  const headerMenuRef = useRef(null);
  const [menuCoords, setMenuCoords] = useState(null);
  const [shareLoading, setShareLoading] = useState(false);

  // Chat mode state
  const [chatMode, setChatMode] = useState('standard');
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);
  const modeButtonRef = useRef(null);
  const modeDropdownRef = useRef(null);
  const [modeDropdownCoords, setModeDropdownCoords] = useState(null);

  // Set chat mode based on user's membership plan
  useEffect(() => {
    if (userProfile?.membership?.plan) {
      // Automatically set chat mode based on membership plan
      // Business plan users get Plus mode by default
      if (userProfile.membership.plan === 'business') {
        setChatMode('plus');
      } else if (userProfile.membership.plan === 'plus') {
        setChatMode('plus');
      } else {
        setChatMode('standard');
      }
    }
  }, [userProfile?.membership?.plan]);

  // Download menu state
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const downloadButtonRef = useRef(null);
  const downloadMenuRef = useRef(null);
  const [downloadMenuCoords, setDownloadMenuCoords] = useState(null);

  // Use ref to prevent unnecessary navigation calls

  // Use ref to prevent unnecessary navigation calls
  const isNavigatingRef = useRef(false);
  const lastUrlSessionRef = useRef(chatId);




  // Memoize chatSessions to prevent unnecessary sidebar re-renders - MUST be before any early returns
  const memoizedChatSessions = useMemo(() => {
    return chatSessions || [];
  }, [chatSessions?.length]);

  // Track URL changes to update lastUrlSessionRef
  useEffect(() => {
    if (chatId) {
      lastUrlSessionRef.current = chatId;
    }
  }, [chatId]);
  // Listen for close sidebar events from mobile
  useEffect(() => {
    const handleCloseSidebar = () => setShowSidebar(false);
    window.addEventListener('closeSidebar', handleCloseSidebar);
    return () => window.removeEventListener('closeSidebar', handleCloseSidebar);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!headerMenuOpen) return;
    const handler = (e) => {
      const insideMenu = headerMenuRef.current && headerMenuRef.current.contains(e.target);
      const onButton = headerMenuButtonRef.current && headerMenuButtonRef.current.contains(e.target);
      if (!insideMenu && !onButton) setHeaderMenuOpen(false);
    };
    const id = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener('mousedown', handler);
    };
  }, [headerMenuOpen]);

  // Close mode dropdown on outside click
  useEffect(() => {
    if (!modeDropdownOpen) return;
    const handler = (e) => {
      const insideDropdown = modeDropdownRef.current && modeDropdownRef.current.contains(e.target);
      const onButton = modeButtonRef.current && modeButtonRef.current.contains(e.target);
      if (!insideDropdown && !onButton) setModeDropdownOpen(false);
    };
    const id = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener('mousedown', handler);
    };
  }, [modeDropdownOpen]);

  // Close download menu on outside click
  useEffect(() => {
    if (!downloadMenuOpen) return;
    const handler = (e) => {
      const insideMenu = downloadMenuRef.current && downloadMenuRef.current.contains(e.target);
      const onButton = downloadButtonRef.current && downloadButtonRef.current.contains(e.target);
      if (!insideMenu && !onButton) setDownloadMenuOpen(false);
    };
    const id = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener('mousedown', handler);
    };
  }, [downloadMenuOpen]);

  // Add handleDownloadPDF function
  const handleDownloadPDF = async () => {
    if (!messages || messages.length === 0) {
      alert('No chat to download!');
      return;
    }

    try {
      const blob = await generateChatPDF(messages, {
        title: 'Chat Conversation',
        date: new Date(),
        participants: ['User', 'Relyce AI']
      });
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relyce-chat-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Add handleDownloadText function for exporting chat as text file
  const handleDownloadText = () => {
    if (!messages || messages.length === 0) {
      alert('No chat to download!');
      return;
    }

    try {
      // Format messages as text
      const textContent = messages.map(msg => {
        return `[${msg.role.toUpperCase()}] (${new Date(msg.timestamp?.toDate ? msg.timestamp.toDate() : msg.createdAt).toLocaleString()})\n${msg.content}\n`;
      }).join('\n');

      // Create blob and download
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relyce-chat-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating text file:', error);
      alert('Failed to generate text file. Please try again.');
    }
  };

  const handleSetCurrentSession = useCallback((id) => {
    // Same session? Just close sidebar
    if (currentSessionId === id) {
      setShowSidebar(false);
      return;
    }

    // ChatGPT-style: State-only update, NO navigation
    // This prevents component remounts and flashing
    setCurrentSessionId(id);
    setShowSidebar(false);

    // Silently update URL without triggering React Router re-render
    // This keeps URL in sync for sharing/bookmarking without causing flash
    window.history.replaceState(null, '', `/chat/${id}`);
  }, [currentSessionId]);

  // Share chat function - saves to sharedChats collection
  const handleShareChat = useCallback(async () => {
    if (!currentSessionId || !user || messages.length === 0) {
      alert('No messages to share!');
      return;
    }

    setShareLoading(true);
    try {
      // Generate unique share ID
      const shareId = crypto.randomUUID().slice(0, 8);
      
      // Get session name
      const currentSession = chatSessions.find(s => s.id === currentSessionId);
      const sessionName = currentSession?.name || 'Chat Conversation';
      
      // Save to sharedChats collection
      await addDoc(collection(db, 'sharedChats'), {
        shareId: shareId,
        originalSessionId: currentSessionId,
        ownerId: user.uid,
        title: sessionName,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp || msg.createdAt
        })),
        isPublic: true,
        sharedAt: serverTimestamp(),
        messageCount: messages.length
      });

      // Generate share URL
      const shareUrl = `${window.location.origin}/shared/${shareId}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      // Try native share if available
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Relyce AI Chat',
            text: 'Check out this AI chat conversation',
            url: shareUrl,
          });
        } catch (e) {
          // User cancelled or share failed, URL already copied
        }
      }
      
      alert(`Share link copied!\n${shareUrl}`);
    } catch (error) {
      console.error('Error sharing chat:', error);
      alert('Failed to share chat. Please try again.');
    } finally {
      setShareLoading(false);
    }
  }, [currentSessionId, user, messages, chatSessions]);

  const handleToggleSidebarExpanded = useCallback((expanded) => {
    setSidebarExpanded(expanded);
  }, []);

  const createNewSession = useCallback(async () => {
    if (!user) return;

    const newSessionId = crypto.randomUUID();
    
    // Update UI immediately for instant response
    setCurrentSessionId(newSessionId);
    setMessages([]); // Clear messages for fresh chat
    setShowSidebar(false);
    navigate(`/chat/${newSessionId}`, { replace: true });

    // Write to Firebase in background (non-blocking)
    const newSessionRef = doc(
      db,
      'users',
      user.uid,
      'chatSessions',
      newSessionId
    );
    
    setDoc(newSessionRef, {
      name: 'New Chat',
      createdAt: serverTimestamp(),
    }).catch(e => console.error('Failed to create session:', e));
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      setLoadingChats(true);
      const chatRef = collection(db, 'users', user.uid, 'chatSessions');
      const q = query(chatRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const sessions = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setChatSessions(sessions);

          if (snapshot.metadata.hasPendingWrites) return;

          // Only handle URL-based navigation when URL actually changes
          if (chatId && chatId !== currentSessionId && !isNavigatingRef.current) {
            const sessionExists = sessions.find((s) => s.id === chatId);
            if (sessionExists) {
              setCurrentSessionId(chatId);
            } else if (sessions.length > 0) {
              const firstSession = sessions[0];
              setCurrentSessionId(firstSession.id);
              navigate(`/chat/${firstSession.id}`, { replace: true });
            }
          } else if (!chatId && sessions.length > 0 && !currentSessionId) {
            // Only set default if no session is selected
            const firstSession = sessions[0];
            setCurrentSessionId(firstSession.id);
            navigate(`/chat/${firstSession.id}`, { replace: true });
          } else if (!chatId && sessions.length === 0) {
            createNewSession();
          }

          setLoadingChats(false);
        },
        (error) => {
          console.error('Error fetching chat sessions: ', error);
          setLoadingChats(false);
        }
      );

      return () => unsubscribe();
    } else {
      setChatSessions([]);
      setCurrentSessionId(null);
      setLoadingChats(false);
    }
  }, [user, createNewSession, chatId, navigate]); // Removed currentSessionId - it causes subscription recreation

  // Pass messages to ChatWindow and update local state when messages change
  const handleMessagesUpdate = useCallback((newMessages) => {
    setMessages(newMessages);
  }, []);

  if (loadingChats) return <ChatSkeleton />;

  return (
    <div className="flex h-screen w-full font-sans overflow-hidden transition-colors duration-300 bg-zinc-900 text-gray-200">
      {/* Content with sidebar and chat area */}
      <div className="flex h-full w-full">
        {/* Sidebar */}
        <ChatHistory
          chatSessions={memoizedChatSessions}
          currentSessionId={currentSessionId}
          setCurrentSessionId={handleSetCurrentSession}
          createNewSession={createNewSession}
          onToggleSidebar={handleToggleSidebarExpanded}
          className={`z-40 flex-shrink-0
          ${showSidebar ? 'fixed inset-y-0 left-0 w-3/5 max-w-xs md:relative md:w-auto' : 'hidden md:block'}`}
        />

        {/* Chat Window with Header */}
        <main className="flex-1 flex flex-col overflow-hidden relative min-w-0 w-full">
          {/* Header - sticky to prevent hiding on mobile scroll */}
          <div className="sticky top-0 backdrop-blur-sm z-50 border-b transition-colors bg-zinc-900/95 border-emerald-500/20">
            <div className="flex items-center justify-between py-3 px-4">
              {/* Left side */}
              <div className="flex items-center gap-3">
                {/* Mobile: Menu button */}
                <button
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      setShowSidebar(true);
                    } else {
                      setSidebarExpanded(!sidebarExpanded);
                    }
                  }}
                  className="p-2 rounded-lg transition md:hidden hover:bg-emerald-500/20 text-white"
                  title="Open menu"
                >
                  <Menu size={20} />
                </button>
                <div className="relative">
                  <button
                    ref={modeButtonRef}
                    onClick={() => {
                      const rect = modeButtonRef.current?.getBoundingClientRect();
                      setModeDropdownCoords(rect ? { top: rect.bottom + 8, left: rect.left } : { top: 56, left: 0 });
                      setModeDropdownOpen((o) => !o);
                    }}
                    className="flex items-center gap-2 px-3 py-1 rounded-lg transition text-sm font-medium hover:bg-emerald-500/20 text-white"
                  >
                    <span className="text-emerald-400">
                      {chatMode === 'plus' ? 'Business' : 'Generic'}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform ${modeDropdownOpen ? 'rotate-180' : ''} text-emerald-400`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {modeDropdownOpen && modeDropdownCoords && ReactDOM.createPortal(
                    <div
                      ref={modeDropdownRef}
                      style={{ position: 'fixed', top: modeDropdownCoords.top, left: modeDropdownCoords.left }}
                      className="border rounded-lg shadow-xl py-1 w-40 z-[1000] transition-colors duration-300 bg-zinc-800 border-emerald-500/30"
                    >
                      <button
                        onClick={() => { setChatMode('standard'); setModeDropdownOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2 transition text-left text-sm ${chatMode === 'standard'
                          ? 'bg-emerald-600 text-white'
                          : 'hover:bg-emerald-500/20 text-emerald-100'
                          }`}
                      >
                        Generic
                      </button>
                      <button
                        onClick={() => { setChatMode('plus'); setModeDropdownOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2 transition text-left text-sm ${chatMode === 'plus'
                          ? 'bg-emerald-600 text-white'
                          : 'hover:bg-emerald-500/20 text-emerald-100'
                          }`}
                      >
                        Business
                      </button>
                    </div>,
                    document.body
                  )}
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-2">
                {/* Download button */}

                <div className="relative">
                  <button
                    ref={downloadButtonRef}
                    onClick={() => {
                      const rect = downloadButtonRef.current?.getBoundingClientRect();
                      setDownloadMenuCoords(rect ? { top: rect.bottom + 8, left: rect.right - 192 } : { top: 56, left: 0 });
                      setDownloadMenuOpen((o) => !o);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium hover:bg-white/10 text-white hover:shadow-md"
                    title="Download chat"
                  >
                    <Download size={18} />
                    <span className="sm:inline hidden">Download</span>
                  </button>

                  {downloadMenuOpen && downloadMenuCoords && ReactDOM.createPortal(
                    <div
                      ref={downloadMenuRef}
                      style={{ position: 'fixed', top: downloadMenuCoords.top, left: Math.max(8, downloadMenuCoords.left) }}
                      className="border rounded-lg shadow-xl py-2 w-48 z-[1000] transition-colors duration-300 bg-[#18181b] border-emerald-500/30"
                    >
                      <button
                        onClick={() => { handleDownloadText(); setDownloadMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2 transition text-left text-sm hover:bg-emerald-500/20 text-white"
                      >
                        <FileText size={16} />
                        Download as Text
                      </button>
                      <button
                        onClick={() => { handleDownloadPDF(); setDownloadMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2 transition text-left text-sm hover:bg-emerald-500/20 text-white"
                      >
                        <FileText size={16} />
                        Download as PDF
                      </button>
                    </div>,
                    document.body
                  )}
                </div>
                <button
                  onClick={handleShareChat}
                  disabled={shareLoading}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition text-sm hover:bg-white/10 text-white ${shareLoading ? 'opacity-50 cursor-wait' : ''}`}
                >
                  <Share size={16} className={shareLoading ? 'animate-pulse' : ''} />
                  <span className="hidden sm:inline">{shareLoading ? 'Sharing...' : 'Share'}</span>
                </button>

                <button
                  ref={headerMenuButtonRef}
                  onClick={() => {
                    const rect = headerMenuButtonRef.current?.getBoundingClientRect();
                    setMenuCoords(rect ? { top: rect.bottom + 8, left: rect.right - 192 } : { top: 56, left: 0 });
                    setHeaderMenuOpen((o) => !o);
                  }}
                  className="p-2 rounded-lg transition hover:bg-white/10 text-white"
                >
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>
          </div>

          {headerMenuOpen && menuCoords && ReactDOM.createPortal(
            <div
              ref={headerMenuRef}
              style={{ position: 'fixed', top: menuCoords.top, left: Math.max(8, menuCoords.left) }}
              className="border rounded-lg shadow-xl py-2 w-48 z-[1000] transition-colors duration-300 bg-[#18181b] border-slate-700"
            >
              <button
                onClick={() => { setHeaderMenuOpen(false); navigate('/settings'); }}
                className="w-full flex items-center gap-3 px-4 py-2 transition text-left text-sm hover:bg-white/10 text-white"
              >
                <Gear size={16} />
                Settings
              </button>
              <button
                onClick={() => {
                  handleShareChat();
                  setHeaderMenuOpen(false);
                }}
                disabled={shareLoading}
                className="w-full flex items-center gap-3 px-4 py-2 transition text-left text-sm hover:bg-white/10 text-white"
              >
                <Share size={16} />
                {shareLoading ? 'Sharing...' : 'Share conversation'}
              </button>
              <button
                onClick={async () => {
                  if (!currentSessionId) return;
                  const shareUrl = `${window.location.origin}/chat/${currentSessionId}`;
                  await navigator.clipboard.writeText(shareUrl);
                  alert('Link copied to clipboard!');
                  setHeaderMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 transition text-left text-sm hover:bg-white/10 text-white"
              >
                <Copy size={16} />
                Copy direct link
              </button>
            </div>,
            document.body
          )}



          {!loadingChats && (
            <ChatWindow
              currentSessionId={currentSessionId}
              userId={user?.uid}
              chatSessions={memoizedChatSessions}
              sidebarExpanded={sidebarExpanded}
              onToggleSidebar={() => {
                if (window.innerWidth < 768) {
                  setShowSidebar(true);
                } else {
                  setSidebarExpanded(!sidebarExpanded);
                }
              }}
              onMessagesUpdate={handleMessagesUpdate}
              chatMode={chatMode}
              onChatModeChange={setChatMode}
            />
          )}
        </main>

        {/* Mobile overlay */}
        {showSidebar && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setShowSidebar(false)}
          />
        )}
      </div>
    </div>
  );
};

export default AppContent;