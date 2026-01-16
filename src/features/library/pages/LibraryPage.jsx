import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { storage, db } from '../../../utils/firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import {
    collection, doc, addDoc, setDoc, updateDoc, deleteDoc, getDocs,
    query, orderBy, serverTimestamp, onSnapshot
} from 'firebase/firestore';
import {
    Upload,
    FileText,
    Trash2,
    Send,
    ArrowLeft,
    Library as LibraryIcon,
    File,
    ChevronLeft,
    Loader2,
    MessageSquare,
    Plus,
    Briefcase,
    Globe,
    History,
    PlusCircle,
    PanelLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/logo.svg';

// Message Component
const MessageComponent = ({ msg, isUser }) => (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}>
        <div className={`max-w-[80%] md:max-w-[70%] px-4 py-3 rounded-2xl ${isUser
            ? 'bg-emerald-600 text-white rounded-br-md'
            : 'bg-zinc-800 text-white rounded-bl-md'
            }`}>
            {!isUser && (
                <div className="flex items-center gap-2 mb-2">
                    <img src={logo} alt="Relyce AI" className="w-5 h-5 rounded-full" />
                    <span className="text-xs text-emerald-400 font-medium">Relyce AI</span>
                </div>
            )}
            <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
        </div>
    </div>
);

// Typing Indicator
const TypingIndicator = () => (
    <div className="flex justify-start mb-4">
        <div className="bg-zinc-800 px-4 py-3 rounded-2xl rounded-bl-md">
            <div className="flex items-center gap-2">
                <img src={logo} alt="Relyce AI" className="w-5 h-5 rounded-full" />
                <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    </div>
);

