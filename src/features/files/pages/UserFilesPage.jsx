import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { storage } from '../../../utils/firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { Upload, FileText, Trash2, Cpu, Database, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserFiles = ({ isEmbedded = false }) => {
    const { currentUser: user, userProfile } = useAuth();
    const navigate = useNavigate();
    
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [loadingFiles, setLoadingFiles] = useState(true);
    
    const fileRef = useRef(null);
    const storageUserId = userProfile?.uniqueUserId || user?.uid;

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

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
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
                (error) => { 
                    console.error('Upload error:', error); 
                    setUploading(false); 
                    alert('Upload failed.'); 
                },
                async () => { 
                    setUploading(false); 
                    setUploadProgress(0); 
                    await loadFiles();
                    // Redirect to chat after successful upload
                    navigate('/library');
                }
            );
        } catch (error) {
            console.error('Upload error:', error);
            setUploading(false);
        }
    };

    const handleDeleteFile = async (file) => {
        if (!window.confirm(`Delete "${file.name}"?`)) return;
        try {
            const fileRef = ref(storage, file.fullPath);
            await deleteObject(fileRef);
            await loadFiles();
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete file.');
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase();
        const colorMap = {
            pdf: 'text-red-400', docx: 'text-blue-400', doc: 'text-blue-400',
            pptx: 'text-orange-400', xlsx: 'text-emerald-400', csv: 'text-emerald-400',
            txt: 'text-zinc-400', md: 'text-purple-400', html: 'text-yellow-400'
        };
        return <FileText size={20} className={colorMap[ext] || 'text-zinc-400'} strokeWidth={1.5} />;
    };

    return (
        <div className="w-full h-full flex flex-col pt-4 md:pt-12 px-2 md:px-0">
            {!isEmbedded && (
                <h1 className="text-3xl font-light tracking-tight mb-8">Intelligent Library</h1>
            )}

            {/* Premium Upload Section */}
            <div className="w-full flex-shrink-0 flex flex-col md:flex-row items-center md:items-start gap-12 md:gap-24 mb-16 px-4 md:px-8 relative">
                {/* Left Side: Typography & Action */}
                <div className="flex-1 flex flex-col items-start text-left relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,1)]" />
                        <span className="text-[10px] uppercase font-mono tracking-[0.3em] text-blue-500/80">RAG System Online</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tighter text-white mb-6 leading-[1.1]">
                        Chat With Your <br className="hidden md:block"/>
                        <span className="text-zinc-500">Knowledge Base.</span>
                    </h2>
                    
                    <p className="text-sm text-zinc-500 font-light max-w-md leading-relaxed mb-12">
                        Upload documents (PDF, DOCX, TXT, etc) securely to context. 
                        The AI will read, index, and intelligently answer questions based entirely on your files.
                    </p>

                    <button
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="group relative px-8 py-4 bg-transparent border border-white/10 hover:border-blue-500/50 transition-all duration-500 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-blue-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                        <div className="relative flex items-center gap-4">
                            {uploading ? (
                                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" strokeWidth={1.5} />
                            ) : (
                                <Upload className="w-4 h-4 text-blue-500 group-hover:-translate-y-0.5 transition-transform duration-300" strokeWidth={1.5} />
                            )}
                            <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-zinc-300 group-hover:text-white transition-colors">
                                {uploading ? `Indexing Data... ${Math.round(uploadProgress)}%` : 'Add Documents'}
                            </span>
                        </div>
                        {/* Scanning Line */}
                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-blue-500/0 group-hover:bg-blue-500/50 transition-colors duration-500" />
                    </button>
                    <p className="text-[10px] font-mono text-zinc-600 mt-4 tracking-widest uppercase">Formats: .pdf, .docx, .txt, .csv</p>
                    
                    <input
                        type="file"
                        ref={fileRef}
                        className="hidden"
                        accept=".pdf,.docx,.pptx,.xlsx,.csv,.txt,.md,.html"
                        onChange={handleFileUpload}
                    />
                </div>

                {/* Right Side: Abstract Data Points */}
                <div className="w-full md:w-80 flex flex-col gap-4 mt-8 md:mt-0 relative z-10">
                    {[
                        { icon: Database, label: "Vector Search", desc: "Advanced semantic retrieval finds exact context." },
                        { icon: Lock, label: "Private Silos", desc: "Files securely isolated per user logic." },
                        { icon: Cpu, label: "Neural Processing", desc: "Analyzes documents rapidly to pull intelligence." }
                    ].map((item, idx) => (
                        <div key={idx} className="relative p-6 border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] backdrop-blur-sm transition-all duration-500 group">
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="flex items-start gap-4">
                                <item.icon className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 transition-colors mt-0.5" strokeWidth={1} />
                                <div>
                                    <h4 className="text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-300 mb-2">{item.label}</h4>
                                    <p className="text-xs text-zinc-600 font-light leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Existing Files Section */}
            <div className="flex-1 flex flex-col min-h-0 border-t border-white/5 bg-transparent relative z-10 pt-8 px-4 md:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-light text-zinc-300">Indexed Files</h3>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-mono text-zinc-600">{files.length} items</span>
                        {files.length > 0 && (
                            <button
                                onClick={() => navigate('/library')}
                                className="flex items-center gap-2 px-4 py-2 border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 text-xs font-mono uppercase tracking-widest transition-colors backdrop-blur-md"
                            >
                                Open Chat <ArrowRight size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {loadingFiles ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                ) : files.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center pb-12">
                        <FileText className="w-12 h-12 text-zinc-800 mb-4" strokeWidth={1} />
                        <p className="text-zinc-500 font-light max-w-sm">No documents found. Upload a file above to begin semantic indexing.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
                        {files.map((file) => (
                            <div key={file.fullPath} className="group flex items-center p-4 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 backdrop-blur-sm transition-all duration-300">
                                <div className="p-3 bg-[#0a0d14] border border-white/5 group-hover:border-blue-500/20 mr-4 transition-colors">
                                    {getFileIcon(file.name)}
                                </div>
                                <div className="flex-1 min-w-0 pr-4">
                                    <h4 className="text-sm font-medium text-zinc-300 truncate group-hover:text-white transition-colors">{file.name}</h4>
                                    <p className="text-[10px] font-mono text-zinc-600 uppercase mt-1">Ready for Chat</p>
                                </div>
                                <div className="flex items-center">
                                    <button
                                        onClick={() => handleDeleteFile(file)}
                                        className="p-2 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500/10"
                                        title="Delete File"
                                    >
                                        <Trash2 size={16} strokeWidth={1.5} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserFiles;
