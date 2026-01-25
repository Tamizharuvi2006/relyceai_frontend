import React, { useState, useEffect, useRef, useMemo, memo, useCallback } from "react";
import ReactDOM from "react-dom";
import { useAuth } from "../../../context/AuthContext.jsx";
import { useTheme } from "../../../context/ThemeContext.jsx";
import { useNavigate } from "react-router-dom";
import { LogIn, Plus, MessageSquare, Settings, LogOut, MoreVertical, FilePenLine, Trash2, AlertTriangle, Menu, Share, Copy, X, Search, Pin, GripVertical } from "lucide-react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../utils/firebaseConfig.js";

// Transparent Header Component
const TransparentHeader = ({ onToggleSidebar, isSidebarExpanded, currentSessionId }) => {
  const { theme } = useTheme();
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const headerMenuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target)) {
        setHeaderMenuOpen(false);
      }
    };
    if (headerMenuOpen) {
      document.addEventListener('mousedown', handler);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [headerMenuOpen]);

  const handleShare = () => {
    const currentUrl = `${window.location.origin}/chat/${currentSessionId}`;
    if (navigator.share) {
      navigator.share({
        title: 'Relyce AI Chat',
        text: 'Check out this AI chat conversation',
        url: currentUrl,
      });
    } else {
      navigator.clipboard.writeText(currentUrl);
      alert('Chat link copied to clipboard!');
    }
    setHeaderMenuOpen(false);
  };

  const handleCopyLink = () => {
    const currentUrl = `${window.location.origin}/chat/${currentSessionId}`;
    navigator.clipboard.writeText(currentUrl);
    alert('Chat link copied to clipboard!');
    setHeaderMenuOpen(false);
  };

  const handleDelete = () => {
    if (confirm('Delete this conversation?')) {
      // Add delete functionality here
      console.log('Delete conversation');
    }
    setHeaderMenuOpen(false);
  };

  return (
    <div className={`absolute top-0 left-0 right-0 z-50 backdrop-blur-sm border-b ${theme === 'dark'
      ? 'bg-black/10 border-emerald-500/20'
      : 'bg-white/10 border-emerald-200'
      }`}>
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className={`p-2 rounded-lg transition ${theme === 'dark'
              ? 'hover:bg-white/10 text-white'
              : 'hover:bg-black/10 text-black'
              }`}
            title={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <Menu size={20} />
          </button>
          <img src="/logo.svg" alt="Relyce AI" className="w-10 h-10 object-contain" />
          <span className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-black'
            }`}>Relyce AI</span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition text-sm ${theme === 'dark'
              ? 'hover:bg-white/10 text-white'
              : 'hover:bg-black/10 text-black'
              }`}
          >
            <Share size={16} />
            <span>Share</span>
          </button>

          <div className="relative" ref={headerMenuRef}>
            <button
              onClick={() => setHeaderMenuOpen(!headerMenuOpen)}
              className={`p-2 rounded-lg transition ${theme === 'dark'
                ? 'hover:bg-white/10 text-white'
                : 'hover:bg-black/10 text-black'
                }`}
            >
              <MoreVertical size={20} />
            </button>

            {headerMenuOpen && (
              <div className={`absolute top-12 right-0 border rounded-lg shadow-xl py-2 w-48 z-50 ${theme === 'dark'
                ? 'bg-slate-800 border-emerald-500/30'
                : 'bg-white border-emerald-200'
                }`}>
                <button
                  onClick={handleShare}
                  className={`w-full flex items-center gap-3 px-4 py-2 transition text-left text-sm ${theme === 'dark'
                    ? 'hover:bg-emerald-500/20 text-white'
                    : 'hover:bg-emerald-100 text-emerald-800'
                    }`}
                >
                  <Share size={16} />
                  Share conversation
                </button>
                <button
                  onClick={handleCopyLink}
                  className={`w-full flex items-center gap-3 px-4 py-2 transition text-left text-sm ${theme === 'dark'
                    ? 'hover:bg-emerald-500/20 text-white'
                    : 'hover:bg-emerald-100 text-emerald-800'
                    }`}
                >
                  <Copy size={16} />
                  Copy link
                </button>
                <button
                  onClick={handleDelete}
                  className={`w-full flex items-center gap-3 px-4 py-2 transition text-left text-sm ${theme === 'dark'
                    ? 'hover:bg-emerald-500/20 text-emerald-400'
                    : 'hover:bg-emerald-100 text-emerald-600'
                    }`}
                >
                  <Trash2 size={16} />
                  Delete conversation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Floating Dropdown Menu Component (rendered in a Portal)
const DropdownMenu = ({ coords, session, onRename, onDelete, onPin, onClose, theme }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const menuStyle = {
    position: 'absolute',
    top: `${coords.bottom + 4}px`,
    left: `${coords.right - 144}px`,
  };

  return ReactDOM.createPortal(
    <div ref={menuRef} style={menuStyle} className={`border rounded-lg shadow-xl z-[999] w-36 overflow-hidden animate-fade-in-fast ${theme === 'dark'
      ? 'bg-[#18181b] border-emerald-500/30'
      : 'bg-white border-emerald-200'
      }`}>
      <button onClick={onPin} className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition ${theme === 'dark'
        ? 'hover:bg-emerald-500/10 text-slate-200'
        : 'hover:bg-emerald-100 text-slate-800'
        }`}>
        <Pin size={14} className={session.isPinned ? 'text-emerald-400' : ''} /> 
        {session.isPinned ? 'Unpin' : 'Pin'}
      </button>
      <button onClick={onRename} className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition ${theme === 'dark'
        ? 'hover:bg-emerald-500/10 text-slate-200'
        : 'hover:bg-emerald-100 text-slate-800'
        }`}>
        <FilePenLine size={14} /> Rename
      </button>
      <button onClick={onDelete} className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition ${theme === 'dark'
        ? 'hover:bg-emerald-500/20 text-emerald-400'
        : 'hover:bg-emerald-100 text-emerald-600'
        }`}>
        <Trash2 size={14} /> Delete
      </button>
    </div>,
    document.body
  );
};

// Custom Modal for Delete Confirmation
const DeleteConfirmationModal = ({ session, onConfirm, onCancel, theme }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-fast" onClick={onCancel}>
      <div ref={modalRef} className={`border rounded-xl shadow-2xl p-6 max-w-sm w-full text-center ${theme === 'dark'
        ? 'bg-slate-800 border-emerald-500/30'
        : 'bg-white border-emerald-200'
        }`} onClick={e => e.stopPropagation()}>
        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center border ${theme === 'dark'
          ? 'bg-emerald-500/10 border-emerald-500/20'
          : 'bg-emerald-100 border-emerald-200'
          }`}>
          <Trash2 className={theme === 'dark' ? "text-emerald-400" : "text-emerald-600"} size={24} />
        </div>
        <h2 className={`text-xl font-bold mt-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>Delete Chat?</h2>
        <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
          }`}>
          Are you sure you want to delete "<span className={`font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
            }`}>{session.name}</span>"? This cannot be undone.
        </p>
        <div className="flex gap-4 mt-6">
          <button onClick={onCancel} className={`w-full py-2.5 rounded-lg font-semibold transition ${theme === 'dark'
            ? 'bg-slate-700 hover:bg-slate-600 text-white'
            : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
            }`}>Cancel</button>
          <button onClick={onConfirm} className={`w-full py-2.5 rounded-lg font-semibold transition shadow-lg ${theme === 'dark'
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
            : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20'
            }`}>Delete</button>
        </div>
      </div>
    </div>
  );
};

// Simplified User Profile Component
const UserProfile = memo(({ user, userProfile, userName, isExpanded, auth, navigate, theme }) => {
  // Prioritize custom uploaded photo over Google photo
  const photoURL = userProfile?.photoURL || user?.photoURL;

  const userIcon = photoURL ? (
    <img
      src={photoURL}
      alt={userName}
      className="w-7 h-7 rounded-full object-cover"
      loading="lazy"
      onError={(e) => {
        // Replace with fallback div if image fails
        const fallback = document.createElement('div');
        fallback.className = `w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${theme === 'dark' ? 'bg-slate-700 text-emerald-400' : 'bg-slate-200 text-emerald-600'
          }`;
        fallback.textContent = userName.charAt(0).toUpperCase();
        e.target.parentNode.replaceChild(fallback, e.target);
      }}
    />
  ) : (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${theme === 'dark' ? 'bg-slate-700 text-emerald-400' : 'bg-slate-200 text-emerald-600'
      }`}>
      {userName.charAt(0).toUpperCase()}
    </div>
  );

  return (
    <>
      <SidebarItem
        icon={userIcon}
        text={userName}
        isExpanded={isExpanded}
        theme={theme}
      />
      <SidebarItem
        icon={<Settings size={20} />}
        text="Settings"
        isExpanded={isExpanded}
        onClick={() => navigate('/settings')}
        theme={theme}
      />

      {user ? (
        <SidebarItem
          icon={<LogOut size={20} className={theme === 'dark' ? "text-red-400/80" : "text-red-600/80"} />}
          text={<span className={theme === 'dark' ? "text-red-400/80" : "text-red-600/80"}>Sign Out</span>}
          onClick={() => auth.signOut()}
          isExpanded={isExpanded}
          theme={theme}
        />
      ) : (
        <SidebarItem
          icon={<LogIn size={20} className={theme === 'dark' ? "text-emerald-400/80" : "text-emerald-600/80"} />}
          text={<span className={theme === 'dark' ? "text-emerald-400/80" : "text-emerald-600/80"}>Sign In</span>}
          onClick={() => navigate('/login')}
          isExpanded={isExpanded}
          theme={theme}
        />
      )}
    </>
  );
}, (prevProps, nextProps) => {
  // Only re-render UserProfile if these specific props change
  return (
    prevProps.isExpanded === nextProps.isExpanded &&
    prevProps.userName === nextProps.userName &&
    prevProps.user?.photoURL === nextProps.user?.photoURL &&
    prevProps.userProfile?.photoURL === nextProps.userProfile?.photoURL &&
    prevProps.user?.uid === nextProps.user?.uid &&
    prevProps.theme === nextProps.theme
  );
});

