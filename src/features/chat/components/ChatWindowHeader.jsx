import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, MoreVertical, Settings, Share, Copy, Trash2, Database, User, Plus, Download, FileText, Settings as Gear, Users } from 'lucide-react';
import ChatService from '../../../services/chatService';


// Download component for the header
const DownloadMenu = ({ onDownloadPDF, onDownloadText }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target) && !e.target.closest('.download-menu-content')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium hover:bg-white/10 text-white hover:shadow-md ${isOpen ? 'bg-white/10' : ''}`}
        title="Download chat"
      >
        <Download size={18} />
        <span className="sm:inline hidden">Download</span>
      </button>

      {isOpen && (
        <div className="download-menu-content absolute top-full right-0 mt-2 border rounded-lg shadow-xl py-2 w-48 z-50 bg-[#18181b] border-emerald-500/30 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
          <button
            onClick={() => { onDownloadText(); setIsOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-2 transition text-left text-sm hover:bg-emerald-500/20 text-white"
          >
            <FileText size={16} />
            Download as Text
          </button>
          <button
            onClick={() => { onDownloadPDF(); setIsOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-2 transition text-left text-sm hover:bg-emerald-500/20 text-white"
          >
            <FileText size={16} />
            Download as PDF
          </button>
        </div>
      )}
    </div>
  );
};

const ChatWindowHeader = ({
  onToggleSidebar,
  sidebarExpanded,
  currentSessionId,
  userId,
  messages,
  chatMode,
  onChatModeChange,
  tokenData,
  onDownloadPDF,
  onDownloadText,
  onShare,
  onCopyLink,
  onDelete,
  personalities,
  activePersonality,
  setActivePersonality,
  setPersonalities,
  userUniqueId
}) => {
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const headerMenuButtonRef = useRef(null);
  const headerMenuRef = useRef(null);
  const navigate = useNavigate();

  // Mode Dropdown State
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);
  const modeButtonRef = useRef(null);

  // Personality Dropdown State
  const [personalityDropdownOpen, setPersonalityDropdownOpen] = useState(false);
  const personalityButtonRef = useRef(null);
  


  // Close menus on outside click - centralized
  useEffect(() => {
    if (!headerMenuOpen && !modeDropdownOpen && !personalityDropdownOpen) return;
    
    const handler = (e) => {
      // Header Menu check
      if (headerMenuOpen && headerMenuRef.current && !headerMenuRef.current.contains(e.target) && !headerMenuButtonRef.current?.contains(e.target)) {
        setHeaderMenuOpen(false);
      }
      
      // Mode Menu check
      if (modeDropdownOpen && modeButtonRef.current && !modeButtonRef.current.contains(e.target) && !e.target.closest('.mode-dropdown-content')) {
        setModeDropdownOpen(false);
      }

      // Personality Menu check
      if (personalityDropdownOpen && personalityButtonRef.current && !personalityButtonRef.current.contains(e.target) && !e.target.closest('.personality-dropdown-content')) {
        setPersonalityDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [headerMenuOpen, modeDropdownOpen, personalityDropdownOpen]);

  // Handler helpers
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
      if (onCopyLink) {
          await onCopyLink(messages);
      } else {
          if (!currentSessionId) return;
          const shareUrl = `${window.location.origin}/chat/${currentSessionId}`;
          await navigator.clipboard.writeText(shareUrl);
          alert('Link copied to clipboard!');
      }
    } finally {
      setHeaderMenuOpen(false);
    }
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    setHeaderMenuOpen(false);
  };

  return (
    <>
    <div className="sticky top-0 left-0 right-0 z-50 backdrop-blur-md bg-zinc-900/80 transition-colors duration-300 border-b border-emerald-500/20">
      <div className={`flex items-center justify-between py-3 px-4 transition-all duration-300 ${sidebarExpanded ? 'md:px-4' : 'md:px-8'}`}>
        
        {/* Left side - Menu & Title & Selectors */}
        <div className="flex items-center gap-3">
          {/* Mobile: Menu button */}
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg transition md:hidden mr-2 hover:bg-white/10 text-white"
            title="Open menu"
          >
            <Menu size={20} />
          </button>
          
          {/* Mode Selector */}
          <div className="relative">
            <button
              ref={modeButtonRef}
              onClick={() => setModeDropdownOpen(!modeDropdownOpen)}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg transition text-sm font-medium hover:bg-emerald-500/20 text-white ${modeDropdownOpen ? 'bg-emerald-500/20' : ''}`}
            >
              <span className="text-emerald-400">
                {chatMode === 'business' ? 'Business' : 'Generic'}
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

            {modeDropdownOpen && (
              <div className="mode-dropdown-content absolute top-full left-0 mt-2 border rounded-lg shadow-xl py-1 w-40 z-50 bg-zinc-800 border-emerald-500/30 animate-in fade-in zoom-in-95 duration-100 origin-top-left">
                <button
                  onClick={() => { if(onChatModeChange) onChatModeChange('normal'); setModeDropdownOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2 transition text-left text-sm ${chatMode === 'normal'
                    ? 'bg-emerald-600 text-white'
                    : 'hover:bg-emerald-500/20 text-emerald-100'
                    }`}
                >
                  Generic
                </button>
                <button
                  onClick={() => { if(onChatModeChange) onChatModeChange('business'); setModeDropdownOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2 transition text-left text-sm ${chatMode === 'business'
                    ? 'bg-emerald-600 text-white'
                    : 'hover:bg-emerald-500/20 text-emerald-100'
                    }`}
                >
                  Business
                </button>
              </div>
            )}
          </div>

          {/* Personality Selector - Only in Generic/Normal Mode */}
          {chatMode === 'normal' && (
            <div className="relative">
                <button
                ref={personalityButtonRef}
                onClick={(e) => {
                    e.stopPropagation(); // Prevent immediate close
                    setPersonalityDropdownOpen(!personalityDropdownOpen);
                }}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg transition text-sm font-medium hover:bg-emerald-500/20 text-white ml-2 border border-emerald-500/20 ${personalityDropdownOpen ? 'bg-emerald-500/20' : ''}`}
                disabled={!personalities || personalities.length === 0}
                >
                <User size={14} className="text-emerald-400" />
                <span className="text-emerald-400 max-w-[100px] truncate">
                    {activePersonality ? activePersonality.name : 'Loading...'}
                </span>
                <svg
                    className={`w-4 h-4 transition-transform ${personalityDropdownOpen ? 'rotate-180' : ''} text-emerald-400`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                </button>

                {personalityDropdownOpen && (
                <div
                    className="personality-dropdown-content absolute top-full left-0 mt-2 border rounded-lg shadow-xl py-1 w-56 z-50 bg-zinc-800 border-emerald-500/30 max-h-[400px] overflow-y-auto animate-in fade-in zoom-in-95 duration-100 origin-top-left"
                    onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside
                >
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Select Personality
                    </div>
                    
                    {personalities && personalities.map(p => (
                        <div key={p.id} className="group relative flex items-center justify-between w-full hover:bg-emerald-500/10 transition rounded-md pr-1">
                            <button
                                onClick={() => { setActivePersonality(p); setPersonalityDropdownOpen(false); }}
                                className={`flex-1 flex items-center justify-between px-4 py-2 text-left text-sm ${
                                    activePersonality?.id === p.id
                                    ? 'text-emerald-400'
                                    : 'text-emerald-100'
                                }`}
                            >
                                <span className="truncate">{p.name}</span>
                                {activePersonality?.id === p.id && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>}
                            </button>
                            
                            {/* Edit/Delete Menu - Only for custom personalities (not default) */}
                            {(!p.is_default || p.is_system === false) && (
                                <div className="relative flex items-center pr-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Close dropdown and navigate to edit
                                            setPersonalityDropdownOpen(false);
                                            navigate(`/personalities/edit/${p.id}`);
                                        }}
                                        className="p-1.5 rounded hover:bg-emerald-500/20 text-emerald-400/50 hover:text-emerald-400 transition-colors z-10"
                                        title="Edit"
                                    >
                                        <Gear size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    
                    <div className="my-1 border-t border-gray-700"></div>
                    
                    <button
                        onClick={() => { navigate('/personalities/create'); setPersonalityDropdownOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-3 transition text-left text-sm text-emerald-400 hover:bg-emerald-500/10"
                    >
                        <Plus size={14} />
                        Create New Personality
                    </button>
                </div>
                )}
            </div>
          )}

          {userUniqueId && (
              <span className="text-xs px-2 py-1 rounded-full bg-zinc-700 text-zinc-300 hidden md:inline-block">
                {userUniqueId}
              </span>
            )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
            {/* Download */}
            <DownloadMenu onDownloadPDF={onDownloadPDF} onDownloadText={onDownloadText} />

            {/* Share */}
            <button
                onClick={handleShareClick}
                disabled={isSharing}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition text-sm hover:bg-white/10 text-white ${isSharing ? 'opacity-50 cursor-wait' : ''}`}
            >
                <Share size={16} className={isSharing ? 'animate-pulse' : ''} />
                <span className="hidden sm:inline">{isSharing ? 'Sharing...' : 'Share'}</span>
            </button>

            {/* More Menu */}
            <div className="relative">
                <button
                ref={headerMenuButtonRef}
                onClick={() => setHeaderMenuOpen(!headerMenuOpen)}
                className={`p-2 rounded-lg transition hover:bg-white/10 text-white ${headerMenuOpen ? 'bg-white/10' : ''}`}
                >
                <MoreVertical size={20} />
                </button>

                {headerMenuOpen && (
                <div
                    ref={headerMenuRef}
                    className="absolute top-full right-0 mt-2 border rounded-lg shadow-xl py-2 w-64 z-50 bg-[#18181b] border-slate-700 animate-in fade-in zoom-in-95 duration-100 origin-top-right"
                >
                     {/* Manage Personalities Option */}
                     {chatMode === 'normal' && (
                        <>
                            <button
                            onClick={() => {
                                setHeaderMenuOpen(false);
                                navigate('/personalities');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 transition text-left text-sm hover:bg-slate-700 text-emerald-400 font-medium border-b border-slate-700/50"
                            >
                            <Users size={16} />
                            Manage Personalities
                            </button>
                        </>
                    )}

                    <button
                    onClick={handleSettingsClick}
                    className="w-full flex items-center gap-3 px-4 py-2 transition text-left text-sm hover:bg-slate-700 text-white mt-1"
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
                    Copy direct link
                    </button>
                    
                </div>
                )}
            </div>
        </div>
      </div>
    </div>
    
    {/* Global Create/Edit Personality Modal */}
    </>
  );
};

export default ChatWindowHeader;