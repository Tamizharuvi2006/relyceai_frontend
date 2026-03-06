import React, { memo } from 'react';
import { Search, User, Trash2, Edit, CheckCircle, Shield, CreditCard, ChevronLeft, ChevronRight, Users } from 'lucide-react';

const RoleBadge = ({ role }) => {
    const colors = {
        superadmin: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        admin: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        user: 'bg-white/5 text-zinc-400 border-white/10'
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[role] || colors.user} capitalize inline-flex items-center gap-1`}>
            {role === 'superadmin' && <Shield className="w-3 h-3" />}
            {role}
        </span>
    );
};

const PlanBadge = ({ plan }) => {
    const colors = {
        business: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        pro: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        plus: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        student: 'bg-green-500/10 text-green-400 border-green-500/20',
        free: 'bg-white/5 text-zinc-400 border-white/10'
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[plan] || colors.free} capitalize`}>
            {plan}
        </span>
    );
};

const UserIdDisplay = ({ uniqueId, rawId }) => {
    const [showRaw, setShowRaw] = React.useState(false);
    return (
        <div className="flex flex-col mt-0.5">
            <button 
                onClick={() => setShowRaw(!showRaw)}
                className="flex items-center gap-1 text-xs text-zinc-600 font-mono opacity-70 hover:opacity-100 hover:text-emerald-500 transition-all w-fit"
            >
                <span>ID: {uniqueId}</span>
                <ChevronRight size={10} className={`transform transition-transform ${showRaw ? 'rotate-90' : ''}`} />
            </button>
            {showRaw && (
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5 select-all cursor-text bg-white/5 px-1 py-0.5 rounded border border-white/5 w-fit">
                    {rawId}
                </div>
            )}
        </div>
    );
};

