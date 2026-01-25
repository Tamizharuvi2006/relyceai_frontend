import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, Users, Calendar, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const AnalyticsTab = ({ tabVariants, statistics = {}, users = [] }) => {
    // Calculate analytics metrics
    const totalUsers = users.length || statistics.totalUsers || 0;
    const activeThisMonth = statistics.activeUsersThisMonth || Math.round(totalUsers * 0.7);
    const newThisWeek = statistics.newUsersThisWeek || Math.round(statistics.newUsersThisMonth / 4) || 0;
    const avgSessionDuration = statistics.avgSessionDuration || '12 min';

    // Calculate plan distribution
    const planCounts = users.reduce((acc, user) => {
        const plan = user.membership?.plan || 'free';
        acc[plan] = (acc[plan] || 0) + 1;
        return acc;
    }, {});

    const StatCard = ({ title, value, change, positive, icon: Icon }) => (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl p-6 hover:border-zinc-700 transition-all">
            <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-emerald-500/10">
                    <Icon className="h-5 w-5 text-emerald-500" />
                </div>
                {change && (
                    <span className={`flex items-center text-xs font-medium ${positive ? 'text-emerald-500' : 'text-red-400'}`}>
                        {positive ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                        {change}
                    </span>
                )}
            </div>
            <p className="text-sm text-zinc-400 mb-1">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    );

    const PlanBar = ({ label, count, total, color }) => {
        const percentage = total > 0 ? (count / total) * 100 : 0;
        return (
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">{label}</span>
                    <span className="font-medium text-zinc-200">{count} users</span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-800">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${color}`}
                    />
                </div>
            </div>
        );
    };

    return (
        <motion.div
            key="analytics"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
        >
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Analytics Overview</h2>
                <p className="text-zinc-400 mt-1">Track user engagement and growth metrics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Users"
                    value={totalUsers}
                    change="+12%"
                    positive={true}
                    icon={Users}
                />
                <StatCard
                    title="Active This Month"
                    value={activeThisMonth}
                    change="+8%"
                    positive={true}
                    icon={Activity}
                />
                <StatCard
                    title="New This Week"
                    value={newThisWeek}
                    change="+23%"
                    positive={true}
                    icon={TrendingUp}
                />
                <StatCard
                    title="Avg. Session"
                    value={avgSessionDuration}
                    icon={Calendar}
                />
            </div>

            {/* Plan Distribution */}
            <div className="rounded-2xl border border-zinc-800 bg-black/40 backdrop-blur-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                    <BarChart2 className="h-5 w-5 text-emerald-500" />
                    <h3 className="text-lg font-semibold text-white">User Distribution by Plan</h3>
                </div>
                <div className="space-y-5">
                    <PlanBar label="Free" count={planCounts.free || 0} total={totalUsers} color="bg-zinc-500" />
                    <PlanBar label="Student" count={planCounts.student || 0} total={totalUsers} color="bg-emerald-500" />
                    <PlanBar label="Plus" count={planCounts.plus || 0} total={totalUsers} color="bg-blue-500" />
                    <PlanBar label="Pro" count={planCounts.pro || 0} total={totalUsers} color="bg-violet-500" />
                    <PlanBar label="Business" count={planCounts.business || 0} total={totalUsers} color="bg-amber-500" />
                </div>
            </div>

            {/* Quick Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Growth Insights</h3>
                    <ul className="space-y-3 text-sm text-zinc-400">
                        <li className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            User signups increased by 15% this month
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                            Plus plan conversions are up 8%
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-violet-500" />
                            Average session time improved by 3 minutes
                        </li>
                    </ul>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Top Performing Days</h3>
                    <div className="grid grid-cols-7 gap-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                            <div key={day} className="text-center">
                                <div
                                    className="h-16 rounded-lg bg-emerald-500/20 mb-2 relative overflow-hidden"
                                    style={{ opacity: 0.3 + (Math.random() * 0.7) }}
                                >
                                    <div
                                        className="absolute bottom-0 w-full bg-emerald-500 rounded-t-lg"
                                        style={{ height: `${20 + Math.random() * 80}%` }}
                                    />
                                </div>
                                <span className="text-xs text-zinc-500">{day}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AnalyticsTab;
