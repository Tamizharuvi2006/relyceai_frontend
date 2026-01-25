import React from 'react';
import { Users, CreditCard, IndianRupee, TrendingUp, User, Activity, Clock } from 'lucide-react';
import StatCard from './StatCard';
import { motion } from 'framer-motion';

const OverviewTab = ({ statistics, formatCurrency }) => {
    return (
        <div className="space-y-8 h-full">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h2>
                <p className="text-zinc-400 mt-1">Welcome back. Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Users}
                    title="Total Users"
                    value={statistics.totalUsers || 0}
                    change={statistics.userGrowth || 0}
                    color="emerald"
                    subtext="active accounts"
                />
                <StatCard
                    icon={CreditCard}
                    title="Active Subscriptions"
                    value={statistics.activeSubscriptions || 0}
                    change={statistics.subscriptionGrowth || 0}
                    color="blue"
                    subtext="recurring"
                />
                <StatCard
                    icon={IndianRupee}
                    title="Monthly Revenue"
                    value={formatCurrency ? formatCurrency(statistics.monthlyRevenue || 0) : `₹${statistics.monthlyRevenue || 0}`}
                    change={statistics.revenueGrowth || 0}
                    color="purple"
                    subtext="gross income"
                />
                <StatCard
                    icon={Activity}
                    title="Avg. Session"
                    value={`${statistics.avgSessionDuration || 0}m`}
                    change={statistics.sessionGrowth || 0}
                    color="yellow"
                    subtext="engagement"
                />
            </div>

            {/* Recent Activity */}
            <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-800 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Clock className="h-5 w-5 text-zinc-400" />
                        Recent Activity
                    </h3>
                    <button className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">View All</button>
                </div>

                <div className="space-y-1">
                    {(statistics.recentActivity && statistics.recentActivity.length > 0) ? (
                        statistics.recentActivity.map((activity, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group flex items-center justify-between p-4 rounded-xl hover:bg-zinc-800/50 transition-all border border-transparent hover:border-zinc-800"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <User className="h-5 w-5 text-zinc-400 group-hover:text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">{activity.user}</p>
                                        <p className="text-sm text-zinc-400">{activity.action}</p>
                                    </div>
                                </div>
                                <div className="text-xs font-medium text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded-md border border-zinc-800">
                                    {activity.time}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <Activity className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                            <p className="text-zinc-500">No recent activity found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
