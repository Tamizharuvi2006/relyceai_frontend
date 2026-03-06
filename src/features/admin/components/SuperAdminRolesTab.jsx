import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, UserCheck, Crown, Search, Package, Loader2, Check, X } from 'lucide-react';
import StatCard from './StatCard';

const SuperAdminRolesTab = ({
    tabVariants,
    allUsers,
    admins,
    superadmins,
    onPlanChange // Function to call when changing user plan
}) => {
    const theme = 'dark';

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState(null);

    // Plan assignment state
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState('');
    const [isAssigning, setIsAssigning] = useState(false);
    const [assignmentSuccess, setAssignmentSuccess] = useState(null);

    const planOptions = [
        { value: 'free', label: 'Free', color: 'zinc' },
        { value: 'student', label: 'Student', color: 'emerald' },
        { value: 'plus', label: 'Plus', color: 'blue' },
        { value: 'pro', label: 'Pro', color: 'violet' },
        { value: 'business', label: 'Business', color: 'amber' }
    ];

    // Debounced search function
    const handleSearch = useCallback((query) => {
        setSearchQuery(query);

        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        if (!query.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);

        // Debounce: wait 500ms before searching
        const timeout = setTimeout(() => {
            const lowerQuery = query.toLowerCase();

            // Search by uniqueUserId (like ri001) or email
            const results = allUsers.filter(user =>
                (user.uniqueUserId && user.uniqueUserId.toLowerCase().includes(lowerQuery)) ||
                (user.email && user.email.toLowerCase().includes(lowerQuery)) ||
                (user.displayName && user.displayName.toLowerCase().includes(lowerQuery))
            );

            setSearchResults(results.slice(0, 10)); // Limit to 10 results
            setIsSearching(false);
        }, 500);

        setSearchTimeout(timeout);
    }, [allUsers, searchTimeout]);

    // Select user for plan assignment
    const selectUserForPlan = (user) => {
        setSelectedUser(user);
        setSelectedPlan(user.membership?.plan || 'free');
        setAssignmentSuccess(null);
    };

    // Assign plan to user
    const handleAssignPlan = async () => {
        if (!selectedUser || !selectedPlan) return;

        setIsAssigning(true);
        try {
            if (onPlanChange) {
                await onPlanChange(selectedUser.id, selectedPlan);
            }
            setAssignmentSuccess(true);

            // Reset after 2 seconds
            setTimeout(() => {
                setAssignmentSuccess(null);
                setSelectedUser(null);
                setSelectedPlan('');
                setSearchQuery('');
                setSearchResults([]);
            }, 2000);
        } catch (error) {
            console.error('Error assigning plan:', error);
            setAssignmentSuccess(false);
        } finally {
            setIsAssigning(false);
        }
    };

    // Plan distribution stats
    const planStats = useMemo(() => {
        const stats = { free: 0, student: 0, plus: 0, pro: 0, business: 0 };
        allUsers.forEach(user => {
            const plan = user.membership?.plan || 'free';
            if (stats[plan] !== undefined) stats[plan]++;
        });
        return stats;
    }, [allUsers]);

    return (
        <motion.div
            key="roles"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-8"
        >
            {/* Header */}
            <div>
                <h2 className="text-[14px] font-mono tracking-widest uppercase text-white flex items-center gap-3">
                    <Package className="h-5 w-5 text-emerald-400" />
                    Plan Management
                </h2>
                <p className="text-zinc-500 font-light mt-2 text-sm tracking-wide">Search users and assign membership plans</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {planOptions.map(plan => (
                    <div key={plan.value} className="rounded-2xl border border-white/5 bg-white/5 p-6 relative overflow-hidden group transition-all hover:bg-white/10">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-[30px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                        <p className="text-[10px] font-mono tracking-widest uppercase text-zinc-500 relative z-10">{plan.label}</p>
                        <p className="text-3xl font-light text-white mt-2 relative z-10">{planStats[plan.value]}</p>
                    </div>
                ))}
            </div>

            {/* Search and Assign Section */}
            <div className="bg-[#030508]/40 backdrop-blur-3xl rounded-2xl shadow-2xl border border-white/5 p-8 relative overflow-hidden flex flex-col max-h-[600px]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
                <h3 className="text-[13px] font-mono tracking-widest uppercase text-white mb-6 flex items-center gap-3 relative z-10 flex-shrink-0">
                    <Search className="h-4 w-4 text-emerald-400" />
                    Search Directory
                </h3>

                {/* Search Input */}
                <div className="relative mb-6 z-10">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="ENTER USER ID (E.G. RI001) OR EMAIL..."
                        className="w-full px-5 py-4 pl-12 border border-white/10 rounded-xl bg-black text-white placeholder-zinc-700 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all font-mono tracking-widest text-[11px] uppercase"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500/50" />
                    {isSearching && (
                        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400 animate-spin" />
                    )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && !selectedUser && (
                    <div className="mb-6 overflow-y-auto theme-scrollbar rounded-xl border border-white/5 bg-black/50 divide-y divide-white/5 relative z-10">
                        {searchResults.map(user => (
                            <button
                                key={user.id}
                                onClick={() => selectUserForPlan(user)}
                                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left group"
                            >
                                <div className="flex items-center gap-4">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="" className="h-10 w-10 rounded-full object-cover border border-white/10 group-hover:border-emerald-500/50 transition-colors" referrerPolicy="no-referrer" />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-mono text-emerald-400 group-hover:border-emerald-500/50 transition-colors">
                                            {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-[13px] font-medium tracking-wide text-white">
                                            <span className="text-zinc-500 font-mono text-[10px] tracking-widest uppercase mr-2">{user.uniqueUserId || 'NO ID'}</span>
                                            {user.displayName}
                                        </p>
                                        <p className="text-[10px] font-mono tracking-widest uppercase text-zinc-500 mt-0.5">{user.email}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded border border-${planOptions.find(p => p.value === (user.membership?.plan || 'free'))?.color || 'zinc'}-500/20 bg-${planOptions.find(p => p.value === (user.membership?.plan || 'free'))?.color || 'zinc'}-500/10 text-${planOptions.find(p => p.value === (user.membership?.plan || 'free'))?.color || 'zinc'}-400`}>
                                    {user.membership?.plan || 'free'}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {searchQuery && !isSearching && searchResults.length === 0 && !selectedUser && (
                    <p className="text-zinc-500 font-mono tracking-widest text-[11px] uppercase mb-6 relative z-10 pl-2">No users found matching "{searchQuery}"</p>
                )}

                {/* Selected User - Plan Assignment */}
                {selectedUser && (
                    <div className="bg-black/50 rounded-2xl p-6 border border-white/5 relative z-10">
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                            <div className="flex items-center gap-5">
                                {selectedUser.photoURL ? (
                                    <img src={selectedUser.photoURL} alt="" className="h-14 w-14 rounded-full object-cover border border-emerald-500/30" referrerPolicy="no-referrer" />
                                ) : (
                                    <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[16px] font-mono text-emerald-400">
                                        {(selectedUser.displayName || selectedUser.email || 'U').charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <p className="text-[15px] font-medium tracking-wide text-white mb-1">{selectedUser.displayName || 'Unknown'}</p>
                                    <p className="text-[11px] font-mono tracking-widest text-zinc-500 uppercase">
                                        <span className="text-zinc-400">{selectedUser.uniqueUserId}</span> • {selectedUser.email}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setSelectedUser(null); setAssignmentSuccess(null); }}
                                className="p-2.5 hover:bg-white/10 rounded-xl transition-colors bg-white/5 border border-white/5"
                            >
                                <X className="h-4 w-4 text-zinc-400" />
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row items-end gap-6">
                            <div className="flex-1 w-full">
                                <label className="block text-[10px] font-mono uppercase tracking-widest mb-3 text-emerald-400/80">
                                    Assign Plan
                                </label>
                                <select
                                    value={selectedPlan}
                                    onChange={(e) => setSelectedPlan(e.target.value)}
                                    className="w-full px-5 py-3.5 border rounded-xl border-white/10 bg-black text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all font-mono text-[11px] uppercase tracking-widest"
                                >
                                    {planOptions.map(plan => (
                                        <option key={plan.value} value={plan.value}>{plan.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-full md:w-auto">
                                <button
                                    onClick={handleAssignPlan}
                                    disabled={isAssigning || assignmentSuccess !== null}
                                    className={`w-full md:w-auto px-8 py-3.5 rounded-xl font-medium text-[13px] tracking-wide transition-all flex justify-center items-center gap-3 shadow-lg ${assignmentSuccess === true
                                        ? 'bg-emerald-500 text-black shadow-emerald-500/20'
                                        : assignmentSuccess === false
                                            ? 'bg-red-500 text-white shadow-red-500/20'
                                            : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20 active:scale-95'
                                        }`}
                                >
                                    {isAssigning ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} /> Assigning</>
                                    ) : assignmentSuccess === true ? (
                                        <><Check className="h-4 w-4" strokeWidth={2} /> Assigned</>
                                    ) : assignmentSuccess === false ? (
                                        <><X className="h-4 w-4" strokeWidth={2} /> Failed</>
                                    ) : (
                                        'Update User Plan'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Role Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Total Users" value={allUsers.length || 0} icon={Users} color="blue" theme={theme} />
                <StatCard title="Admin Users" value={admins.length || 0} icon={UserCheck} color="emerald" theme={theme} />
                <StatCard title="Super Admins" value={superadmins.length || 0} icon={Crown} color="yellow" theme={theme} />
            </div>
        </motion.div>
    );
};

export default SuperAdminRolesTab;
