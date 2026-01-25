import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Crown, Users } from 'lucide-react';

const AdminUserCard = ({ user, onRoleChange, userType, onDeleteUser }) => {
    // Enforce dark theme
    const theme = 'dark';

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400';
            case 'superadmin': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
            default: return 'bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200';
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
            className="flex items-center justify-between p-4 border rounded-lg transition-colors border-zinc-600 hover:bg-zinc-700"
        >
            <div className="flex items-center space-x-3 flex-1">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${user.role === 'superadmin'
                    ? 'bg-yellow-100 dark:bg-yellow-900/20'
                    : 'bg-emerald-100 dark:bg-emerald-900/20'
                    }`}>
                    <RoleIcon className={`h-5 w-5 ${user.role === 'superadmin'
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                        }`} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-zinc-900 dark:text-white">
                        {user.displayName || user.email}
                    </p>
                    <p className="text-xs truncate text-zinc-500 dark:text-zinc-400">
                        {user.email}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role || 'user')}`}>
                            {(user.role || 'user').charAt(0).toUpperCase() + (user.role || 'user').slice(1)}
                        </span>
                        {user.roleChangedAt && (
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                Modified {new Date(user.roleChangedAt).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
                {/* Role Management Dropdown */}
                <div className="flex flex-col space-y-1">
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        Role
                    </label>
                    <select
                        value={user.role || 'user'}
                        onChange={(e) => onRoleChange(user.id, e.target.value, user.role)}
                        className="px-3 py-1 text-sm border rounded-md border-zinc-600 bg-zinc-700 text-white hover:bg-zinc-600 transition-colors focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Super Admin</option>
                    </select>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-1">
                    <button
                        onClick={() => {
                            const newRole = user.role === 'superadmin' ? 'admin' : user.role === 'admin' ? 'user' : 'admin';
                            onRoleChange(user.id, newRole, user.role);
                        }}
                        className={`px-3 py-1 text-xs rounded-md transition-colors ${user.role === 'superadmin'
                            ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                            : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            }`}
                        title={user.role === 'superadmin' ? 'Demote to Admin' : user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                    >
                        {user.role === 'superadmin' ? 'Demote' : user.role === 'admin' ? 'Demote' : 'Promote'}
                    </button>
                    <button
                        onClick={() => onDeleteUser(user.id)}
                        className="px-3 py-1 text-xs rounded-md bg-red-500 hover:bg-red-600 text-white"
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
