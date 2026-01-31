import React from 'react';
import { motion } from 'framer-motion';
import {
    Users, DollarSign, TrendingUp, Activity,
    ShieldCheck, Crown, Server, CreditCard,
    ArrowUpRight, UserPlus, Settings
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const StatCard = ({ title, value, subtext, icon: Icon, color, trend }) => (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl p-6 group hover:border-zinc-700 transition-all duration-300">
        <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-${color}-500/10 blur-2xl group-hover:bg-${color}-500/20 transition-all`} />
        <div className="relative flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-zinc-400">{title}</p>
                <h3 className="mt-2 text-3xl font-bold text-white tracking-tight">{value}</h3>
                {subtext && (
                    <div className="mt-2 flex items-center text-xs">
                        {trend === 'up' && <ArrowUpRight className="h-3 w-3 mr-1 text-emerald-500" />}
                        <span className={trend === 'up' ? "text-emerald-500" : "text-zinc-500"}>
                            {subtext}
                        </span>
                    </div>
                )}
            </div>
            <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-500 shadow-inner ring-1 ring-inset ring-${color}-500/20`}>
                <Icon className="h-6 w-6" />
            </div>
        </div>
    </div>
);

const PlanBar = ({ label, count, total, color }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-zinc-400">{label}</span>
                <span className="font-medium text-zinc-200">{count} ({percentage.toFixed(1)}%)</span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-800">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full bg-${color}-500`}
                />
            </div>
        </div>
    );
};

const QuickAction = ({ label, icon: Icon, onClick, color }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center justify-center p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all group"
    >
        <div className={`p-3 rounded-full bg-${color}-500/10 text-${color}-500 mb-3 group-hover:scale-110 transition-transform`}>
            <Icon className="h-6 w-6" />
        </div>
        <span className="text-sm font-medium text-zinc-300 group-hover:text-white">{label}</span>
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
                <h2 className="text-2xl font-bold text-white tracking-tight">Executive Dashboard</h2>
                <p className="text-zinc-400 mt-1">Real-time system overview and performance metrics.</p>
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
                <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-black/40 backdrop-blur-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-indigo-500" />
                            Subscription Distribution
                        </h3>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-zinc-800 text-zinc-400">
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
                    <div className="rounded-2xl border border-zinc-800 bg-black/40 backdrop-blur-sm p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Crown className="h-5 w-5 text-amber-500" />
                            Administrative Access
                        </h3>
                        <div className="flex justify-between items-center mb-4 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                                    <Crown className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-medium text-zinc-300">Super Admins</span>
                            </div>
                            <span className="text-lg font-bold text-white">{superadmins.length}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                    <ShieldCheck className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-medium text-zinc-300">Admins</span>
                            </div>
                            <span className="text-lg font-bold text-white">{admins.length}</span>
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
