import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../context/ThemeContext';
import { Mail, Trash2 } from 'lucide-react';

const SearchUserCard = ({ user, onRoleChange, onPlanChange, onDeleteUser }) => {
    const { theme } = useTheme();

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return theme === 'dark' ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400' : 'bg-emerald-100 text-emerald-800';
            case 'superadmin': return theme === 'dark' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400' : 'bg-yellow-100 text-yellow-800';
            default: return theme === 'dark' ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200' : 'bg-slate-100 text-slate-800';
        }
    };

    const getPlanColor = (plan) => {
        switch (plan) {
            case 'business': return theme === 'dark' ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400' : 'bg-purple-100 text-purple-800';
            case 'plus': return theme === 'dark' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' : 'bg-blue-100 text-blue-800';
            case 'pro': return theme === 'dark' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' : 'bg-blue-100 text-blue-800';
            case 'student': return theme === 'dark' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' : 'bg-green-100 text-green-800';
            default: return theme === 'dark' ? 'bg-zinc-100 dark:bg-zinc-700/20 text-zinc-800 dark:text-zinc-400' : 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${theme === 'dark'
                ? 'border-zinc-600 hover:bg-zinc-700'
                : 'border-slate-200 hover:bg-slate-50'
                }`}
        >
            <div className="flex items-center space-x-4 flex-1">
                <div className="flex-shrink-0">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-emerald-100'
                        }`}>
                        <Mail className={`h-5 w-5 ${theme === 'dark' ? 'text-emerald-600 dark:text-emerald-400' : 'text-emerald-600'
                            }`} />
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-zinc-900 dark:text-white' : 'text-slate-900'
                        }`}>
                        {user.displayName || user.email}
                    </p>
                    <p className={`text-xs truncate ${theme === 'dark' ? 'text-zinc-500 dark:text-zinc-400' : 'text-slate-500'
                        }`}>
                        {user.email}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role || 'user')}`}>
                            {(user.role || 'user').charAt(0).toUpperCase() + (user.role || 'user').slice(1)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(user.membership?.plan || 'free')}`}>
                            {(user.membership?.plan || 'free').charAt(0).toUpperCase() + (user.membership?.plan || 'free').slice(1)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                {/* Role Dropdown */}
                <select
                    value={user.role || 'user'}
                    onChange={(e) => onRoleChange(user.id, e.target.value, user.role)}
                    className={`px-2 py-1 text-xs border rounded ${theme === 'dark'
                        ? 'border-zinc-600 bg-zinc-700 text-white'
                        : 'border-slate-300 bg-white text-slate-900'
                        }`}
                >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                </select>

                {/* Plan Dropdown */}
                <select
                    value={user.membership?.plan || 'free'}
                    onChange={(e) => onPlanChange(user.id, e.target.value)}
                    className={`px-2 py-1 text-xs border rounded ${theme === 'dark'
                        ? 'border-zinc-600 bg-zinc-700 text-white'
                        : 'border-slate-300 bg-white text-slate-900'
                        }`}
                >
                    <option value="free">Free</option>
                    <option value="student">Student</option>
                    <option value="plus">Plus</option>
                    <option value="pro">Pro</option>
                    <option value="business">Business</option>
                </select>

                {/* Delete Button */}
                <button
                    onClick={() => onDeleteUser(user.id)}
                    className="p-1 text-red-600 hover:text-red-900 dark:hover:text-red-300"
                    title="Delete User"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </motion.div>
    );
};

export default SearchUserCard;
