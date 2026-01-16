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
            className="space-y-6"
        >
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    <Package className="h-6 w-6 text-emerald-500" />
                    Plan Management
                </h2>
                <p className="text-zinc-400 mt-1">Search users and assign membership plans</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {planOptions.map(plan => (
                    <div key={plan.value} className={`rounded-xl border border-zinc-800 bg-zinc-900/50 p-4`}>
                        <p className="text-sm text-zinc-400">{plan.label}</p>
                        <p className="text-2xl font-bold text-white">{planStats[plan.value]}</p>
                    </div>
                ))}
            </div>

            {/* Search and Assign Section */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Search className="h-5 w-5 text-emerald-500" />
                    Search User by ID
                </h3>

                {/* Search Input */}
                <div className="relative mb-4">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Enter user ID (e.g., ri001) or email..."
                        className="w-full px-4 py-3 pl-11 border rounded-xl border-zinc-700 bg-zinc-800 text-white placeholder-zinc-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    {isSearching && (
                        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 animate-spin" />
                    )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && !selectedUser && (
                    <div className="mb-4 max-h-64 overflow-y-auto theme-scrollbar rounded-xl border border-zinc-700 divide-y divide-zinc-700">
                        {searchResults.map(user => (
                            <button
                                key={user.id}
                                onClick={() => selectUserForPlan(user)}
                                className="w-full p-3 flex items-center justify-between hover:bg-zinc-800 transition-colors text-left"
                            >
                                <div className="flex items-center gap-3">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                                            {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-white">
                                            {user.uniqueUserId || 'No ID'}
                                            <span className="text-zinc-500 ml-2">{user.displayName}</span>
                                        </p>
                                        <p className="text-xs text-zinc-500">{user.email}</p>
                                    </div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full bg-${planOptions.find(p => p.value === (user.membership?.plan || 'free'))?.color || 'zinc'}-500/20 text-${planOptions.find(p => p.value === (user.membership?.plan || 'free'))?.color || 'zinc'}-400`}>
                                    {user.membership?.plan || 'free'}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {searchQuery && !isSearching && searchResults.length === 0 && !selectedUser && (
                    <p className="text-zinc-500 text-sm mb-4">No users found matching "{searchQuery}"</p>
                )}

                {/* Selected User - Plan Assignment */}
                {selectedUser && (
                    <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                {selectedUser.photoURL ? (
                                    <img src={selectedUser.photoURL} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500/30" referrerPolicy="no-referrer" />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-sm font-bold text-white">
                                        {(selectedUser.displayName || selectedUser.email || 'U').charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-white">{selectedUser.displayName || 'Unknown'}</p>
                                    <p className="text-sm text-zinc-400">{selectedUser.uniqueUserId} • {selectedUser.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setSelectedUser(null); setAssignmentSuccess(null); }}
                                className="p-1.5 hover:bg-zinc-700 rounded-lg transition-colors"
                            >
                                <X className="h-4 w-4 text-zinc-400" />
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-2 text-zinc-400">
                                    Assign Plan
                                </label>
                                <select
                                    value={selectedPlan}
                                    onChange={(e) => setSelectedPlan(e.target.value)}
                                    className="w-full px-3 py-2.5 border rounded-lg border-zinc-600 bg-zinc-700 text-white focus:border-emerald-500 outline-none transition-colors"
                                >
                                    {planOptions.map(plan => (
                                        <option key={plan.value} value={plan.value}>{plan.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={handleAssignPlan}
                                    disabled={isAssigning || assignmentSuccess !== null}
                                    className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${assignmentSuccess === true
                                            ? 'bg-emerald-500 text-white'
                                            : assignmentSuccess === false
                                                ? 'bg-red-500 text-white'
                                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                        }`}
                                >
                                    {isAssigning ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" /> Assigning...</>
                                    ) : assignmentSuccess === true ? (
                                        <><Check className="h-4 w-4" /> Assigned!</>
                                    ) : assignmentSuccess === false ? (
                                        <><X className="h-4 w-4" /> Failed</>
                                    ) : (
                                        'Assign Plan'
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
