import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { User, MoreVertical, Edit2, Trash2, Plus, X } from 'lucide-react';
import ChatService from '../../../services/chatService';

const PersonalityManagerModal = ({ isOpen, onClose, userId, personalities, setPersonalities, onEdit, setActivePersonality }) => {
    const { theme } = useTheme();
    const [actionMenuId, setActionMenuId] = useState(null);

    if (!isOpen) return null;

    const handleDelete = async (p) => {
        if (window.confirm(`Delete "${p.name}"?`)) {
            try {
                const uid = userId; // Passed from parent
                const success = await ChatService.deletePersonality(uid, p.id);
                if (success) {
                    // Refresh list
                    const res = await ChatService.getPersonalities(uid);
                    if (res.success && setPersonalities) {
                        setPersonalities(res.personalities);
                    }
                }
            } catch (error) {
                console.error("Failed to delete", error);
            }
        }
        setActionMenuId(null);
    };

    const isDark = theme === 'dark';
    const bgColor = isDark ? 'bg-zinc-900' : 'bg-white';
    const textColor = isDark ? 'text-white' : 'text-gray-900';
    const borderColor = isDark ? 'border-zinc-700' : 'border-gray-200';
    const hoverBg = isDark ? 'hover:bg-zinc-800' : 'hover:bg-gray-100';

    return (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`${bgColor} ${textColor} w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-4 border-b ${borderColor}`}>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <User className="text-emerald-500" />
                        Manage Personalities
                    </h2>
                    <button 
                        onClick={onClose}
                        className={`p-2 rounded-full ${hoverBg} transition-colors`}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {personalities && personalities.map(p => (
                        <div key={p.id} className={`flex items-center justify-between p-4 rounded-lg border ${borderColor} ${isDark ? 'bg-zinc-800/50' : 'bg-gray-50'}`}>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold">{p.name}</h3>
                                    {p.is_default && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">
                                            Default
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm opacity-70 mt-1 line-clamp-1">{p.description}</p>
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                                {!p.is_default && (
                                    <>
                                        <button
                                            onClick={() => onEdit(p)}
                                            className={`p-2 rounded-lg ${hoverBg} text-emerald-400 transition-colors`}
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(p)}
                                            className={`p-2 rounded-lg ${hoverBg} text-red-400 transition-colors`}
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </>
                                )}
                                {p.is_default && (
                                    <span className="text-xs opacity-50 italic px-2">System</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className={`p-4 border-t ${borderColor} flex justify-end`}>
                     <button
                        onClick={() => {
                            // Trigger create new
                            onEdit(null); // null means create new
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-emerald-900/20"
                    >
                        <Plus size={18} />
                        Create New Personality
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PersonalityManagerModal;
