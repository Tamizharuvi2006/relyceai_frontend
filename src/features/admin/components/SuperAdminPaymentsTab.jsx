import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, TrendingUp } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import StatCard from './StatCard';

const SuperAdminPaymentsTab = ({ tabVariants, paymentAnalytics }) => {
    const { theme } = useTheme();

    return (
        <motion.div
            key="payments"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
        >
            <div className={`rounded-lg shadow-sm border p-6 ${theme === 'dark'
                ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                : 'bg-white border-slate-200'
                }`}>
                <h2 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-zinc-900 dark:text-white' : 'text-slate-900'
                    }`}>
                    <DollarSign className="h-5 w-5 mr-2 text-emerald-500" />
                    Payment Management
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <StatCard
                        title="Total Revenue"
                        value={`₹${paymentAnalytics.analytics.totalRevenue?.toLocaleString() || 0}`}
                        icon={DollarSign}
                        color="emerald"
                        theme={theme}
                    />
                    <StatCard
                        title="Student Plan"
                        value={`${paymentAnalytics.analytics.planDistribution?.student?.count || 0} users`}
                        icon={Users}
                        color="blue"
                        theme={theme}
                    />
                    <StatCard
                        title="Plus Plan"
                        value={`${paymentAnalytics.analytics.planDistribution?.plus?.count || 0} users`}
                        icon={TrendingUp}
                        color="purple"
                        theme={theme}
                    />
                    <StatCard
                        title="Pro Plan"
                        value={`${paymentAnalytics.analytics.planDistribution?.pro?.count || 0} users`}
                        icon={TrendingUp}
                        color="blue"
                        theme={theme}
                    />
                </div>

                <div className="mt-6">
                    <h3 className={`text-md font-medium mb-4 ${theme === 'dark' ? 'text-zinc-900 dark:text-white' : 'text-slate-900'
                        }`}>
                        All Payments
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className={theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-50'}>
                                <tr>
                                    <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-500'
                                        } uppercase tracking-wider`}>User ID</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-500'
                                        } uppercase tracking-wider`}>Plan</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-500'
                                        } uppercase tracking-wider`}>Amount</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-500'
                                        } uppercase tracking-wider`}>Method</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-500'
                                        } uppercase tracking-wider`}>Date</th>
                                </tr>
                            </thead>
                            <tbody className={`${theme === 'dark' ? 'bg-white dark:bg-zinc-900 divide-zinc-700' : 'bg-white divide-gray-200'
                                } divide-y`}>
                                {paymentAnalytics.payments.map((payment) => (
                                    <tr key={payment.id}>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                            }`}>
                                            {payment.userId}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-500'
                                            }`}>
                                            {payment.plan}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-500'
                                            }`}>
                                            ₹{payment.amount?.toLocaleString()}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-500'
                                            }`}>
                                            {payment.method}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-500'
                                            }`}>
                                            {payment.timestamp?.toDate?.()?.toLocaleString() || 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SuperAdminPaymentsTab;
