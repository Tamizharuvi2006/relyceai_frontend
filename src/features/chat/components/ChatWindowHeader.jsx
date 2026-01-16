// components/ChatWindowHeader.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, MoreVertical, Settings, Share, Copy, Trash2, Database } from 'lucide-react';
import ReactDOM from 'react-dom';

/**
 * Chat Window Header Component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Header component
 */
const ChatWindowHeader = ({
  onToggleSidebar,
  sidebarExpanded,
  currentSessionId,
  userId,
  userUniqueId,
  messages,
  chatMode,
  onChatModeChange,
  tokenData,
  onDownloadPDF,
  onShare,
  onCopyLink,
  onDelete
}) => {
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const headerMenuRef = useRef(null);
  const headerMenuButtonRef = useRef(null);
  const [menuCoords, setMenuCoords] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!headerMenuOpen) return;
    const handler = (e) => {
      const clickInsideMenu = headerMenuRef.current && headerMenuRef.current.contains(e.target);
      const clickOnButton = headerMenuButtonRef.current && headerMenuButtonRef.current.contains(e.target);
      if (!clickInsideMenu && !clickOnButton) {
        setHeaderMenuOpen(false);
      }
    };
    const id = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener('mousedown', handler);
    };
  }, [headerMenuOpen]);

  const handleShareClick = async () => {
    setIsSharing(true);
    try {
      await onShare(messages);
    } finally {
      setIsSharing(false);
      setHeaderMenuOpen(false);
    }
  };

  const handleCopyLinkClick = async () => {
    try {
      await onCopyLink(messages);
    } finally {
      setHeaderMenuOpen(false);
    }
  };

  const handleDeleteClick = () => {
    onDelete();
    setHeaderMenuOpen(false);
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    setHeaderMenuOpen(false);
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-50 backdrop-blur-sm bg-zinc-900/90 transition-colors duration-300">
      <div className={`flex items-center justify-between py-3 transition-all duration-300 ${sidebarExpanded
          ? 'px-4 md:px-8 lg:px-[154px]'
          : 'px-4 md:px-16 lg:px-[204px] xl:px-[304px]'
        }`}>
        {/* Left side - Title and User ID */}
        <div className="flex items-center gap-3">
          {/* Mobile: Menu button */}
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg transition md:hidden mr-2 hover:bg-white/10 text-white"
            title="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-emerald-400">
              {chatMode === 'plus' ? 'Relyce AI Plus' : 'Relyce AI'}
            </span>

            {userUniqueId && (
              <span className="text-xs px-2 py-1 rounded-full bg-zinc-700 text-zinc-300">
                {userUniqueId}
              </span>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Token Display */}
          {tokenData && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg transition text-sm" title="Token usage">
              <Database size={16} className="text-white" />
              <span className="hidden sm:inline text-white">
                {tokenData.daily_limit === 0 ? '∞' : `${Math.round(tokenData.daily_percentage || 0)}%`}
              </span>
              {tokenData.daily_limit !== 0 && (
                <div className="w-16 h-2 rounded-full bg-gray-700 hidden sm:block">
                  <div
                    className={`h-2 rounded-full ${tokenData.daily_percentage > 90 ? 'bg-red-500' : tokenData.daily_percentage > 75 ? 'bg-yellow-500' : 'bg-purple-500'}`}
                    style={{ width: `${Math.min(tokenData.daily_percentage || 0, 100)}%` }}
                  ></div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => onDownloadPDF(messages)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition text-sm hover:bg-white/10 text-white"
          >
            <Share size={16} />
            <span className="hidden sm:inline">Download PDF</span>
          </button>

          <div className="relative">
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

            {headerMenuOpen && menuCoords && ReactDOM.createPortal(
              <div
                ref={headerMenuRef}
                style={{ position: 'fixed', top: menuCoords.top, left: Math.max(8, menuCoords.left) }}
                className="border rounded-lg shadow-xl py-2 w-48 z-[1000] bg-[#18181b] border-slate-700"
              >
                <button
                  onClick={handleSettingsClick}
                  className="w-full flex items-center gap-3 px-4 py-2 transition text-left text-sm hover:bg-slate-700 text-white"
                >
                  <Settings size={16} />
                  Settings
                </button>
                <button
                  onClick={handleShareClick}
                  className="w-full flex items-center gap-3 px-4 py-2 transition text-left text-sm hover:bg-slate-700 text-white"
                  disabled={isSharing}
                >
                  <Share size={16} />
                  {isSharing ? 'Sharing...' : 'Share conversation'}
                </button>
                <button
                  onClick={handleCopyLinkClick}
                  className="w-full flex items-center gap-3 px-4 py-2 transition text-left text-sm hover:bg-slate-700 text-white"
                >
                  <Copy size={16} />
                  Copy link
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="w-full flex items-center gap-3 px-4 py-2 transition text-left text-sm hover:bg-red-500/20 text-red-400"
                >
                  <Trash2 size={16} />
                  Delete conversation
                </button>
              </div>,
              document.body
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindowHeader;