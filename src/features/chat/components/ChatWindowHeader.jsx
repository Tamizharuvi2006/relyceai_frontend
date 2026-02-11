import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, MoreVertical, Settings, Share, Copy, Trash2, Database, User, Plus, Download, FileText, Settings as Gear, Users } from 'lucide-react';
import ChatService from '../../../services/chatService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../utils/firebaseConfig';
import { useAuth } from '../../../context/AuthContext';


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
  const { currentUser: user, userProfile } = useAuth();
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

  // Relyce AI Behavior Mode (Only for default_relyce)
  const [behaviorDropdownOpen, setBehaviorDropdownOpen] = useState(false);
  const behaviorButtonRef = useRef(null);
  const [behaviorMode, setBehaviorMode] = useState('hybrid');
  const [savingBehaviorMode, setSavingBehaviorMode] = useState(false);
  const [thinkingVisibility, setThinkingVisibility] = useState('auto');
  const [savingThinkingVisibility, setSavingThinkingVisibility] = useState(false);
  


  // Close menus on outside click - centralized
  useEffect(() => {
    if (!headerMenuOpen && !modeDropdownOpen && !personalityDropdownOpen && !behaviorDropdownOpen) return;
    
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

      // Behavior Mode Menu check
      if (behaviorDropdownOpen && behaviorButtonRef.current && !behaviorButtonRef.current.contains(e.target) && !e.target.closest('.behavior-dropdown-content')) {
        setBehaviorDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [headerMenuOpen, modeDropdownOpen, personalityDropdownOpen, behaviorDropdownOpen]);

  useEffect(() => {
    const mode = userProfile?.settings?.personalization?.behaviorMode;
    if (mode && mode !== behaviorMode) {
      setBehaviorMode(mode);
    }
  }, [userProfile?.settings?.personalization?.behaviorMode, behaviorMode]);

  useEffect(() => {
    const visibility = userProfile?.settings?.personalization?.thinkingVisibility;
    if (visibility && visibility !== thinkingVisibility) {
      setThinkingVisibility(visibility);
    }
  }, [userProfile?.settings?.personalization?.thinkingVisibility, thinkingVisibility]);

  useEffect(() => {
    if (!activePersonality || activePersonality.id !== 'default_relyce') return;
    if (activePersonality.content_mode !== behaviorMode) {
      setActivePersonality({ ...activePersonality, content_mode: behaviorMode });
    }
  }, [activePersonality, behaviorMode, setActivePersonality]);

  const handleBehaviorModeChange = async (mode) => {
    if (mode === behaviorMode) {
      setBehaviorDropdownOpen(false);
      return;
    }
    setBehaviorMode(mode);
    setBehaviorDropdownOpen(false);
    if (activePersonality?.id === 'default_relyce') {
      setActivePersonality({ ...activePersonality, content_mode: mode });
    }
    if (!user?.uid) return;
    try {
      setSavingBehaviorMode(true);
      await updateDoc(doc(db, 'users', user.uid), {
        'settings.personalization.behaviorMode': mode
      });
    } catch (err) {
      console.error('[BehaviorMode] Failed to save setting:', err);
    } finally {
      setSavingBehaviorMode(false);
    }
  };

  const handleThinkingVisibilityChange = async (value) => {
    if (value === thinkingVisibility) return;
    setThinkingVisibility(value);
    if (!user?.uid) return;
    try {
      setSavingThinkingVisibility(true);
      await updateDoc(doc(db, 'users', user.uid), {
        'settings.personalization.thinkingVisibility': value
      });
    } catch (err) {
      console.error('[ThinkingVisibility] Failed to save setting:', err);
    } finally {
      setSavingThinkingVisibility(false);
    }
  };

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
    <div className="sticky top-0 left-0 right-0 z-50 backdrop-blur-md bg-zinc-900/80 transition-colors duration-300 border-b border-emerald-500/20 mobile-sticky-header">
      <div className={`flex items-center justify-between py-3 px-4 transition-all duration-300 ${sidebarExpanded ? 'md:px-4' : 'md:px-8'}`}>
        
        {/* Left side - Menu & Title & Selectors */}
        <div className="flex items-center gap-1 sm:gap-3 flex-shrink min-w-0">
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
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-lg transition text-sm font-medium hover:bg-emerald-500/20 text-white ${modeDropdownOpen ? 'bg-emerald-500/20' : ''}`}
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
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-lg transition text-sm font-medium hover:bg-emerald-500/20 text-white ml-1 sm:ml-2 border border-emerald-500/20 ${personalityDropdownOpen ? 'bg-emerald-500/20' : ''}`}
                disabled={!personalities || personalities.length === 0}
                >
                <User size={14} className="text-emerald-400" />
                <span className="text-emerald-400 max-w-[60px] sm:max-w-[100px] truncate text-xs sm:text-sm">
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
                            
                            {/* Edit/Delete Menu - Only for non-system personalities */}
                            {!p.is_system && (
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

          {/* Relyce AI Behavior Mode (only for default_relyce) */}
          {chatMode === 'normal' && activePersonality?.id === 'default_relyce' && (
            <div className="relative">
              <button
                ref={behaviorButtonRef}
                onClick={() => setBehaviorDropdownOpen(!behaviorDropdownOpen)}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-lg transition text-sm font-medium hover:bg-emerald-500/20 text-white ml-1 sm:ml-2 border border-emerald-500/20 ${behaviorDropdownOpen ? 'bg-emerald-500/20' : ''}`}
                disabled={savingBehaviorMode}
                title="Behavior mode"
              >
                <span className="text-emerald-400 text-xs sm:text-sm">
                  {behaviorMode === 'web_search' ? 'Web Search' : behaviorMode === 'llm_only' ? 'LLM Only' : 'Smart Hybrid'}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${behaviorDropdownOpen ? 'rotate-180' : ''} text-emerald-400`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {behaviorDropdownOpen && (
                <div
                  className="behavior-dropdown-content absolute top-full left-0 mt-2 border rounded-lg shadow-xl py-1 w-48 z-50 bg-zinc-800 border-emerald-500/30 animate-in fade-in zoom-in-95 duration-100 origin-top-left"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Behavior Mode
                  </div>
                  <button
                    onClick={() => handleBehaviorModeChange('hybrid')}
                    className={`w-full flex items-center gap-3 px-4 py-2 transition text-left text-sm ${behaviorMode === 'hybrid'
                      ? 'bg-emerald-600 text-white'
                      : 'hover:bg-emerald-500/20 text-emerald-100'
                      }`}
                  >
                    Smart Hybrid
                  </button>
                  <button
                    onClick={() => handleBehaviorModeChange('web_search')}
                    className={`w-full flex items-center gap-3 px-4 py-2 transition text-left text-sm ${behaviorMode === 'web_search'
                      ? 'bg-emerald-600 text-white'
                      : 'hover:bg-emerald-500/20 text-emerald-100'
                      }`}
                  >
                    Web Search
                  </button>
                  <button
                    onClick={() => handleBehaviorModeChange('llm_only')}
                    className={`w-full flex items-center gap-3 px-4 py-2 transition text-left text-sm ${behaviorMode === 'llm_only'
                      ? 'bg-emerald-600 text-white'
                      : 'hover:bg-emerald-500/20 text-emerald-100'
                      }`}
                  >
                    LLM Only
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Download */}
            <DownloadMenu onDownloadPDF={onDownloadPDF} onDownloadText={onDownloadText} />

            {/* Share - Hidden on mobile */}
            <button
                onClick={handleShareClick}
                disabled={isSharing}
                className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg transition text-sm hover:bg-white/10 text-white ${isSharing ? 'opacity-50 cursor-wait' : ''}`}
            >
                <Share size={16} className={isSharing ? 'animate-pulse' : ''} />
                <span>{isSharing ? 'Sharing...' : 'Share'}</span>
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

                    <div className="border-t border-slate-700/50 mt-2 pt-3 pb-2 px-4">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Thinking Visibility
                      </div>
                      <div className="mt-2 flex gap-2">
                        {[
                          { id: 'auto', label: 'Auto' },
                          { id: 'on', label: 'On' },
                          { id: 'off', label: 'Off' }
                        ].map((option) => (
                          <button
                            key={option.id}
                            onClick={() => handleThinkingVisibilityChange(option.id)}
                            disabled={savingThinkingVisibility}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium transition border ${
                              thinkingVisibility === option.id
                                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-zinc-900/40 text-slate-300 border-slate-700 hover:border-slate-500'
                            } ${savingThinkingVisibility ? 'opacity-60 cursor-wait' : ''}`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500">
                        Auto shows thinking only for coding and technical tasks.
                      </div>
                    </div>
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