// Memoized SidebarItem component
const SidebarItem = memo(({ icon, text, onClick, isExpanded, isActive = false, theme }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center ${isExpanded ? 'gap-3 px-2' : 'justify-center px-0'} py-2 rounded-lg text-sm font-semibold ${isActive
      ? (theme === 'dark' ? "bg-emerald-500/20 text-white" : "bg-emerald-100 text-emerald-800")
      : (theme === 'dark' ? "text-slate-300 hover:bg-zinc-800" : "text-slate-700 hover:bg-slate-200")
      }`}
  >
    <div className="flex-shrink-0">{icon}</div>
    {isExpanded && (
      <span className="whitespace-nowrap opacity-100">{text}</span>
    )}
  </button>
));

const ZetoChatHistory = memo(function ZetoChatHistory({
  chatSessions,
  currentSessionId,
  setCurrentSessionId,
  createNewSession,
  showHeader = false,
  onToggleSidebar,
  className = ""
}) {
  const { theme } = useTheme();
  const { currentUser: user, userProfile, auth, loading } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true); // Click to expand/collapse
  const navigate = useNavigate();
  const [menuSession, setMenuSession] = useState(null);
  const [menuCoords, setMenuCoords] = useState(null);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pinned chats - stored in localStorage
  const [pinnedIds, setPinnedIds] = useState(() => {
    try {
      const stored = localStorage.getItem(`pinnedChats_${user?.uid}`);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  
  // Custom order for unpinned chats - stored in localStorage
  const [customOrder, setCustomOrder] = useState(() => {
    try {
      const stored = localStorage.getItem(`chatOrder_${user?.uid}`);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  
  // Drag state
  const [draggedSessionId, setDraggedSessionId] = useState(null);
  const [dragOverSessionId, setDragOverSessionId] = useState(null);

  // If still loading auth state, show a loading indicator
  if (loading) {
    return (
      <div className={`hidden md:flex flex-col h-full border-r transition-colors ${theme === 'dark'
        ? 'bg-zinc-900 border-emerald-500/20'
        : 'bg-white border-emerald-200'
        } ${className}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show a sign in prompt
  if (!user) {
    return (
      <div className={`hidden md:flex flex-col h-full border-r transition-colors ${theme === 'dark'
        ? 'bg-zinc-900 border-emerald-500/20'
        : 'bg-white border-emerald-200'
        } ${className}`}>
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <div className="mb-4">
            <LogIn size={48} className={theme === 'dark' ? "text-emerald-400" : "text-emerald-600"} />
          </div>
          <h2 className={`text-xl font-bold mb-2 ${theme === 'dark' ? "text-white" : "text-slate-900"}`}>
            Sign in required
          </h2>
          <p className={`mb-6 ${theme === 'dark' ? "text-slate-400" : "text-slate-600"}`}>
            Please sign in to access your chat history
          </p>
          <button
            onClick={() => navigate('/login')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${theme === 'dark'
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
              : 'bg-emerald-500 hover:bg-emerald-400 text-white'
              }`}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const handleToggleSidebar = useCallback(() => {
    setIsExpanded(!isExpanded);
    if (onToggleSidebar) {
      onToggleSidebar(!isExpanded);
    }
  }, [isExpanded, onToggleSidebar]);

  const userName = user ? user.displayName || user.email?.split("@")[0] : "Guest";

  const sortedSessions = useMemo(() => {
    const filtered = [...chatSessions].filter(session =>
      session.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return filtered.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }, [chatSessions, searchQuery]);
  
  // Separate pinned and unpinned sessions
  const pinnedSessions = useMemo(() => {
    return sortedSessions.filter(s => pinnedIds.includes(s.id));
  }, [sortedSessions, pinnedIds]);
  
  const unpinnedSessions = useMemo(() => {
    const unpinned = sortedSessions.filter(s => !pinnedIds.includes(s.id));
    // Apply custom order if available
    if (customOrder.length > 0) {
      return unpinned.sort((a, b) => {
        const aIdx = customOrder.indexOf(a.id);
        const bIdx = customOrder.indexOf(b.id);
        if (aIdx === -1 && bIdx === -1) return 0;
        if (aIdx === -1) return 1;
        if (bIdx === -1) return -1;
        return aIdx - bIdx;
      });
    }
    return unpinned;
  }, [sortedSessions, pinnedIds, customOrder]);

  const handleRename = useCallback(async (sessionId, newName) => {
    if (!newName || newName.trim() === "") {
      setEditingSessionId(null);
      return;
    }
    const ref = doc(db, "users", user.uid, "chatSessions", sessionId);
    await updateDoc(ref, { name: newName.trim() });
    setEditingSessionId(null);
  }, [user]);

  const handleDelete = useCallback(async () => {
    if (!sessionToDelete) return;
    const ref = doc(db, "users", user.uid, "chatSessions", sessionToDelete.id);
    await deleteDoc(ref);
    if (currentSessionId === sessionToDelete.id) {
      const nextSession = sortedSessions.find(s => s.id !== sessionToDelete.id);
      setCurrentSessionId(nextSession ? nextSession.id : null);
    }
    setSessionToDelete(null);
  }, [sessionToDelete, user, currentSessionId, sortedSessions, setCurrentSessionId]);

  const handleMenuClick = useCallback((e, session) => {
    e.stopPropagation();
    if (menuSession?.id === session.id) {
      setMenuSession(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuCoords({ top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right });
      setMenuSession(session);
    }
  }, [menuSession]);
  
  // Handle pin/unpin
  const handlePin = useCallback((sessionId) => {
    setPinnedIds(prev => {
      const newPinned = prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId];
      localStorage.setItem(`pinnedChats_${user?.uid}`, JSON.stringify(newPinned));
      return newPinned;
    });
    setMenuSession(null);
  }, [user]);
  
  // Handle drag start
  const handleDragStart = (e, sessionId) => {
    setDraggedSessionId(sessionId);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  // Handle drag over
  const handleDragOver = (e, sessionId) => {
    e.preventDefault();
    if (sessionId !== draggedSessionId) {
      setDragOverSessionId(sessionId);
    }
  };
  
  // Handle drop - reorder unpinned sessions
  const handleDrop = (e, targetSessionId) => {
    e.preventDefault();
    if (!draggedSessionId || draggedSessionId === targetSessionId) return;
    
    // Only allow reorder for unpinned sessions
    if (pinnedIds.includes(draggedSessionId) || pinnedIds.includes(targetSessionId)) return;
    
    const unpinnedIds = unpinnedSessions.map(s => s.id);
    const fromIdx = unpinnedIds.indexOf(draggedSessionId);
    const toIdx = unpinnedIds.indexOf(targetSessionId);
    
    if (fromIdx !== -1 && toIdx !== -1) {
      const newOrder = [...unpinnedIds];
      newOrder.splice(fromIdx, 1);
      newOrder.splice(toIdx, 0, draggedSessionId);
      setCustomOrder(newOrder);
      localStorage.setItem(`chatOrder_${user?.uid}`, JSON.stringify(newOrder));
    }
    
    setDraggedSessionId(null);
    setDragOverSessionId(null);
  };
  
  const handleDragEnd = () => {
    setDraggedSessionId(null);
    setDragOverSessionId(null);
  };

  return (
    <>
      <div
        className={`flex flex-col h-full flex-shrink-0 transition-all duration-300 ${isExpanded ? "w-72" : "w-16"} ${className} relative overflow-hidden ${theme === 'dark'
          ? 'bg-zinc-900 text-slate-200 border-r border-emerald-500/20'
          : 'bg-white text-slate-800 border-r border-emerald-200'
          }`}>
        <div className="flex flex-col gap-2 flex-shrink-0 px-3 pt-3">
          {/* Mobile close button */}
          <div className="md:hidden flex justify-end mb-2">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('closeSidebar'))}
              className={`p-1 rounded-full ${theme === 'dark'
                ? 'text-gray-400 hover:text-white hover:bg-zinc-800'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                }`}
              title="Close Sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Collapse button and logo */}
          <div className={`flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} mb-3`}>
            {isExpanded && (
              <div className="flex items-center gap-2">
                <img src="/logo.svg" alt="Relyce AI" className="w-8 h-8 object-contain" />
                <span className={theme === 'dark' ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}>Relyce AI</span>
              </div>
            )}
            <button
              onClick={handleToggleSidebar}
              className={`p-2 rounded-lg flex-shrink-0 ${theme === 'dark'
                ? 'text-slate-300 hover:bg-slate-700'
                : 'text-slate-600 hover:bg-slate-200'
                }`}
              title={isExpanded ? "Pin sidebar open" : "Expand sidebar"}
            >
              <Menu size={20} />
            </button>
          </div>

          {/* New Chat Button */}
          <SidebarItem
            icon={<Plus size={18} />}
            text="New Chat"
            onClick={createNewSession}
            isExpanded={isExpanded}
            theme={theme}
          />

          {/* Search - Expanded: input field, Collapsed: icon */}
          {isExpanded ? (
            <div className="relative mb-2">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search size={16} className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} />
              </div>
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full rounded-lg py-2 pl-10 pr-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition ${theme === 'dark'
                  ? 'bg-zinc-800 border border-emerald-500/30 text-white'
                  : 'bg-slate-100 border border-emerald-200 text-slate-800'
                  }`}
              />
            </div>
          ) : (
            <SidebarItem
              icon={<Search size={18} />}
              text="Search"
              onClick={() => {/* Could open search modal in collapsed mode */ }}
              isExpanded={isExpanded}
              theme={theme}
            />
          )}
        </div>

        {/* Chat History - Scrollable area */}
        {/* Using calc to subtract header (~160px) and footer (~130px) heights */}
        <style>{`
          .chat-item {
            transition: background-color 0.15s ease-out, color 0.15s ease-out;
          }
          .chat-list {
            will-change: auto;
          }
          .chat-history-scroll::-webkit-scrollbar {
            width: 6px;
          }
          .chat-history-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .chat-history-scroll::-webkit-scrollbar-thumb {
            background: #005a3e;
            border-radius: 3px;
          }
          .chat-history-scroll::-webkit-scrollbar-thumb:hover {
            background: #007a55;
          }
          .chat-history-scroll {
            scrollbar-width: thin;
            scrollbar-color: #005a3e transparent;
          }
        `}</style>
        <div 
          className={`chat-history-scroll overflow-y-auto overflow-x-hidden px-3 py-2 ${isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"}`} 
          style={{ 
            height: 'calc(100vh - 300px)',
            maxHeight: 'calc(100vh - 300px)'
          }}
        >
          {/* Pinned Section */}
          {pinnedSessions.length > 0 && (
            <>
              <h3 className={`px-2 text-xs font-semibold tracking-wider mb-2 flex items-center gap-1 ${theme === 'dark' ? 'text-emerald-400/70' : 'text-emerald-600/70'}`}>
                <Pin size={12} /> Pinned
              </h3>
              <ul className="space-y-1 text-sm chat-list mb-4">
                {pinnedSessions.map((session) => (
                  <li key={session.id} className="relative group">
                    <div
                      onClick={() => !editingSessionId && setCurrentSessionId(session.id)}
                      className={`chat-item w-full flex items-center justify-between px-2 py-2 rounded-lg cursor-pointer ${session.id === currentSessionId
                        ? (theme === 'dark' ? 'bg-emerald-500/20 text-white' : 'bg-emerald-100 text-emerald-800')
                        : (theme === 'dark' ? 'hover:bg-zinc-800 text-slate-300' : 'hover:bg-slate-200 text-slate-700')
                      }`}
                    >
                      <span className="truncate flex-1 flex items-center">
                        <Pin size={12} className="mr-2 text-emerald-400 flex-shrink-0" />
                        {session.name}
                      </span>
                      {isExpanded && !editingSessionId && (
                        <button
                          onClick={(e) => handleMenuClick(e, session)}
                          className={`p-1 rounded-md ${window.innerWidth < 768 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} ${theme === 'dark' ? 'hover:bg-emerald-500/20' : 'hover:bg-emerald-100'}`}
                        >
                          <MoreVertical size={16} />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Recent Section - Draggable */}
          <h3 className={`px-2 text-xs font-semibold tracking-wider mb-2 ${theme === 'dark' ? 'text-emerald-400/70' : 'text-emerald-600/70'}`}>Recent</h3>
          <ul className="space-y-1 text-sm chat-list">
            {unpinnedSessions.map((session) => (
              <li 
                key={session.id} 
                className={`relative group ${dragOverSessionId === session.id ? 'border-t-2 border-emerald-500' : ''}`}
                draggable={!editingSessionId}
                onDragStart={(e) => handleDragStart(e, session.id)}
                onDragOver={(e) => handleDragOver(e, session.id)}
                onDrop={(e) => handleDrop(e, session.id)}
                onDragEnd={handleDragEnd}
              >
                <div
                  onClick={() => !editingSessionId && setCurrentSessionId(session.id)}
                  className={`chat-item w-full flex items-center justify-between px-2 py-2 rounded-lg ${editingSessionId === session.id
                    ? (theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200')
                    : 'cursor-pointer'
                    } ${session.id === currentSessionId
                      ? (theme === 'dark' ? 'bg-emerald-500/20 text-white' : 'bg-emerald-100 text-emerald-800')
                      : (theme === 'dark' ? 'hover:bg-zinc-800 text-slate-300' : 'hover:bg-slate-200 text-slate-700')
                    } ${draggedSessionId === session.id ? 'opacity-50' : ''}`}
                >
                  {/* Drag handle */}
                  <GripVertical size={14} className={`mr-1 flex-shrink-0 cursor-grab ${theme === 'dark' ? 'text-zinc-600 group-hover:text-zinc-400' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  
                  {editingSessionId === session.id ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => handleRename(session.id, editValue)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(session.id, editValue);
                        if (e.key === 'Escape') setEditingSessionId(null);
                      }}
                      autoFocus
                      className={`w-full bg-transparent outline-none flex-1 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}
                    />
                  ) : (
                    <span className="truncate flex-1">
                      <MessageSquare size={14} className="inline mr-2 opacity-60" />
                      {session.name}
                    </span>
                  )}
                  {isExpanded && !editingSessionId && (
                    <button
                      onClick={(e) => handleMenuClick(e, session)}
                      className={`p-1 rounded-md ${window.innerWidth < 768 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} ${theme === 'dark' ? 'hover:bg-emerald-500/20' : 'hover:bg-emerald-100'}`}
                    >
                      <MoreVertical size={16} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Absolutely Fixed Bottom Section - User Profile and Controls */}
        <div className={`absolute bottom-0 left-0 right-0 px-3 py-3 ${theme === 'dark'
          ? 'border-t border-emerald-500/20 bg-zinc-900'
          : 'border-t border-emerald-200 bg-white'
          }`}>
          <UserProfile
            user={user}
            userProfile={userProfile}
            userName={userName}
            isExpanded={isExpanded}
            auth={auth}
            navigate={navigate}
            theme={theme}
          />
        </div>
      </div>

      {menuSession && menuCoords && (
        <DropdownMenu
          coords={menuCoords}
          session={{ ...menuSession, isPinned: pinnedIds.includes(menuSession.id) }}
          onClose={() => setMenuSession(null)}
          onPin={() => handlePin(menuSession.id)}
          onRename={() => { setEditingSessionId(menuSession.id); setEditValue(menuSession.name); setMenuSession(null); }}
          onDelete={() => { setSessionToDelete(menuSession); setMenuSession(null); }}
          theme={theme}
        />
      )}

      {sessionToDelete && (
        <DeleteConfirmationModal
          session={sessionToDelete}
          onConfirm={handleDelete}
          onCancel={() => setSessionToDelete(null)}
          theme={theme}
        />
      )}
    </>
  );
}, (prevProps, nextProps) => {
  // Allow re-render ONLY for these specific cases:
  // 1. When currentSessionId changes (to highlight active chat)
  // 2. When className changes (for responsive states)
  // 3. When showHeader changes (for header display)
  // 4. When chat sessions are added/removed (length changes)

  const shouldUpdate = (
    prevProps.currentSessionId !== nextProps.currentSessionId ||
    prevProps.className !== nextProps.className ||
    prevProps.showHeader !== nextProps.showHeader ||
    prevProps.chatSessions.length !== nextProps.chatSessions.length
  );

  // Return true to SKIP re-render, false to allow re-render
  return !shouldUpdate;
});

export default ZetoChatHistory;
