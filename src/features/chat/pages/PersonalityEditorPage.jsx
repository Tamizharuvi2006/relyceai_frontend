import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { ArrowLeft, Save, Sparkles, AlertCircle, CheckCircle2, Bot, FileText, Info } from 'lucide-react';
import ChatService from '../../../services/chatService';
import { useAuth } from '../../../context/AuthContext';

const PersonalityEditorPage = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const { id } = useParams(); // If present, we are editing
    const { currentUser: user } = useAuth();
    
    const isEditing = !!id;
    const isDark = theme === 'dark';

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditing);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const MAX_PROMPT_LENGTH = 5000;

    useEffect(() => {
        const fetchPersonality = async () => {
            if (isEditing && user) {
                try {
                    // We need to fetch the specific personality. 
                    // Since we don't have a direct 'getOne' in service shown, we might need to filter from getAll or add getOne.
                    // For safety, let's use getPersonalities and find it. 
                    // (Ideally ChatService should have getPersonalityById)
                    const res = await ChatService.getPersonalities(user.uid);
                    if (res.success) {
                        const persona = res.personalities.find(p => p.id === id);
                        if (persona) {
                            setName(persona.name);
                            setDescription(persona.description);
                            setPrompt(persona.prompt);
                        } else {
                            setError("Personality not found.");
                        }
                    }
                } catch (err) {
                    console.error("Failed to load personality", err);
                    setError("Failed to load personality details.");
                } finally {
                    setInitialLoading(false);
                }
            } else {
                setInitialLoading(false);
            }
        };

        if (user) {
            fetchPersonality();
        }
    }, [id, user, isEditing]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;
        
        setError(null);
        setSuccessMessage('');

        // Basic Validation
        if (!name.trim()) return setError("Name is required");
        if (!prompt.trim()) return setError("System prompt is required");
        if (prompt.length > MAX_PROMPT_LENGTH) return setError(`System prompt must be under ${MAX_PROMPT_LENGTH} characters`);

        setLoading(true);

        try {
            let result;
            if (isEditing) {
                result = await ChatService.updatePersonality(user.uid, id, name, description, prompt);
            } else {
                result = await ChatService.createPersonality(user.uid, name, description, prompt);
            }

            if (result.success || (result.personality && !isEditing)) {
                setSuccessMessage(isEditing ? "Changes saved successfully!" : "Personality created successfully!");
                // Short delay before navigating back
                setTimeout(() => {
                    navigate('/personalities');
                }, 1000);
            } else {
                setError(result.error || `Failed to ${isEditing ? 'update' : 'create'} personality`);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#09090b] text-white' : 'bg-gray-50 text-gray-900'}`}>
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDark ? 'bg-[#09090b] text-white' : 'bg-gray-50 text-gray-900'} p-6 md:p-12 transition-colors duration-300`}>
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button 
                        onClick={() => navigate('/personalities')}
                        className={`p-3 rounded-full ${isDark ? 'hover:bg-zinc-800 bg-zinc-900/50 border border-zinc-800' : 'hover:bg-gray-200'} transition-all hover:scale-105 group`}
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold">{isEditing ? 'Edit Personality' : 'Create New Persona'}</h1>
                        <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>
                            Define how your AI assistant thinks and speaks.
                        </p>
                    </div>
                </div>

                <div className={`relative p-8 rounded-3xl border ${isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-gray-100 shadow-xl'} overflow-hidden`}>
                     {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
                    
                    <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-3 animate-in shake">
                                <AlertCircle size={20} />
                                <span>{error}</span>
                            </div>
                        )}
                         
                         {successMessage && (
                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-3 animate-in slide-in-from-top-2">
                                <CheckCircle2 size={20} />
                                <span>{successMessage}</span>
                            </div>
                        )}

                        {/* Name Input */}
                        <div className="space-y-2 group">
                            <label className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-zinc-400 group-focus-within:text-emerald-400' : 'text-gray-600 group-focus-within:text-emerald-600'} transition-colors`}>
                                <Bot size={16} /> Persona Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`w-full px-5 py-4 rounded-xl border text-lg font-medium transition-all outline-none 
                                    ${isDark ? 'bg-zinc-950/50 border-zinc-800 focus:border-emerald-500/50 focus:bg-zinc-900' : 'bg-gray-50 border-gray-200 focus:border-emerald-500/50 focus:bg-white'} 
                                    placeholder-opacity-50`}
                                placeholder="e.g., Coding Wizard, Fitness Coach..."
                                required
                            />
                        </div>

                        {/* Description Input */}
                        <div className="space-y-2 group">
                            <label className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-zinc-400 group-focus-within:text-emerald-400' : 'text-gray-600 group-focus-within:text-emerald-600'} transition-colors`}>
                                <Info size={16} /> Short Description
                            </label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={`w-full px-5 py-4 rounded-xl border transition-all outline-none 
                                    ${isDark ? 'bg-zinc-950/50 border-zinc-800 focus:border-emerald-500/50 focus:bg-zinc-900' : 'bg-gray-50 border-gray-200 focus:border-emerald-500/50 focus:bg-white'}`}
                                placeholder="A brief summary of what this persona does..."
                                required
                            />
                        </div>

                        {/* System Prompt Input */}
                        <div className="space-y-2 group">
                            <div className="flex items-center justify-between">
                                <label className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-zinc-400 group-focus-within:text-emerald-400' : 'text-gray-600 group-focus-within:text-emerald-600'} transition-colors`}>
                                    <FileText size={16} /> System Instructions
                                </label>
                                <span className={`text-xs ${prompt.length > MAX_PROMPT_LENGTH ? 'text-red-500 font-bold' : 'opacity-40'}`}>
                                    {prompt.length} / {MAX_PROMPT_LENGTH}
                                </span>
                            </div>
                            
                            <div className={`relative rounded-xl border transition-all focus-within:ring-1 focus-within:ring-emerald-500/50
                                ${isDark ? 'bg-zinc-950/50 border-zinc-800 focus-within:bg-zinc-900' : 'bg-gray-50 border-gray-200 focus-within:bg-white'}`}>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    className="w-full h-64 px-5 py-4 bg-transparent border-none outline-none resize-none font-mono text-sm leading-relaxed"
                                    placeholder="You are a helpful assistant. You always answer in rhymes..."
                                    required
                                />
                                <div className="absolute bottom-3 right-4 pointer-events-none opacity-40">
                                    <Sparkles size={16} />
                                </div>
                            </div>
                            <p className="text-xs opacity-50 mt-1 pl-1">
                                Detailed instructions on how the AI should behave, speak, and format answers.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-dashed border-zinc-800/50">
                            <button
                                type="button"
                                onClick={() => navigate('/personalities')}
                                className={`px-6 py-3 rounded-xl font-medium transition-colors ${isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-gray-100 text-gray-600'}`}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || prompt.length > MAX_PROMPT_LENGTH}
                                className={`flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100
                                ${loading ? 'cursor-wait' : ''}`}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        <span>{isEditing ? 'Save Changes' : 'Create Persona'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PersonalityEditorPage;