const SubscriptionCell = ({ user, planOptions, handleMembershipChange }) => {
    const defaultPlan = user?.membership?.plan || 'free';
    const defaultCycle = user?.membership?.billingCycle || 'monthly';
    const [plan, setPlan] = React.useState(defaultPlan);
    const [billingCycle, setBillingCycle] = React.useState(defaultCycle);
    const [isSaving, setIsSaving] = React.useState(false);

    React.useEffect(() => {
        setPlan(user?.membership?.plan || 'free');
        setBillingCycle(user?.membership?.billingCycle || 'monthly');
    }, [user?.membership?.plan, user?.membership?.billingCycle]);

    const handleSave = async () => {
        setIsSaving(true);
        await handleMembershipChange(user.id, plan, billingCycle);
        setIsSaving(false);
    };

    const hasChanged = plan !== (user?.membership?.plan || 'free') || billingCycle !== (user?.membership?.billingCycle || 'monthly');

    const parseExpiry = (dateVal) => {
        if (!dateVal) return null;
        if (dateVal.seconds) return new Date(dateVal.seconds * 1000);
        return new Date(dateVal);
    };
    
    const expiryDateObj = parseExpiry(user?.membership?.expiryDate);
    const formattedExpiry = expiryDateObj ? expiryDateObj.toLocaleDateString() : 'N/A';

    return (
        <div className="flex flex-col gap-2 min-w-[200px]">
            <div className="flex gap-2 items-center">
                <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    className="bg-[#030508] border border-white/10 text-zinc-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 hover:border-white/20 transition-colors w-24"
                >
                    {planOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
                
                {plan !== 'free' && (
                    <select
                        value={billingCycle}
                        onChange={(e) => setBillingCycle(e.target.value)}
                        className="bg-[#030508] border border-white/10 text-zinc-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 hover:border-white/20 transition-colors w-24"
                    >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                )}
            </div>
            
            <div className="flex items-center justify-between mt-1">
                <div className="flex flex-col items-start">
                    <PlanBadge plan={user?.membership?.plan || 'free'} />
                    {user?.membership?.plan !== 'free' && expiryDateObj && (
                        <span className="text-[10px] text-zinc-500 font-mono mt-1">
                            Exp: <span className="text-zinc-300">{formattedExpiry}</span>
                        </span>
                    )}
                </div>
                {hasChanged && (
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="ml-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] rounded border border-emerald-500/20 transition-colors whitespace-nowrap font-medium"
                    >
                        {isSaving ? '...' : 'Save'}
                    </button>
                )}
            </div>
        </div>
    );
};

const UsersTab = memo(({
    searchTerm,
    handleSearch,
    loading,
    currentUsers,
    handleRoleChange,
    accessLevel,
    getRoleOptions,
    handleMembershipChange,
    planOptions,
    handleDeleteUser,
    totalPages,
    currentPage,
    paginate,
    indexOfFirstUser,
    indexOfLastUser,
    filteredUsersLength
}) => {
    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-[14px] font-mono tracking-widest uppercase text-white flex items-center gap-3">
                        <Users className="h-5 w-5 text-emerald-400" />
                        User Management
                    </h2>
                    <p className="text-zinc-500 mt-2 font-light text-sm tracking-wide">Manage user access, roles, and subscriptions.</p>
                </div>

                <div className="relative group w-full md:w-96 z-10">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="SEARCH BY NAME, EMAIL, OR ID..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="block w-full pl-12 pr-4 py-4 border border-white/10 rounded-xl bg-black text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-mono tracking-widest text-[11px] uppercase shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-[#030508]/40 backdrop-blur-3xl rounded-2xl border border-white/5 relative overflow-hidden shadow-2xl flex flex-col max-h-[600px]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
                <div className="overflow-y-auto theme-scrollbar relative z-10 flex-1">
                    <table className="min-w-full divide-y divide-white/5 relative">
                        <thead className="bg-[#030508]/90 backdrop-blur-md sticky top-0 z-20">
                            <tr>
                                <th className="px-6 py-5 text-left text-[10px] font-mono text-zinc-500 uppercase tracking-widest whitespace-nowrap">User Identity</th>
                                <th className="px-6 py-5 text-left text-[10px] font-mono text-zinc-500 uppercase tracking-widest whitespace-nowrap">Subscription</th>
                                <th className="px-6 py-5 text-left text-[10px] font-mono text-zinc-500 uppercase tracking-widest whitespace-nowrap">Usage Stats</th>
                                <th className="px-6 py-5 text-left text-[10px] font-mono text-zinc-500 uppercase tracking-widest whitespace-nowrap">Joined</th>
                                <th className="px-6 py-5 text-right text-[10px] font-mono text-zinc-500 uppercase tracking-widest whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-transparent">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-zinc-500">
                                        <div className="flex flex-col items-center">
                                            <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                            Loading user directory...
                                        </div>
                                    </td>
                                </tr>
                            ) : currentUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-zinc-500">
                                        No users found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                currentUsers.map((user) => (
                                    <tr key={user.id} className="group hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono text-xs">
                                                        {user.photoURL ? (
                                                            <img src={user.photoURL} alt="" className="h-10 w-10 rounded-full object-cover border border-white/10" />
                                                        ) : (
                                                            <span>{user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-[13px] font-medium tracking-wide text-white group-hover:text-emerald-400 transition-colors">
                                                        {user.displayName || 'Unnamed User'}
                                                    </div>
                                                    <div className="text-[10px] font-mono tracking-widest text-zinc-500 mt-0.5 uppercase">{user.email}</div>
                                                    <UserIdDisplay uniqueId={user.uniqueUserId} rawId={user.id} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <SubscriptionCell 
                                                user={user} 
                                                planOptions={planOptions} 
                                                handleMembershipChange={handleMembershipChange} 
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs text-zinc-400">Chats: <span className="text-white">{user.stats?.conversations || 0}</span></span>
                                                <span className="text-xs text-zinc-400">Files: <span className="text-white">{user.stats?.filesUploaded || 0}</span></span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-500">
                                            {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors" title="Edit User">
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id, user.email)}
                                                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Styled Pagination */}
                {totalPages > 1 && (
                    <div className="bg-white/5 px-4 py-3 flex items-center justify-between border-t border-white/5">
                        <div className="flex items-center text-sm text-zinc-500">
                            Showing <span className="font-medium text-white mx-1">{indexOfFirstUser + 1}</span> to{' '}
                            <span className="font-medium text-white mx-1">{Math.min(indexOfLastUser, filteredUsersLength)}</span> of{' '}
                            <span className="font-medium text-white mx-1">{filteredUsersLength}</span> results
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                // Simple logic for showing 5 pages max around current
                                // For brevity, implementing simple array map
                                let pageNum = i + 1;
                                if (totalPages > 5) {
                                    // (simplified standard pagination logic omitted for brevity, showing first 5)
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => paginate(pageNum)}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                            : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

UsersTab.displayName = 'UsersTab';

export default UsersTab;
