import React from 'react';
import { motion } from 'framer-motion';
import { Search, UserCheck, Crown } from 'lucide-react';
import SearchUserCard from './SearchUserCard';
import AdminUserCard from './AdminUserCard';

const SuperAdminUsersTab = ({
    tabVariants,
    searchEmail,
    handleSearchInput,
    searchUserByEmail,
    isSearching,
    searchResults,
    changeUserRole,
    changeUserPlan,
    deleteUser,
    admins,
    superadmins,
    loading
}) => {
    // Enforce dark theme
    const theme = 'dark';

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    };

    return (
        <motion.div
            key="users"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6 h-full"
        >
            {/* User Search Section */}
            <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="rounded-lg shadow-sm border p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            >
                <h2 className="text-lg font-semibold mb-4 flex items-center text-zinc-900 dark:text-white">
                    <Search className="h-5 w-5 mr-2 text-emerald-500" />
                    Search & Manage Users (All Users)
                </h2>

                <div className="flex space-x-4 mb-6">
                    <div className="flex-1">
                        <input
                            type="email"
                            placeholder="Enter user email to search..."
                            value={searchEmail}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent border-zinc-600 bg-zinc-700 text-white placeholder-zinc-400"
                        />
                    </div>
                    <button
                        onClick={searchUserByEmail}
                        disabled={isSearching}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        {isSearching ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                            <Search className="h-4 w-4" />
                        )}
                        <span>Search</span>
                    </button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-t border-gray-200 dark:border-gray-700 pt-6"
                    >
                        <h3 className="text-md font-medium mb-4 text-zinc-900 dark:text-white">Search Results ({searchResults.length} found)</h3>
                        <div className="max-h-64 overflow-y-auto theme-scrollbar space-y-4">
                            {searchResults.map((user) => (
                                <SearchUserCard
                                    key={user.id}
                                    user={user}
                                    onRoleChange={changeUserRole}
                                    onPlanChange={changeUserPlan}
                                    onDeleteUser={deleteUser}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* Admin and Super Admin Management - 2 Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Admin Users Section */}
                <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="rounded-lg shadow-sm border p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                >
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-zinc-900 dark:text-white">
                        <UserCheck className="h-5 w-5 text-emerald-500" />
                        Admin Users ({admins.length})
                    </h2>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                        </div>
                    ) : (
                        <div className="max-h-80 overflow-y-auto theme-scrollbar space-y-3">
                            {admins.length > 0 ? (
                                admins.map((admin) => (
                                    <AdminUserCard
                                        key={admin.id}
                                        user={admin}
                                        onRoleChange={changeUserRole}
                                        userType="admin"
                                        onDeleteUser={deleteUser}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <UserCheck className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                        No admin users found
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Super Admin Users Section */}
                <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="rounded-lg shadow-sm border p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                >
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-zinc-900 dark:text-white">
                        <Crown className="h-5 w-5 text-yellow-500" />
                        Super Admin Users ({superadmins.length})
                    </h2>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                        </div>
                    ) : (
                        <div className="max-h-80 overflow-y-auto theme-scrollbar space-y-3">
                            {superadmins.length > 0 ? (
                                superadmins.map((superadmin) => (
                                    <AdminUserCard
                                        key={superadmin.id}
                                        user={superadmin}
                                        onRoleChange={changeUserRole}
                                        userType="superadmin"
                                        onDeleteUser={deleteUser}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <Crown className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                        No super admin users found
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
};

export default SuperAdminUsersTab;
