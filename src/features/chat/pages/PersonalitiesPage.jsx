import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { User, Edit2, Trash2, Plus, ArrowLeft, ArrowRight, Shield, Sparkles, Zap, Smartphone, Monitor } from 'lucide-react';
import ChatService from '../../../services/chatService';
import { useAuth } from '../../../context/AuthContext';

const PersonalitiesPage = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const { currentUser: user } = useAuth();
    const [personalities, setPersonalities] = useState([]);
    const [loading, setLoading] = useState(true);

    const isDark = theme === 'dark';

    const fetchPersonalities = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const uid = user.uid;
            const res = await ChatService.getPersonalities(uid);
            if (res.success) {
                setPersonalities(res.personalities);
            }
        } catch (error) {
            console.error("Failed to load personalities", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchPersonalities();
        }
    }, [user]);

    const handleDelete = async (e, p) => {
        e.stopPropagation();
        if (window.confirm(`Delete "${p.name}"?`)) {
            try {
                const uid = user.uid;
                const success = await ChatService.deletePersonality(uid, p.id);
                if (success) {
                    fetchPersonalities();
                }
            } catch (error) {
                console.error("Failed to delete", error);
            }
        }
    };

    const handleEdit = (e, p) => {
        e.stopPropagation();
        navigate(`/personalities/edit/${p.id}`);
    };

    return (
        <div className={`min-h-screen pt-24 pb-12 ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
            {/* Background Gradients */}
            <div className={`fixed inset-0 pointer-events-none transition-opacity duration-1000 ${isDark ? 'opacity-30' : 'opacity-10'}`}>
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-500/20 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Hero / Header Section */}
                <div className="mb-16 text-center md:text-left flex flex-col md:flex-row items-end justify-between gap-8">
                    <div className="max-w-2xl">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                            AI Personas
                        </h1>
                        <p className={`text-lg md:text-xl font-light leading-relaxed ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>
                            Curate your team of AI assistants. Design their personality, expertise, and tone to perfectly match your workflow.
                        </p>
                    </div>
                    
                    <button
                        onClick={() => navigate('/personalities/create')}
                        className="hidden md:flex group relative px-8 py-4 rounded-full bg-emerald-500 text-black font-bold text-lg hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] active:scale-95"
                    >
                        <span className="flex items-center gap-2">
                           <Plus size={24} strokeWidth={3} /> Create Persona
                        </span>
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`h-64 rounded-3xl animate-pulse ${isDark ? 'bg-zinc-900/50' : 'bg-gray-200'}`} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        
                        {/* Mobile Create Button */}
                         <button
                            onClick={() => navigate('/personalities/create')}
                            className="md:hidden w-full mb-6 py-4 rounded-xl bg-emerald-600 text-white font-bold shadow-lg flex items-center justify-center gap-2"
                        >
                            <Plus size={20} /> Create New Persona
                        </button>

                        {personalities.map(p => {
                            const isSystemLocked = p.is_system === true;
                            const isEditable = !isSystemLocked;
                            
                            // Badge configuration
                            let badgeConfig = { text: 'Custom', color: 'emerald', icon: User };
                            if (isSystemLocked) badgeConfig = { text: 'System Core', color: 'blue', icon: Shield };
                            else if (p.is_default) badgeConfig = { text: 'Template', color: 'amber', icon: Sparkles };
                            else if (p.is_shadow) badgeConfig = { text: 'Modified', color: 'purple', icon: Zap };

                            return (
                                <div 
                                    key={p.id} 
                                    className={`group relative p-8 rounded-3xl border transition-all duration-500 ease-out hover:-translate-y-2 
                                    ${isDark 
                                        ? 'bg-zinc-900/40 border-zinc-800/50 hover:bg-zinc-900/80 hover:border-emerald-500/30 hover:shadow-[0_0_50px_-12px_rgba(16,185,129,0.2)]' 
                                        : 'bg-white/80 border-gray-100 hover:border-emerald-200 hover:shadow-xl'
                                    } backdrop-blur-xl flex flex-col justify-between overflow-hidden cursor-default`}
                                >
                                    {/* Interactive Glow Effect on Hover */}
                                    <div className={`absolute -inset-1 bg-gradient-to-r ${isSystemLocked ? 'from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/10 group-hover:to-indigo-500/10' : 'from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/10 group-hover:to-teal-500/10'} rounded-3xl blur transition-all duration-500`} />

                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-6">
                                            {/* Avatar Area */}
                                            <div className="relative">
                                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg transition-transform group-hover:scale-110 duration-500
                                                    ${isSystemLocked 
                                                        ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-blue-900/20' 
                                                        : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-900/20'
                                                    }`}
                                                >
                                                    {p.name.charAt(0)}
                                                </div>
                                                {/* Status Dot */}
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                                                    <div className={`w-3 h-3 rounded-full ${isSystemLocked ? 'bg-blue-400' : 'bg-emerald-400 animate-pulse'}`} />
                                                </div>
                                            </div>

                                            {/* Badge */}
                                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border backdrop-blur-md
                                                ${badgeConfig.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}
                                                ${badgeConfig.color === 'blue' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : ''}
                                                ${badgeConfig.color === 'amber' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : ''}
                                                ${badgeConfig.color === 'purple' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : ''}
                                            `}>
                                                <badgeConfig.icon size={10} strokeWidth={3} />
                                                {badgeConfig.text}
                                            </span>
                                        </div>
                                        
                                        <h3 className="text-2xl font-bold mb-3 tracking-tight group-hover:text-emerald-400 transition-colors">
                                            {p.name}
                                        </h3>
                                        
                                        <p className={`text-sm leading-relaxed mb-8 line-clamp-3 ${isDark ? 'text-zinc-400 group-hover:text-zinc-300' : 'text-gray-500'} transition-colors`}>
                                            {p.description}
                                        </p>
                                    </div>

                                    {/* Action Footer */}
                                    <div className={`relative z-10 pt-6 border-t ${isDark ? 'border-zinc-800/50' : 'border-gray-100'} flex items-center justify-between`}>
                                        <div className="flex items-center gap-4 text-xs font-mono opacity-50">
                                            <span className="flex items-center gap-1"><Monitor size={12} /> Web</span>
                                            <span className="flex items-center gap-1"><Smartphone size={12} /> Mobile</span>
                                        </div>

                                        <div className="flex items-center gap-2 transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                            {isEditable ? (
                                                <>
                                                    {!p.is_default && (
                                                        <button 
                                                            onClick={(e) => handleDelete(e, p)}
                                                            className="p-2.5 rounded-xl hover:bg-red-500/20 text-red-500 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={(e) => handleEdit(e, p)}
                                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all
                                                            ${isDark ? 'bg-white text-black hover:bg-emerald-400' : 'bg-black text-white hover:bg-emerald-600'}
                                                        `}
                                                    >
                                                        Edit <Edit2 size={14} />
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="flex items-center gap-1 text-xs font-bold text-zinc-500 bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-zinc-700">
                                                    <Shield size={12} /> LOCKED
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Create New Card */}
                        <div 
                            onClick={() => navigate('/personalities/create')}
                            className={`group relative p-8 rounded-3xl border border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-500 min-h-[360px]
                            ${isDark 
                                ? 'border-zinc-700/50 bg-transparent hover:bg-zinc-900/50 hover:border-emerald-500/50' 
                                : 'border-gray-300 hover:bg-gray-50 hover:border-emerald-400'}
                            `}
                        >
                            <div className="w-20 h-20 rounded-full bg-zinc-800/50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-500">
                                <Plus size={40} className={`text-zinc-500 group-hover:text-emerald-400 transition-colors ${isDark ? '' : 'text-gray-400'}`} />
                            </div>
                            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-zinc-300 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                Create Custom Persona
                            </h3>
                            <p className="text-sm text-zinc-500 max-w-[200px]">
                                Design a specialized AI assistant with unique instructions.
                            </p>
                            
                            <div className="mt-8 flex items-center gap-2 text-emerald-500 font-bold text-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                                Get Started <ArrowRight size={16} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PersonalitiesPage;
