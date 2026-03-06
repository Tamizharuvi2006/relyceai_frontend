import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../context/ThemeContext';
import { Mail, Trash2 } from 'lucide-react';

const SearchUserCard = ({ user, onRoleChange, onPlanChange, onDeleteUser }) => {
    const { theme } = useTheme();

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
            case 'superadmin': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
            default: return 'bg-white/5 text-zinc-400 border border-white/10';
        }
    };

    const getPlanColor = (plan) => {
        switch (plan) {
            case 'business': return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
            case 'plus': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
            case 'pro': return 'bg-violet-500/10 text-violet-400 border border-violet-500/20';
            case 'student': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
            default: return 'bg-white/5 text-zinc-500 border border-white/10';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 border border-white/5 bg-white/5 rounded-xl transition-all duration-300 hover:bg-white/10 group focus-within:border-emerald-500/30"
        >
            <div className="flex items-center space-x-4 flex-1">
                <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
                        <Mail className="h-4 w-4 text-emerald-400" />
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium tracking-wide truncate text-white">
                        {user.displayName || user.email}
                    </p>
                    <p className="text-[10px] font-mono tracking-widest uppercase truncate text-zinc-500 mt-0.5">
                        {user.email}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase ${getRoleColor(user.role || 'user')}`}>
                            {user.role || 'user'}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase ${getPlanColor(user.membership?.plan || 'free')}`}>
                            {user.membership?.plan || 'free'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-3">
                {/* Role Dropdown */}
                <select
                    value={user.role || 'user'}
                    onChange={(e) => onRoleChange(user.id, e.target.value, user.role)}
                    className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest border rounded outline-none border-white/10 bg-black/50 text-white hover:bg-white/5 transition-colors focus:border-emerald-500/50"
                >
                    <option value="user">USER</option>
                    <option value="admin">ADMIN</option>
                    <option value="superadmin">SUPER ADMIN</option>
                </select>

                {/* Plan Dropdown */}
                <select
                    value={user.membership?.plan || 'free'}
                    onChange={(e) => onPlanChange(user.id, e.target.value)}
                    className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest border rounded outline-none border-white/10 bg-black/50 text-white hover:bg-white/5 transition-colors focus:border-emerald-500/50"
                >
                    <option value="free">FREE</option>
                    <option value="student">STUDENT</option>
                    <option value="plus">PLUS</option>
                    <option value="pro">PRO</option>
                    <option value="business">BUSINESS</option>
                </select>

                {/* Delete Button */}
                <button
                    onClick={() => onDeleteUser(user.id)}
                    className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded border border-transparent hover:border-red-500/20 transition-all ml-2"
                    title="Delete User"
                >
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                </button>
            </div>
        </motion.div>
    );
};

export default SearchUserCard;
