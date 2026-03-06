import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Crown, Users } from 'lucide-react';

const AdminUserCard = ({ user, onRoleChange, userType, onDeleteUser }) => {
    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
            case 'superadmin': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
            default: return 'bg-white/5 text-zinc-400 border border-white/10';
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin': return UserCheck;
            case 'superadmin': return Crown;
            default: return Users;
        }
    };

    const RoleIcon = getRoleIcon(user.role || 'user');

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-white/5 bg-white/5 rounded-xl transition-all duration-300 hover:bg-[#030508]/60 group relative overflow-hidden focus-within:border-emerald-500/30"
        >
            <div className="flex items-center space-x-4 flex-1 mb-4 sm:mb-0">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center border transition-colors ${user.role === 'superadmin'
                    ? 'bg-amber-500/10 border-amber-500/20 group-hover:border-amber-500/40'
                    : 'bg-blue-500/10 border-blue-500/20 group-hover:border-blue-500/40'
                    }`}>
                    <RoleIcon className={`h-5 w-5 ${user.role === 'superadmin'
                        ? 'text-amber-400'
                        : 'text-blue-400'
                        }`} strokeWidth={1.5} />
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
                        {user.roleChangedAt && (
                            <span className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase">
                                Mod: {new Date(user.roleChangedAt).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-3 sm:ml-4">
                {/* Role Management Dropdown */}
                <div className="flex flex-col space-y-1.5">
                    <label className="text-[10px] font-mono tracking-widest uppercase text-zinc-500">
                        Access Level
                    </label>
                    <select
                        value={user.role || 'user'}
                        onChange={(e) => onRoleChange(user.id, e.target.value, user.role)}
                        className="px-3 py-1.5 text-[11px] font-mono tracking-widest uppercase border rounded outline-none border-white/10 bg-black/50 text-white hover:bg-white/5 transition-colors focus:border-emerald-500/50"
                    >
                        <option value="user">USER</option>
                        <option value="admin">ADMIN</option>
                        <option value="superadmin">SUPER ADMIN</option>
                    </select>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 mt-1">
                    <button
                        onClick={() => {
                            const newRole = user.role === 'superadmin' ? 'admin' : user.role === 'admin' ? 'user' : 'admin';
                            onRoleChange(user.id, newRole, user.role);
                        }}
                        className={`px-3 py-1.5 text-[10px] font-mono tracking-widest uppercase rounded border transition-all ${user.role === 'superadmin'
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                            }`}
                        title={user.role === 'superadmin' ? 'Demote to Admin' : user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                    >
                        {user.role === 'superadmin' ? 'Demote' : user.role === 'admin' ? 'Demote' : 'Promote'}
                    </button>
                    <button
                        onClick={() => onDeleteUser(user.id)}
                        className="px-3 py-1.5 text-[10px] font-mono tracking-widest uppercase rounded border border-transparent hover:border-red-500/20 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Delete User"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminUserCard;
