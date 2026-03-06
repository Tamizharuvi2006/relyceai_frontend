import React from 'react';
import { motion } from 'framer-motion';
import {
    Users, DollarSign, TrendingUp, Activity,
    ShieldCheck, Crown, Server, CreditCard,
    ArrowUpRight, UserPlus, Settings
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const StatCard = ({ title, value, subtext, icon: Icon, color, trend }) => (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#030508]/40 backdrop-blur-3xl p-6 group transition-all duration-300 hover:bg-white/5">
        <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-${color}-500/10 blur-[40px] group-hover:bg-${color}-500/20 transition-all duration-500`} />
        {/* Subtle accent line on top */}
        <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-${color}-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        
        <div className="relative flex justify-between items-start">
            <div>
                <p className="text-[11px] font-mono tracking-widest uppercase text-zinc-500">{title}</p>
                <h3 className="mt-3 text-3xl font-light text-white tracking-tight font-mono">{value}</h3>
                {subtext && (
                    <div className="mt-3 flex items-center text-[11px] font-medium tracking-wide">
                        {trend === 'up' && <ArrowUpRight className="h-3 w-3 mr-1 text-emerald-400" />}
                        <span className={trend === 'up' ? "text-emerald-400" : "text-zinc-500"}>
                            {subtext}
                        </span>
                    </div>
                )}
            </div>
            <div className={`p-3 rounded-xl bg-white/5 text-${color}-400 shadow-inner border border-white/5 group-hover:border-${color}-500/30 transition-colors`}>
                <Icon className="h-5 w-5" strokeWidth={1.5} />
            </div>
        </div>
    </div>
);

const PlanBar = ({ label, count, total, color }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-end">
                <span className="text-xs font-light text-zinc-400 tracking-wide">{label}</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-xs font-mono text-white">{count}</span>
                    <span className="text-[10px] font-mono text-zinc-600">({percentage.toFixed(1)}%)</span>
                </div>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    className={`h-full bg-gradient-to-r from-${color}-600 to-${color}-400 rounded-full relative`}
                >
                    <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse blur-[2px]" />
                </motion.div>
            </div>
        </div>
    );
};

const QuickAction = ({ label, icon: Icon, onClick, color }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center justify-center p-5 rounded-xl border border-white/5 bg-[#030508]/40 hover:bg-white/10 transition-all duration-300 group backdrop-blur-3xl relative overflow-hidden"
    >
        <div className={`absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
        <div className={`p-3 rounded-xl bg-white/5 border border-white/5 text-${color}-400 mb-4 group-hover:border-${color}-500/30 group-hover:text-${color}-300 transition-all duration-300 relative z-10`}>
            <Icon className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <span className="text-[11px] font-medium tracking-widest uppercase text-zinc-400 group-hover:text-white transition-colors relative z-10">{label}</span>
    </button>
);

const SuperAdminOverviewTab = ({
    tabVariants,
    statistics,
    allUsers,
    admins,
    superadmins
}) => {
    const { theme } = useTheme();

    // Calculate plan counts
    const studentCount = allUsers.filter(u => u.membership?.plan === 'student').length;
    const plusCount = allUsers.filter(u => u.membership?.plan === 'plus').length;
    const proCount = allUsers.filter(u => u.membership?.plan === 'pro').length;
    const businessCount = allUsers.filter(u => u.membership?.plan === 'business').length;
    const totalSubs = studentCount + plusCount + proCount + businessCount;

    return (
        <motion.div
            key="overview"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-8"
        >
            {/* Header Section */}
            <div>
                <h2 className="text-2xl font-light text-white tracking-widest uppercase text-[15px]">Executive Dashboard</h2>
                <p className="text-zinc-500 font-light mt-1.5 text-sm">Real-time system overview and performance metrics.</p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`₹${statistics.monthlyRevenue?.toLocaleString() || 0}`}
                    subtext="+12.5% from last month"
                    icon={DollarSign}
                    color="emerald"
                    trend="up"
                />
                <StatCard
                    title="Active Users"
                    value={statistics.totalUsers || 0}
                    subtext={`${statistics.newUsersThisMonth || 0} new this month`}
                    icon={Users}
                    color="blue"
                    trend="up"
                />
                <StatCard
                    title="Subscription Growth"
                    value={`+${statistics.newUsersThisMonth || 0}`}
                    subtext="New subscribers this month"
                    icon={TrendingUp}
                    color="violet"
                    trend="up"
                />
                <StatCard
                    title="Active Sessions"
                    value={statistics.activeSessions || allUsers.length}
                    subtext="Users online today"
                    icon={Activity}
                    color="amber"
                    trend="up"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Subscription Distribution */}
                <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-[#030508]/40 p-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <h3 className="text-[13px] font-mono tracking-widest text-white flex items-center gap-3 uppercase">
                            <CreditCard className="h-4 w-4 text-indigo-400" />
                            Subscription Distribution
                        </h3>
                        <span className="text-[10px] font-mono tracking-widest px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-zinc-400 uppercase">
                            {totalSubs} Active Plans
                        </span>
                    </div>
                    <div className="space-y-6">
                        <PlanBar label="Student Plan" count={studentCount} total={statistics.totalUsers} color="emerald" />
                        <PlanBar label="Plus Plan" count={plusCount} total={statistics.totalUsers} color="blue" />
                        <PlanBar label="Pro Plan" count={proCount} total={statistics.totalUsers} color="violet" />
                        <PlanBar label="Business Plan" count={businessCount} total={statistics.totalUsers} color="amber" />
                    </div>
                </div>

                {/* Quick Actions & Role Stats */}
                <div className="space-y-6">
                    {/* Role Stats */}
                    <div className="rounded-2xl border border-white/5 bg-[#030508]/40 p-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 blur-[50px] rounded-full pointer-events-none" />
                        <h3 className="text-[13px] font-mono tracking-widest text-white mb-6 flex items-center gap-3 uppercase relative z-10">
                            <Crown className="h-4 w-4 text-amber-400" />
                            Administrative Access
                        </h3>
                        <div className="flex justify-between items-center mb-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-amber-500/20 transition-colors group relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 rounded-lg bg-black/50 border border-white/5 text-amber-500 shadow-inner group-hover:border-amber-500/30 transition-colors">
                                    <Crown className="h-4 w-4" strokeWidth={1.5} />
                                </div>
                                <span className="text-xs font-mono tracking-widest text-zinc-400 uppercase">Super Admins</span>
                            </div>
                            <span className="text-xl font-light text-white font-mono">{superadmins.length}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/20 transition-colors group relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 rounded-lg bg-black/50 border border-white/5 text-blue-500 shadow-inner group-hover:border-blue-500/30 transition-colors">
                                    <ShieldCheck className="h-4 w-4" strokeWidth={1.5} />
                                </div>
                                <span className="text-xs font-mono tracking-widest text-zinc-400 uppercase">Admins</span>
                            </div>
                            <span className="text-xl font-light text-white font-mono">{admins.length}</span>
                        </div>
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <QuickAction
                            label="Add User"
                            icon={UserPlus}
                            color="emerald"
                            onClick={() => { }}
                        />
                        <QuickAction
                            label="System Logs"
                            icon={Server}
                            color="blue"
                            onClick={() => { }}
                        />
                        <QuickAction
                            label="Manage Roles"
                            icon={ShieldCheck}
                            color="violet"
                            onClick={() => { }}
                        />
                        <QuickAction
                            label="Settings"
                            icon={Settings}
                            color="zinc"
                            onClick={() => { }}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SuperAdminOverviewTab;
