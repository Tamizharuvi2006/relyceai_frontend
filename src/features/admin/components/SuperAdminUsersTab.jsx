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
                className="rounded-2xl shadow-2xl border p-8 bg-[#030508]/40 border-white/5 backdrop-blur-3xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
                <h2 className="text-[13px] font-mono tracking-widest uppercase mb-8 flex items-center text-white relative z-10">
                    <Search className="h-4 w-4 mr-3 text-emerald-400" />
                    Search & Manage Users
                </h2>

                <div className="flex space-x-4 mb-6 relative z-10">
                    <div className="flex-1 relative group/input">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5 group-focus-within/input:text-emerald-500/80 transition-colors" />
                        <input
                            type="email"
                            placeholder="Enter user email to search..."
                            value={searchEmail}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            className="w-full pl-14 pr-4 py-3.5 border rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 border-white/10 bg-white/5 text-white placeholder-zinc-600 transition-all font-mono tracking-wide"
                        />
                    </div>
                    <button
                        onClick={searchUserByEmail}
                        disabled={isSearching}
                        className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/5 disabled:border disabled:border-white/10 disabled:text-zinc-500 text-black font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center space-x-2"
                    >
                        {isSearching ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                        ) : (
                            <Search className="h-5 w-5" />
                        )}
                        <span>Search Directory</span>
                    </button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-t border-white/5 pt-8 mt-8 relative z-10"
                    >
                        <h3 className="text-[11px] font-mono tracking-widest text-zinc-500 uppercase mb-6">Search Results ({searchResults.length} found)</h3>
                        <div className="max-h-64 overflow-y-auto theme-scrollbar space-y-4 pr-2">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Admin Users Section */}
                <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="rounded-2xl shadow-2xl border p-8 bg-[#030508]/40 border-white/5 backdrop-blur-3xl flex flex-col h-[600px] relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-[50px] rounded-full pointer-events-none" />
                    <h2 className="text-[13px] font-mono tracking-widest uppercase mb-8 flex items-center justify-between text-white relative z-10">
                        <div className="flex items-center gap-3">
                            <UserCheck className="h-4 w-4 text-blue-400" />
                            Admin Users
                        </div>
                        <span className="text-[10px] px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-zinc-400">
                            {admins.length} ACTIVE
                        </span>
                    </h2>
                    {loading ? (
                        <div className="flex items-center justify-center py-8 flex-1 relative z-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <div className="overflow-y-auto theme-scrollbar space-y-3 flex-1 pr-2 relative z-10">
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
                                <div className="text-center py-8 h-full flex flex-col items-center justify-center">
                                    <UserCheck className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                                    <p className="text-sm text-zinc-500 font-light">
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
                    className="rounded-2xl shadow-2xl border p-8 bg-[#030508]/40 border-white/5 backdrop-blur-3xl flex flex-col h-[600px] relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 blur-[50px] rounded-full pointer-events-none" />
                    <h2 className="text-[13px] font-mono tracking-widest uppercase mb-8 flex items-center justify-between text-white relative z-10">
                        <div className="flex items-center gap-3">
                            <Crown className="h-4 w-4 text-amber-400" />
                            Super Admin Users
                        </div>
                        <span className="text-[10px] px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-zinc-400">
                            {superadmins.length} ACTIVE
                        </span>
                    </h2>
                    {loading ? (
                        <div className="flex items-center justify-center py-8 flex-1 relative z-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                        </div>
                    ) : (
                        <div className="overflow-y-auto theme-scrollbar space-y-3 flex-1 pr-2 relative z-10">
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
                                <div className="text-center py-8 h-full flex flex-col items-center justify-center">
                                    <Crown className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                                    <p className="text-sm text-zinc-500 font-light">
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
