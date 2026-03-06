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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-[14px] font-mono tracking-widest uppercase text-white flex items-center gap-3">
                            <DollarSign className="h-5 w-5 text-emerald-400" />
                            Revenue Intelligence
                        </h2>
                        <p className="text-zinc-500 mt-2 font-light text-sm tracking-wide">Real-time payment performance and plan insights.</p>
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
            <div className="bg-[#030508]/40 backdrop-blur-3xl rounded-2xl shadow-2xl border border-white/5 relative overflow-hidden flex flex-col max-h-[600px]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
                 <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center relative z-10 flex-shrink-0">
                    <h3 className="text-[13px] font-mono tracking-widest uppercase text-white">Transaction Ledger</h3>
                    <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/20 rounded-full px-3 py-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-[0.2em]">Live Data</span>
                    </div>
                 </div>
                
                <div className="overflow-y-auto theme-scrollbar relative z-10">
                    <table className="min-w-full divide-y divide-white/5 relative">
                        <thead className="bg-[#030508]/90 backdrop-blur-md sticky top-0 z-20">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-widest whitespace-nowrap">User ID</th>
                                <th className="px-8 py-5 text-left text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-widest whitespace-nowrap">Plan</th>
                                <th className="px-8 py-5 text-left text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-widest whitespace-nowrap">Amount</th>
                                <th className="px-8 py-5 text-left text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-widest whitespace-nowrap">Method</th>
                                <th className="px-8 py-5 text-left text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-widest whitespace-nowrap">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-transparent">
                            {paymentAnalytics.payments.length > 0 ? (
                                paymentAnalytics.payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-8 py-5 text-[11px] text-zinc-400 font-mono tracking-widest uppercase group-hover:text-emerald-400 transition-colors">
                                        {payment.userId}
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-widest border ${
                                            (payment.plan || payment.planId) === 'plus' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                            (payment.plan || payment.planId) === 'pro' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' :
                                            (payment.plan || payment.planId) === 'business' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                            'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                                        }`}>
                                            {payment.plan || payment.planId || 'UNKNOWN'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-[13px] font-mono text-white tracking-widest">
                                        ₹{payment.amount?.toLocaleString() || '0'}
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                                        {payment.method || 'UNKNOWN'}
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
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
