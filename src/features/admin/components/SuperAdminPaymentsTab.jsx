import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, TrendingUp } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import StatCard from './StatCard';
import SuperAdminPaymentReconciliationTab from './SuperAdminPaymentReconciliationTab';

const SuperAdminPaymentsTab = ({ tabVariants, paymentAnalytics, onSyncSuccess }) => {
    return (
        <motion.div
            key="payments"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-10"
        >
            {/* Reconciliation Widget */}
            <SuperAdminPaymentReconciliationTab 
                tabVariants={{
                    hidden: { opacity: 1 }, 
                    visible: { opacity: 1 } 
                }}
                onSyncSuccess={onSyncSuccess}
            />

            {/* Analytics Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <DollarSign className="h-5 w-5" />
                            </div>
                            Revenue Intelligence
                        </h2>
                        <p className="text-zinc-500 mt-1 font-medium text-sm">Real-time payment performance and plan insights.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Revenue"
                        value={`₹${paymentAnalytics.analytics.totalRevenue?.toLocaleString() || 0}`}
                        icon={DollarSign}
                        color="emerald"
                        className="bg-white/5 border-white/5 backdrop-blur-xl"
                    />
                    <StatCard
                        title="Student Plan"
                        value={`${paymentAnalytics.analytics.planDistribution?.student?.count || 0} users`}
                        icon={Users}
                        color="teal"
                        className="bg-white/5 border-white/5 backdrop-blur-xl"
                    />
                    <StatCard
                        title="Plus Plan"
                        value={`${paymentAnalytics.analytics.planDistribution?.plus?.count || 0} users`}
                        icon={TrendingUp}
                        color="emerald"
                        className="bg-white/5 border-white/5 backdrop-blur-xl"
                    />
                    <StatCard
                        title="Pro Plan"
                        value={`${paymentAnalytics.analytics.planDistribution?.pro?.count || 0} users`}
                        icon={TrendingUp}
                        color="teal"
                        className="bg-white/5 border-white/5 backdrop-blur-xl"
                    />
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                 <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white tracking-tight">Transaction History</h3>
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Live Data Feed</span>
                    </div>
                 </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/5">
                        <thead className="bg-white/[0.03]">
                            <tr>
                                <th className="px-6 py-5 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">User ID</th>
                                <th className="px-6 py-5 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Plan</th>
                                <th className="px-6 py-5 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Amount</th>
                                <th className="px-6 py-5 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Method</th>
                                <th className="px-6 py-5 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-transparent">
                            {paymentAnalytics.payments.length > 0 ? (
                                paymentAnalytics.payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-white/[0.03] transition-colors group">
                                    <td className="px-6 py-5 whitespace-nowrap text-xs text-zinc-400 font-mono group-hover:text-emerald-400 transition-colors">
                                        {payment.userId}
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                                            (payment.plan || payment.planId) === 'plus' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            (payment.plan || payment.planId) === 'pro' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' :
                                            (payment.plan || payment.planId) === 'business' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                            'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                                        }`}>
                                            {payment.plan || payment.planId || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-sm text-white font-bold">
                                        ₹{payment.amount?.toLocaleString() || '0'}
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                        {payment.method || 'Unknown'}
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-xs text-zinc-500 font-medium">
                                        {payment.timestamp?.toDate?.()?.toLocaleString() || 'N/A'}
                                    </td>
                                </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-3 rounded-full bg-white/5 text-zinc-600">
                                                <DollarSign className="h-6 w-6" />
                                            </div>
                                            <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">No transactions discovered</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default SuperAdminPaymentsTab;
