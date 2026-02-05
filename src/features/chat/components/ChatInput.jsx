import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Plus, Upload, Search, X, FileText, Image, Square } from 'lucide-react';
import { uploadFile, deleteFile } from '../../../utils/api.js';
import { uploadChatFileToFirebase } from '../../files/services/fileService.js';
import { useAuth } from '../../../context/AuthContext.jsx';

export default function ChatInput({ onSend, onFileUpload, onFileUploadComplete, botTyping, onStop, sessionId }) {
    // Enforce dark theme
    const theme = 'dark';
    const { currentUser: user, userProfile, loading } = useAuth();
    const [text, setText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isWebSearchActive, setIsWebSearchActive] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false); // New state for expansion
    const [showExpandButton, setShowExpandButton] = useState(false); // New state to control button visibility
    const [skipAutoResize, setSkipAutoResize] = useState(false); // Flag to skip auto-resize
    const fileInputRef = useRef(null);
    const recognitionRef = useRef(null);
    const dropdownRef = useRef(null);
    const textareaRef = useRef(null);
    const prevTextRef = useRef(''); // Store previous value to avoid unnecessary resizes


    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech API not supported');
            return;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recog = new SpeechRecognition();
        recog.lang = 'en-US';
        recog.interimResults = true;
        recog.continuous = false;
        recog.onresult = e => {
            let tr = '';
            for (let i = e.resultIndex; i < e.results.length; ++i) tr += e.results[i][0].transcript;
            setText(prev => prev + tr);
        };
        recog.onerror = () => setIsRecording(false);
        recog.onend = () => setIsRecording(false);
        recognitionRef.current = recog;
    }, []);

    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        }
        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen]);

    const handleSend = () => {
        if (!text.trim() && uploadedFiles.length === 0) return;
        if (botTyping) return; // Prevent double submit while streaming

        // Safety: Max length check (2k chars)
        if (text.length > 2000) {
            // Toast or alert would be better, but console warn for now if no toast available in props
            console.warn("Message too long (max 2000 chars)");
            alert("Message must be under 2000 characters."); 
            return;
        }
        
        // Debug: Log fileIds being sent
        const fileIds = uploadedFiles.filter(f => f.fileId).map(f => f.fileId);
        if (fileIds.length > 0) {
            console.log('📁 Sending message with fileIds:', fileIds);
        }
        
        onSend({
            text: text.trim(),
            files: uploadedFiles,
            isWebSearch: isWebSearchActive
        });
        setIsWebSearchActive(false);
        setText('');
        setUploadedFiles([]);
    };

    const handleStop = () => {
        if (onStop) {
            onStop();
        }
    };

    const handleFileChange = async e => {
        const file = e.target.files[0];
        if (!file) return;

        const previewId = Date.now().toString();
        const filePreview = { id: previewId, name: file.name, size: file.size, type: file.type, file: file };
        setUploadedFiles(prev => [...prev, filePreview]);
        setDropdownOpen(false);
        e.target.value = '';
        e.preventDefault();
        e.stopPropagation();

        if (onFileUpload) {
            onFileUpload(file.name); // Just notify parent
            try {
                if (!user) {
                    console.error('❌ No user found, cannot upload file');
                    if (onFileUploadComplete) onFileUploadComplete(previewId, false);
                    return;
                }
                
                const firebaseUid = user.uid;
                const uniqueUserId = userProfile?.uniqueUserId || user.uid;
                
                // Upload to backend for RAG processing (session-specific - Option B)
                const resp = await uploadChatFileToFirebase(firebaseUid, uniqueUserId, sessionId, file, (progress) => {
                    console.log(`📤 Upload progress: ${Math.round(progress)}%`);
                });
                
                if (onFileUploadComplete) {
                    // Pass fileId for RAG context lookup
                    onFileUploadComplete(previewId, resp.success, resp.fileName, resp.fileId);
                }
                
                // Store fileId for use in chat messages - use previewId to match
                setUploadedFiles(prev => prev.map(f => 
                    f.id === previewId ? { ...f, fileId: resp.fileId, ragReady: true } : f
                ));
                
                console.log('✅ File processed for RAG:', resp.fileId, `(${resp.chunksCreated} chunks)`);
                
            } catch (error) {
                console.error('❌ File upload error:', error.message);
                if (onFileUploadComplete) {
                    onFileUploadComplete(id, false);
                }
            }
        }
    };

    const removeFile = async (fileId) => {
        const fileToRemove = uploadedFiles.find(file => file.id === fileId);
        if (fileToRemove) {
            setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
            if (user) {
                try {
                    const response = await deleteFile(fileToRemove.name);
                    if (response.status === 'success') {
                        console.log(`✅ File ${fileToRemove.name} deleted successfully`);
                    } else {
                        console.warn(`⚠️ Failed to delete file ${fileToRemove.name}:`, response.message);
                    }
                } catch (error) {
                    console.error(`❌ Error deleting file ${fileToRemove.name}:`, error);
                }
            }
        }
    };

    const getFileIcon = (fileType) => {
        if (fileType.startsWith('image/')) {
            return <Image size={16} className="text-blue-400" />;
        } else if (fileType === 'application/pdf') {
            return <FileText size={16} className="text-red-400" />;
        } else {
            return <FileText size={16} className="text-gray-400" />;
        }
    };

    const handleWebSearch = () => {
        setIsWebSearchActive(!isWebSearchActive);
    };

    const toggleRecording = () => {
        if (!recognitionRef.current) return;
        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
        setIsRecording(!isRecording);
    };

    const handleVoiceClick = () => {
        toggleRecording();
        setDropdownOpen(false);
    };

    // Handle expand/collapse button click
    const toggleExpand = () => {
        const newState = !isExpanded;

        if (textareaRef.current) {
            if (newState) {
                // Expanding
                setIsExpanded(true);
                setSkipAutoResize(true);

                textareaRef.current.style.height = '240px';
                textareaRef.current.style.overflowY = 'auto';

                setTimeout(() => setSkipAutoResize(false), 100);
            } else {
                // Collapsing
                setIsExpanded(false);
                setSkipAutoResize(true);

                const target = textareaRef.current;
                const maxHeight = 112; // 4 lines
                const minHeight = 40;

                // Use direct scrollHeight measurement
                target.style.height = 'auto';
                const scrollHeight = target.scrollHeight;

                if (scrollHeight <= minHeight) {
                    target.style.height = `${minHeight}px`;
                    target.style.overflowY = 'hidden';
                } else if (scrollHeight <= maxHeight) {
                    target.style.height = `${scrollHeight}px`;
                    target.style.overflowY = 'hidden';
                } else {
                    target.style.height = `${maxHeight}px`;
                    target.style.overflowY = 'auto';
                }

                setTimeout(() => setSkipAutoResize(false), 100);
            }
        }
    };

    // OPTIMIZED RESIZING LOGIC - Uses direct scrollHeight instead of DOM cloning
    const autoResizeTextarea = (target) => {
        if (!target) return;

        // If we're manually expanding, skip auto-resize
        if (skipAutoResize) return;

        // If expanded, set to 10 lines height regardless of content
        if (isExpanded) {
            target.style.height = '240px';
            target.style.overflowY = 'auto';
            return;
        }

        const maxHeight = 112; // 4 lines (24px * 4 + 16px padding)
        const minHeight = 40;  // 1 line with padding

        // If no content, maintain minimum height
        if (!target.value.trim()) {
            target.style.height = `${minHeight}px`;
            target.style.overflowY = 'hidden';
            setShowExpandButton(false);
            return;
        }

        // Direct scrollHeight measurement (FAST - no DOM cloning)
        // Temporarily set height to auto to get actual content height
        const currentHeight = target.style.height;
        target.style.height = 'auto';
        const scrollHeight = target.scrollHeight;
        
        // Apply appropriate height based on content
        if (scrollHeight <= minHeight) {
            target.style.height = `${minHeight}px`;
            target.style.overflowY = 'hidden';
            setShowExpandButton(false);
        } else if (scrollHeight <= maxHeight) {
            target.style.height = `${scrollHeight}px`;
            target.style.overflowY = 'hidden';
            setShowExpandButton(false);
        } else {
            target.style.height = `${maxHeight}px`;
            target.style.overflowY = 'auto';
            setShowExpandButton(true);
        }
    };

    const handleTextareaChange = (e) => {
        const newValue = e.target.value;
        setText(newValue);

        // Trigger auto-resize with minimal debounce (resize is now fast)
        if (textareaRef.current && prevTextRef.current !== newValue) {
            prevTextRef.current = newValue;

            if (textareaRef.current.resizeTimeout) {
                clearTimeout(textareaRef.current.resizeTimeout);
            }
            textareaRef.current.resizeTimeout = setTimeout(() => {
                if (textareaRef.current) {
                    autoResizeTextarea(textareaRef.current);
                }
            }, 50); // Reduced debounce - resize is now fast
        }
    };

    useEffect(() => {
        // Set initial height to 1 line with padding
        const timer = setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.style.height = '40px'; // 1 line height with padding (24px line height + 16px padding)
                textareaRef.current.style.overflowY = 'hidden';
            }
        }, 100); // Increased delay to ensure proper initialization

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Only trigger auto-resize if text actually changed
        if (textareaRef.current && prevTextRef.current !== text) {
            // Debounce to prevent too frequent updates
            if (textareaRef.current.resizeEffectTimeout) {
                clearTimeout(textareaRef.current.resizeEffectTimeout);
            }
            textareaRef.current.resizeEffectTimeout = setTimeout(() => {
                autoResizeTextarea(textareaRef.current);
            }, 100);
        }
    }, [text, isExpanded, skipAutoResize]); // Add skipAutoResize to dependencies

    if (loading) {
        return (
            <div className="w-full flex flex-col items-center">
                <div className="relative flex items-center w-full max-w-4xl backdrop-blur-xl rounded-2xl px-2 py-2 shadow-lg bg-gray-800/80 border border-gray-700/60">
                    <div className="flex-1 px-2 py-3 text-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mx-auto"></div></div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="w-full flex flex-col items-center">
                <div className="relative flex items-center w-full max-w-4xl backdrop-blur-xl rounded-2xl px-4 py-3 shadow-lg bg-gray-800/80 border border-gray-700/60">
                    <div className="flex-1 text-center">
                        <p className="text-sm text-slate-400">
                            Please <button onClick={() => window.location.href = '/login'} className="font-semibold text-emerald-400 hover:text-emerald-300">sign in</button> to start chatting
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col items-center mobile-chat-input-container">
            <style>{`
                .custom-textarea-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-textarea-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .dark .custom-textarea-scrollbar::-webkit-scrollbar-thumb { background-color: #003925; border-radius: 10px; }
                .no-resize-handle { resize: none !important; }
                @media (max-width: 768px) {
                  .chat-input-container { width: 90% !important; }
                  .websearch-text { display: none; }
                  .mobile-chat-input-container {
                    padding-bottom: env(safe-area-inset-bottom); /* Handle mobile notches */
                  }
                }
                @media (min-width: 769px) {
                  .chat-input-container { width: 70% !important; max-width: 1200px !important; }
                }
            `}</style>

            {uploadedFiles.length > 0 && (
                <div className="w-full max-w-[1200px] mx-auto mb-2 chat-input-container">
                    <div className="backdrop-blur-sm rounded-lg p-2 border bg-zinc-800/40 border-zinc-700/40">
                        <div className="flex flex-wrap gap-2">
                            {uploadedFiles.map((file) => (
                                <div key={file.id} className="flex items-center gap-2 rounded-md px-2 py-1 border text-xs bg-zinc-900/60 border-zinc-600/40">
                                    <div className="p-1 rounded bg-gray-700">{getFileIcon(file.type)}</div>
                                    <div className="flex-1 min-w-0"><div className="font-medium truncate text-white" title={file.name}>{file.name}</div></div>
                                    <button onClick={() => removeFile(file.id)} className="p-1 rounded-full transition-all text-zinc-400 hover:text-white hover:bg-zinc-700" title="Remove file"><X size={14} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="relative w-full max-w-[1200px] mx-auto backdrop-blur-xl rounded-2xl p-2.5 shadow-lg transition-all duration-300 chat-input-container bg-zinc-900 border border-emerald-500/30">

                <div className="w-full">
                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={handleTextareaChange}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        placeholder="Ask Relyce"
                        className="w-full text-[15px] outline-none border-none custom-textarea-scrollbar leading-6 no-resize-handle bg-transparent text-white placeholder-zinc-400"
                        style={{
                            minHeight: '40px',
                            height: '40px',
                            maxHeight: '240px', // Increased from 112px to accommodate expansion
                            resize: 'none',
                            overflowY: 'hidden',
                            boxSizing: 'border-box',
                            padding: '8px 0' // Add vertical padding
                        }}
                    />
                </div>

                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf,image/*,.txt,.doc,.docx" className="hidden" />

                <div className="flex justify-between items-center w-full mt-2">
                    <div className="flex items-center gap-1">
                        <div className="relative" ref={dropdownRef}>
                            <button onClick={() => setDropdownOpen(prev => !prev)} className="group p-2 rounded-full transition-all text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/60" title="Add content">
                                <Plus size={18} className="transition-transform group-hover:rotate-45" />
                            </button>
                            {dropdownOpen && (
                                <div className="absolute bottom-12 left-0 backdrop-blur-xl rounded-xl shadow-xl py-2 w-52 z-50 animate-in slide-in-from-bottom-4 duration-200 bg-zinc-800/95 border border-zinc-700/60">
                                    <button onClick={() => { fileInputRef.current.click(); setDropdownOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 transition-all text-left group hover:bg-zinc-700/50 text-white">
                                        <div className="p-1.5 rounded-md bg-gray-700"><Upload size={16} className="text-gray-400" /></div>
                                        <div>
                                            <div className="text-sm font-medium">Upload File</div>
                                            <div className="text-xs text-zinc-400">PDF, images, docs</div>
                                        </div>
                                    </button>
                                    <button onClick={handleVoiceClick} className="w-full flex items-center gap-3 px-3 py-2 transition-all text-left group hover:bg-zinc-700/50 text-white">
                                        <div className="p-1.5 rounded-md bg-gray-700"><Mic size={16} className="text-gray-400" /></div>
                                        <div>
                                            <div className="text-sm font-medium">Voice Input</div>
                                            <div className="text-xs text-zinc-400">Record message</div>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>
                        <button onClick={handleWebSearch} className={`websearch-button flex items-center gap-1 p-2 rounded-full transition-all text-xs ${isWebSearchActive ? 'bg-[#003925] text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/60'}`} title={isWebSearchActive ? "Deep search enabled - Click to disable" : "Enable deep search"}>
                            <Search size={16} className={isWebSearchActive ? "text-white" : ""} />
                            <span className="websearch-text font-medium">deep search {isWebSearchActive && '✓'}</span>
                        </button>
                        {/* Resize button - only show when content fills 4 lines */}
                        {showExpandButton && (
                            <button
                                onClick={toggleExpand}
                                className={`p-2 rounded-full transition-all ${isExpanded ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/60'}`}
                                title={isExpanded ? "Collapse input" : "Expand input"}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {isExpanded ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l4-4m0 0l4 4m-4-4v18m0 0l-4-4m4 4l4-4" />
                                    )}
                                </svg>
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        <button onClick={toggleRecording} title={isRecording ? 'Stop Recording' : 'Start Voice Input'} className={`p-2 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white hover:bg-red-600' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/60'}`}>
                            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                        </button>
                        <button onClick={botTyping ? handleStop : handleSend} disabled={!text.trim() && uploadedFiles.length === 0 && !botTyping} className={`p-2 rounded-full transition-all ${(text.trim() || uploadedFiles.length > 0 || botTyping) ? 'bg-[#003925] hover:bg-emerald-900 text-white' : 'bg-zinc-700/50 text-zinc-500 cursor-not-allowed'}`}>
                            {botTyping ? <Square size={18} className="fill-current" /> : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                            </svg>}
                        </button>
                    </div>
                </div>
            </div>

            <p className="text-xs text-center mt-3 px-4 leading-relaxed text-zinc-500">
                Relyce AI may produce inaccurate information about people, places, or facts.
            </p>
        </div>
    );
}