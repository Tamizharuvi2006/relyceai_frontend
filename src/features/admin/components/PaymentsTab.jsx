import React from 'react';
import { IndianRupee, Users, BarChart, Clock } from 'lucide-react';

const PaymentsTab = ({ paymentAnalytics, loading }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Payment History & Analytics</h2>

            {/* Analytics Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-lg bg-emerald-500/10">
                            <IndianRupee className="w-6 h-6 text-emerald-500" />
                        </div>
                    </div>
                    <h3 className="text-zinc-400 text-sm font-medium">Total Revenue</h3>
                    <p className="text-2xl font-bold text-white mt-1">
                        ₹{paymentAnalytics.analytics.totalRevenue?.toLocaleString() || 0}
                    </p>
                </div>

                <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-lg bg-blue-500/10">
                            <Users className="w-6 h-6 text-blue-500" />
                        </div>
                    </div>
                    <h3 className="text-zinc-400 text-sm font-medium">Total Transactions</h3>
                    <p className="text-2xl font-bold text-white mt-1">
                        {paymentAnalytics.payments.length || 0}
                    </p>
                </div>

                <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-lg bg-purple-500/10">
                            <BarChart className="w-6 h-6 text-purple-500" />
                        </div>
                    </div>
                    <h3 className="text-zinc-400 text-sm font-medium">Avg. Transaction</h3>
                    <p className="text-2xl font-bold text-white mt-1">
                        ₹{paymentAnalytics.payments.length > 0
                            ? Math.round(paymentAnalytics.analytics.totalRevenue / paymentAnalytics.payments.length).toLocaleString()
                            : 0}
                    </p>
                </div>

                <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-lg bg-yellow-500/10">
                            <Clock className="w-6 h-6 text-yellow-500" />
                        </div>
                    </div>
                    <h3 className="text-zinc-400 text-sm font-medium">This Month</h3>
                    <p className="text-2xl font-bold text-white mt-1">
                        ₹{Object.values(paymentAnalytics.analytics.monthlyRevenue || {})[0]?.toLocaleString() || 0}
                    </p>
                </div>
            </div>

            {/* Plan Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                    <h3 className="text-lg font-semibold mb-4 text-emerald-400">Student Plan</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-zinc-400">Transactions</span>
                            <span className="text-white font-medium">
                                {paymentAnalytics.analytics.planDistribution?.student?.count || 0}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-400">Revenue</span>
                            <span className="text-white font-medium">
                                ₹{paymentAnalytics.analytics.planDistribution?.student?.revenue?.toLocaleString() || 0}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                    <h3 className="text-lg font-semibold mb-4 text-purple-400">Plus Plan</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-zinc-400">Transactions</span>
                            <span className="text-white font-medium">
                                {paymentAnalytics.analytics.planDistribution?.plus?.count || 0}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-400">Revenue</span>
                            <span className="text-white font-medium">
                                ₹{paymentAnalytics.analytics.planDistribution?.plus?.revenue?.toLocaleString() || 0}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                    <h3 className="text-lg font-semibold mb-4 text-blue-400">Pro Plan</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-zinc-400">Transactions</span>
                            <span className="text-white font-medium">
                                {paymentAnalytics.analytics.planDistribution?.pro?.count || 0}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-400">Revenue</span>
                            <span className="text-white font-medium">
                                ₹{paymentAnalytics.analytics.planDistribution?.pro?.revenue?.toLocaleString() || 0}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                    <h3 className="text-lg font-semibold mb-4 text-indigo-400">Business Plan</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-zinc-400">Transactions</span>
                            <span className="text-white font-medium">
                                {paymentAnalytics.analytics.planDistribution?.business?.count || 0}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-400">Revenue</span>
                            <span className="text-white font-medium">
                                ₹{paymentAnalytics.analytics.planDistribution?.business?.revenue?.toLocaleString() || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment History Table */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-zinc-800">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Transaction ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Plan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Method</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-zinc-400">
                                        Loading payment history...
                                    </td>
                                </tr>
                            ) : paymentAnalytics.payments.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-zinc-400">
                                        No payment history found
                                    </td>
                                </tr>
                            ) : (
                                paymentAnalytics.payments.slice(0, 20).map((payment) => (
                                    <tr key={payment.id} className="hover:bg-zinc-800/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                                            {payment.transactionId?.substring(0, 12) || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                                            {payment.userId || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs rounded-full bg-zinc-800 text-zinc-300 capitalize">
                                                {payment.plan || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-400 font-medium">
                                            ₹{payment.amount?.toLocaleString() || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300 capitalize">
                                            {payment.method || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                                            {payment.timestamp ?
                                                (payment.timestamp.toDate ?
                                                    payment.timestamp.toDate().toLocaleDateString() :
                                                    new Date(payment.timestamp).toLocaleDateString()) :
                                                'N/A'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PaymentsTab;
