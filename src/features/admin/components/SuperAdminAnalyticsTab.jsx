import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, DollarSign, Users, TrendingUp } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import StatCard from './StatCard';

const SuperAdminAnalyticsTab = ({ tabVariants, paymentAnalytics }) => {
    const { theme } = useTheme();

    return (
        <motion.div
            key="analytics"
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
                    <BarChart className="h-5 w-5 mr-2 text-emerald-500" />
                    System Analytics
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <StatCard
                        title="Total Revenue"
                        value={`₹${paymentAnalytics.analytics.totalRevenue?.toLocaleString() || 0}`}
                        icon={DollarSign}
                        theme={theme}
                        color="emerald"
                    />
                    <StatCard
                        title="Student Plan Revenue"
                        value={`₹${paymentAnalytics.analytics.planDistribution?.student?.revenue?.toLocaleString() || 0}`}
                        icon={Users}
                        theme={theme}
                        color="blue"
                    />
                    <StatCard
                        title="Plus Plan Revenue"
                        value={`₹${paymentAnalytics.analytics.planDistribution?.plus?.revenue?.toLocaleString() || 0}`}
                        icon={TrendingUp}
                        theme={theme}
                        color="blue"
                    />
                    <StatCard
                        title="Pro Plan Revenue"
                        value={`₹${paymentAnalytics.analytics.planDistribution?.pro?.revenue?.toLocaleString() || 0}`}
                        icon={TrendingUp}
                        theme={theme}
                        color="purple"
                    />
                    <StatCard
                        title="Business Plan Revenue"
                        value={`₹${paymentAnalytics.analytics.planDistribution?.business?.revenue?.toLocaleString() || 0}`}
                        icon={BarChart}
                        theme={theme}
                        color="green"
                    />
                </div>

                <div className="mt-6">
                    <h3 className={`text-md font-medium mb-4 ${theme === 'dark' ? 'text-zinc-900 dark:text-white' : 'text-slate-900'
                        }`}>
                        Recent Payments
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className={theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-50'}>
                                <tr>
                                    <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-500'
                                        } uppercase tracking-wider`}>User</th>
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
                                {paymentAnalytics.payments.slice(0, 5).map((payment) => (
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
                                            {payment.timestamp?.toDate?.()?.toLocaleDateString() || 'N/A'}
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

export default SuperAdminAnalyticsTab;
