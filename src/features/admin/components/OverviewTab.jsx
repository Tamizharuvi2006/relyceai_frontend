import React from 'react';
import { Users, CreditCard, IndianRupee, TrendingUp, User, Activity, Clock } from 'lucide-react';
import StatCard from './StatCard';
import { motion } from 'framer-motion';

const OverviewTab = ({ statistics, formatCurrency }) => {
    return (
        <div className="space-y-8 h-full">
            <div>
                <h2 className="text-[14px] font-mono tracking-widest uppercase text-white flex items-center gap-3">
                    <Activity className="h-5 w-5 text-emerald-400" />
                    Dashboard Overview
                </h2>
                <p className="text-zinc-500 mt-2 font-light text-sm tracking-wide">Welcome back. Here's your daily intelligence briefing.</p>
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
            <div className="bg-[#030508]/40 backdrop-blur-3xl rounded-2xl border border-white/5 p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
                <div className="flex items-center justify-between mb-8 relative z-10">
                    <h3 className="text-[13px] font-mono tracking-widest uppercase text-white flex items-center gap-3">
                        <Clock className="h-4 w-4 text-emerald-400" />
                        Recent Activity Ledger
                    </h3>
                    <button className="text-[10px] text-zinc-500 hover:text-emerald-400 font-mono tracking-widest uppercase transition-colors">View Complete Ledger</button>
                </div>

                <div className="space-y-2 relative z-10">
                    {(statistics.recentActivity && statistics.recentActivity.length > 0) ? (
                        statistics.recentActivity.map((activity, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group/item flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="h-10 w-10 rounded-full bg-emerald-500/5 flex items-center justify-center border border-emerald-500/10 group-hover/item:border-emerald-500/30 transition-colors">
                                        <User className="h-4 w-4 text-emerald-400/70 group-hover/item:text-emerald-400 transition-colors" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-medium text-white tracking-wide group-hover/item:text-emerald-400 transition-colors">{activity.user}</p>
                                        <p className="text-[11px] text-zinc-500 font-mono tracking-widest uppercase mt-0.5">{activity.action}</p>
                                    </div>
                                </div>
                                <div className="text-[9px] font-mono tracking-widest text-zinc-400 bg-white/5 px-3 py-1.5 rounded border border-white/5 uppercase">
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