// Mode Selector - Responsive
const ModeSelector = ({ mode, onModeChange }) => (
    <div className="flex items-center gap-1 p-1 bg-zinc-800 rounded-xl">
        <button
            onClick={() => onModeChange('general')}
            className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${mode === 'general'
                ? 'bg-emerald-600 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                }`}
        >
            <Globe size={14} />
            <span className="hidden sm:inline">General</span>
        </button>
        <button
            onClick={() => onModeChange('business')}
            className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${mode === 'business'
                ? 'bg-blue-600 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                }`}
        >
            <Briefcase size={14} />
            <span className="hidden sm:inline">Business</span>
        </button>
    </div>
);

// Format relative time
const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24) return `${diffHours}h`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Chat Session Item - Simple & Clean
const ChatSessionItem = ({ session, isActive, onClick, onDelete }) => (
    <div
        onClick={onClick}
        className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'
            }`}
    >
        <MessageSquare size={16} className={isActive ? 'text-emerald-400' : 'text-zinc-500'} />
        <span className={`flex-1 text-sm truncate ${isActive ? 'text-white' : 'text-zinc-400'}`}>
            {session.name || 'New Chat'}
        </span>
        <span className="text-xs text-zinc-600 hidden sm:block">{formatTime(session.updatedAt || session.createdAt)}</span>
        <button
            onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}
            className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1.5 hover:bg-zinc-700 rounded transition-opacity"
        >
            <Trash2 size={14} className="text-zinc-500 hover:text-red-400" />
        </button>
    </div>
);

export default function LibraryPage() {
    const { currentUser: user, userProfile, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Files state
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [loadingFiles, setLoadingFiles] = useState(true);

    // Chat sessions state (Firestore)
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(true);

    // Chat input state
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [chatMode, setChatMode] = useState('general');

    // UI state
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [dragOver, setDragOver] = useState(false);
    const [activeTab, setActiveTab] = useState('files');

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Use Firebase Auth UID (same as ChatPage)
    const userId = user?.uid;
    // Use roll number for storage paths and backend
    const storageUserId = userProfile?.uniqueUserId || user?.uid;

    // Scroll to bottom
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Load library sessions from Firestore (same pattern as ChatPage)
    useEffect(() => {
        if (!userId) {
            setSessions([]);
            setLoadingSessions(false);
            return;
        }

        const sessionsRef = collection(db, 'users', userId, 'librarySessions');
        const q = query(sessionsRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const sessionList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSessions(sessionList);
            setLoadingSessions(false);

            // Auto-select first session if none selected
            if (!currentSessionId && sessionList.length > 0) {
                setCurrentSessionId(sessionList[0].id);
            }
        }, (error) => {
            console.error('Error loading sessions:', error);
            setLoadingSessions(false);
        });

        return () => unsubscribe();
    }, [userId]);

    // Load messages for current session
    useEffect(() => {
        if (!userId || !currentSessionId) {
            setMessages([]);
            return;
        }

        const messagesRef = collection(db, 'users', userId, 'librarySessions', currentSessionId, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(msgList);
        });

        return () => unsubscribe();
    }, [userId, currentSessionId]);

    // Load files from Firebase Storage
    const loadFiles = useCallback(async () => {
        if (!storageUserId) return;
        setLoadingFiles(true);
        try {
            const storageRef = ref(storage, `library/users/${storageUserId}`);
            const result = await listAll(storageRef);
            const fileList = await Promise.all(
                result.items.map(async (item) => {
                    const url = await getDownloadURL(item);
                    return { name: item.name, fullPath: item.fullPath, url };
                })
            );
            setFiles(fileList);
        } catch (error) {
            console.error('Error loading files:', error);
            setFiles([]);
        } finally {
            setLoadingFiles(false);
        }
    }, [storageUserId]);

    useEffect(() => {
        if (storageUserId) loadFiles();
    }, [storageUserId, loadFiles]);

    // Create new session with improved structure
    const createNewSession = async () => {
        if (!userId) return null;

        const newSessionId = crypto.randomUUID();
        const sessionRef = doc(db, 'users', userId, 'librarySessions', newSessionId);

        try {
            await setDoc(sessionRef, {
                name: 'New Chat',
                mode: chatMode,
                messageCount: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            setCurrentSessionId(newSessionId);
            setMessages([]);
            return newSessionId;
        } catch (error) {
            console.error('Error creating session:', error);
            return null;
        }
    };

    // Delete session
    const deleteSession = async (sessionId) => {
        if (!userId || !confirm('Delete this chat?')) return;

        try {
            // Delete messages first
            const messagesRef = collection(db, 'users', userId, 'librarySessions', sessionId, 'messages');
            const msgSnapshot = await getDocs(messagesRef);
            for (const msgDoc of msgSnapshot.docs) {
                await deleteDoc(msgDoc.ref);
            }
            // Delete session
            await deleteDoc(doc(db, 'users', userId, 'librarySessions', sessionId));

            if (currentSessionId === sessionId) {
                setCurrentSessionId(sessions.length > 1 ? sessions.find(s => s.id !== sessionId)?.id : null);
            }
        } catch (error) {
            console.error('Error deleting session:', error);
        }
    };

    // Add message to Firestore with improved structure
    const addMessage = async (role, content, sessionId) => {
        if (!userId || !sessionId) return;

        try {
            const messagesRef = collection(db, 'users', userId, 'librarySessions', sessionId, 'messages');
            await addDoc(messagesRef, {
                role,
                content,
                createdAt: serverTimestamp()
            });

            // Update session metadata
            const sessionRef = doc(db, 'users', userId, 'librarySessions', sessionId);
            const updates = {
                updatedAt: serverTimestamp(),
                messageCount: messages.length + 1
            };

            // Set title from first user message
            if (role === 'user' && messages.length === 0) {
                updates.name = content.slice(0, 40) + (content.length > 40 ? '...' : '');
                updates.mode = chatMode;
            }

            await updateDoc(sessionRef, updates);
        } catch (error) {
            console.error('Error adding message:', error);
        }
    };

    // Handle file upload
    const handleFileUpload = async (file) => {
        if (!storageUserId || !file) return;

        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/csv', 'text/plain', 'text/html'
        ];

        if (!allowedTypes.includes(file.type) && !file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
            alert('Unsupported file type.');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            const storageRef = ref(storage, `library/users/${storageUserId}/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                (snapshot) => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
                (error) => { console.error('Upload error:', error); setUploading(false); alert('Upload failed.'); },
                async () => { setUploading(false); setUploadProgress(0); await loadFiles(); }
            );
        } catch (error) {
            console.error('Upload error:', error);
            setUploading(false);
        }
    };

    // Handle file delete
    const handleDeleteFile = async (file) => {
        if (!confirm(`Delete "${file.name}"?`)) return;
        try {
            const fileRef = ref(storage, file.fullPath);
            await deleteObject(fileRef);
            await loadFiles();
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete file.');
        }
    };

    // Drag and drop
    const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
    const handleDragLeave = () => setDragOver(false);
    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) handleFileUpload(droppedFiles[0]);
    };

    // Handle chat send
    const handleSend = async () => {
        const text = inputText.trim();
        if (!text || files.length === 0) {
            if (files.length === 0) alert('Please upload at least one file to chat with.');
            return;
        }

        setInputText('');
        setIsTyping(true);

        // Get or create session
        let activeSessionId = currentSessionId;
        if (!activeSessionId) {
            activeSessionId = await createNewSession();
            if (!activeSessionId) {
                setIsTyping(false);
                alert('Failed to create session');
                return;
            }
        }

        // Add user message
        await addMessage('user', text, activeSessionId);

        try {
            const response = await fetch('/api/library/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: storageUserId, query: text, mode: chatMode })
            });

            const data = await response.json();
            await addMessage('assistant', data.response || data.answer || 'Could not process request.', activeSessionId);
        } catch (error) {
            console.error('Chat error:', error);
            await addMessage('assistant', 'Error: Backend not running. Start with: python library_api.py', activeSessionId);
        } finally {
            setIsTyping(false);
        }
    };

    // Get file icon
    const getFileIcon = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase();
        const colorMap = {
            pdf: 'text-red-400', docx: 'text-blue-400', doc: 'text-blue-400',
            pptx: 'text-orange-400', xlsx: 'text-green-400', csv: 'text-green-400',
            txt: 'text-gray-400', md: 'text-purple-400', html: 'text-yellow-400'
        };
        return <FileText size={18} className={colorMap[ext] || 'text-gray-400'} />;
    };

    // Auth loading
    if (authLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0f0f10]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    // Not authenticated
    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0f0f10]">
                <div className="text-center">
                    <LibraryIcon size={48} className="mx-auto text-emerald-500 mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Sign in required</h2>
                    <p className="text-slate-400 mb-4">Please sign in to access your library</p>
                    <button onClick={() => navigate('/login')} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors">
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#0f0f10] text-white overflow-hidden">
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #18181b; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #005a3e; border-radius: 3px; }
            `}</style>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:relative inset-y-0 left-0 z-50
                w-72 md:w-80
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden'}
                bg-zinc-900 border-r border-zinc-800 flex flex-col
            `}>
                {/* Header */}
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate('/')} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-lg font-semibold flex items-center gap-2">
                            <LibraryIcon size={20} className="text-emerald-400" />
                            My Library
                        </h1>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-2 hover:bg-zinc-800 rounded-lg transition-colors md:hidden"
                    >
                        <ChevronLeft size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-zinc-800">
                    <button
                        onClick={() => setActiveTab('files')}
                        className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === 'files' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-zinc-500 hover:text-white'}`}
                    >
                        <File size={14} className="inline mr-1" /> Files
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === 'history' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-zinc-500 hover:text-white'}`}
                    >
                        <History size={14} className="inline mr-1" /> History
                    </button>
                </div>

                {activeTab === 'files' ? (
                    <>
                        {/* Upload Area */}
                        <div
                            className={`m-4 p-4 border-2 border-dashed rounded-xl text-center transition-colors cursor-pointer ${dragOver ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-700 hover:border-zinc-600'}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.docx,.pptx,.xlsx,.csv,.txt,.md,.html"
                                onChange={(e) => { if (e.target.files[0]) { handleFileUpload(e.target.files[0]); e.target.value = ''; } }}
                            />
                            {uploading ? (
                                <div className="space-y-2">
                                    <Loader2 size={24} className="mx-auto animate-spin text-emerald-400" />
                                    <p className="text-sm text-zinc-400">Uploading... {Math.round(uploadProgress)}%</p>
                                    <div className="w-full bg-zinc-700 rounded-full h-1">
                                        <div className="bg-emerald-500 h-1 rounded-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Upload size={24} className="mx-auto text-zinc-500 mb-2" />
                                    <p className="text-sm text-zinc-400">Drop files or click to upload</p>
                                    <p className="text-xs text-zinc-600 mt-1">PDF, DOCX, PPTX, XLSX, CSV, TXT</p>
                                </>
                            )}
                        </div>

                        {/* Files List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-zinc-500 uppercase tracking-wider">Your Files</p>
                                <span className="text-xs text-zinc-500">{files.length}</span>
                            </div>
                            {loadingFiles ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 size={24} className="animate-spin text-emerald-400" />
                                </div>
                            ) : files.length === 0 ? (
                                <div className="text-center py-8">
                                    <File size={32} className="mx-auto text-zinc-600 mb-2" />
                                    <p className="text-sm text-zinc-500">No files yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {files.map((file, idx) => (
                                        <div key={idx} className="group relative p-2.5 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors">
                                            <div className="flex items-center gap-2 mb-1">
                                                {getFileIcon(file.name)}
                                                <button
                                                    onClick={() => handleDeleteFile(file)}
                                                    className="absolute top-1.5 right-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-opacity"
                                                >
                                                    <Trash2 size={12} className="text-zinc-500 hover:text-red-400" />
                                                </button>
                                            </div>
                                            <span className="text-xs text-zinc-400 truncate block" title={file.name}>
                                                {file.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* History Tab */
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                        <button
                            onClick={createNewSession}
                            className="w-full flex items-center justify-center gap-2 p-3 mb-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                        >
                            <PlusCircle size={18} />
                            <span className="font-medium">New Chat</span>
                        </button>

                        {loadingSessions ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 size={24} className="animate-spin text-emerald-400" />
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="text-center py-8">
                                <History size={32} className="mx-auto text-zinc-600 mb-2" />
                                <p className="text-sm text-zinc-500">No chat history</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {sessions.map((session) => (
                                    <ChatSessionItem
                                        key={session.id}
                                        session={session}
                                        isActive={currentSessionId === session.id}
                                        onClick={() => { setCurrentSessionId(session.id); setChatMode(session.mode || 'general'); }}
                                        onDelete={deleteSession}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col min-h-0 w-full">
                {/* Header */}
                <header className="p-3 md:p-4 border-b border-zinc-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 md:gap-3 min-w-0">
                        {/* Menu button: always show on mobile, only show on desktop when sidebar closed */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className={`p-2 hover:bg-zinc-800 rounded-lg transition-colors flex-shrink-0 ${sidebarOpen ? 'md:hidden' : ''
                                }`}
                        >
                            <PanelLeft size={20} />
                        </button>
                        <div className="flex items-center gap-2 min-w-0">
                            <MessageSquare size={18} className="text-emerald-400 flex-shrink-0 hidden sm:block" />
                            <h2 className="font-semibold text-sm md:text-base truncate">Chat with Docs</h2>
                        </div>
                        <span className="text-xs md:text-sm text-zinc-500 flex-shrink-0">{files.length} files</span>
                    </div>
                    <ModeSelector mode={chatMode} onModeChange={setChatMode} />
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center max-w-md">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
                                    <img src={logo} alt="Relyce AI" className="w-10 h-10 rounded-full" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">
                                    Chat with your <span className="text-emerald-400">Documents</span>
                                </h3>
                                <p className="text-zinc-400 text-sm mb-4">
                                    Upload documents and ask questions. Switch between General and Business modes.
                                </p>
                                <div className="grid grid-cols-2 gap-3 mb-4 text-left">
                                    <div className="p-3 bg-zinc-800/50 rounded-lg border border-emerald-500/20">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Globe size={16} className="text-emerald-400" />
                                            <span className="text-sm font-medium text-emerald-400">General</span>
                                        </div>
                                        <p className="text-xs text-zinc-500">Friendly, clear answers</p>
                                    </div>
                                    <div className="p-3 bg-zinc-800/50 rounded-lg border border-blue-500/20">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Briefcase size={16} className="text-blue-400" />
                                            <span className="text-sm font-medium text-blue-400">Business</span>
                                        </div>
                                        <p className="text-xs text-zinc-500">Professional insights</p>
                                    </div>
                                </div>
                                {files.length === 0 && (
                                    <button onClick={() => { setActiveTab('files'); fileInputRef.current?.click(); }}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors">
                                        <Plus size={18} />
                                        Upload first file
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto">
                            {messages.map((msg) => (
                                <MessageComponent key={msg.id} msg={msg} isUser={msg.role === 'user'} />
                            ))}
                            {isTyping && <TypingIndicator />}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-zinc-500">Mode:</span>
                            <span className={`text-xs font-medium flex items-center gap-1 ${chatMode === 'general' ? 'text-emerald-400' : 'text-blue-400'}`}>
                                {chatMode === 'general' ? <Globe size={12} /> : <Briefcase size={12} />}
                                {chatMode === 'general' ? 'General' : 'Business'}
                            </span>
                        </div>
                        <div className="relative flex items-end gap-2 bg-zinc-900 border border-zinc-700 rounded-2xl p-2">
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                placeholder={files.length > 0 ? "Ask about your documents..." : "Upload files first..."}
                                disabled={files.length === 0}
                                className="flex-1 bg-transparent text-white placeholder-zinc-500 outline-none resize-none px-2 py-2 max-h-32"
                                rows={1}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputText.trim() || files.length === 0 || isTyping}
                                className={`p-2 rounded-xl transition-colors ${inputText.trim() && files.length > 0 && !isTyping
                                    ? chatMode === 'general' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                                    }`}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
