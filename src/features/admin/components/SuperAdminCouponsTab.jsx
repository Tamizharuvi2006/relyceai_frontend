import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Plus, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const SuperAdminCouponsTab = ({
    tabVariants,
    coupons,
    newCoupon,
    setNewCoupon,
    addCoupon,
    handleToggleCouponStatus,
    handleDeleteCoupon
}) => {
    const { theme } = useTheme();

    return (
        <>
            <motion.div
                key="coupons"
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
                    <div className="flex justify-between items-center mb-6">
                        <h2 className={`text-lg font-semibold flex items-center ${theme === 'dark' ? 'text-zinc-900 dark:text-white' : 'text-slate-900'
                            }`}>
                            <CreditCard className="h-5 w-5 mr-2 text-emerald-500" />
                            Coupon Management
                        </h2>
                        <button
                            onClick={() => {
                                const modal = document.getElementById('coupon-modal');
                                if (modal) modal.classList.remove('hidden');
                            }}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center space-x-2"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Add Coupon</span>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className={theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-50'}>
                                <tr>
                                    <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-500'
                                        } uppercase tracking-wider`}>Code</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-500'
                                        } uppercase tracking-wider`}>Discount</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-500'
                                        } uppercase tracking-wider`}>Type</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-500'
                                        } uppercase tracking-wider`}>Description</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-500'
                                        } uppercase tracking-wider`}>Status</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-500'
                                        } uppercase tracking-wider`}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className={`${theme === 'dark' ? 'bg-white dark:bg-zinc-900 divide-zinc-700' : 'bg-white divide-gray-200'
                                } divide-y`}>
                                {coupons.map((coupon) => (
                                    <tr key={coupon.id}>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                            }`}>
                                            {coupon.code}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-500'
                                            }`}>
                                            {coupon.monthlyDiscount > 0 && `Monthly: ${coupon.monthlyDiscount}%`}
                                            {coupon.yearlyDiscount > 0 && ` Yearly: ${coupon.yearlyDiscount}%`}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-500'
                                            }`}>
                                            {coupon.type}
                                        </td>
                                        <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-500'
                                            }`}>
                                            {coupon.description}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm`}>
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${coupon.active
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                }`}>
                                                {coupon.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-500'
                                            }`}>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleToggleCouponStatus(coupon.id, coupon.active)}
                                                    className={`p-1 rounded ${coupon.active
                                                        ? 'text-red-600 hover:text-red-900 dark:hover:text-red-300'
                                                        : 'text-green-600 hover:text-green-900 dark:hover:text-green-300'
                                                        }`}
                                                    title={coupon.active ? 'Deactivate' : 'Activate'}
                                                >
                                                    {coupon.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCoupon(coupon.id)}
                                                    className="p-1 text-red-600 hover:text-red-900 dark:hover:text-red-300"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>

            {/* Coupon Modal */}
            <div id="coupon-modal" className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className={`rounded-lg shadow-xl w-full max-w-md ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'
                    }`}>
                    <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'
                        }`}>
                        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                            Add New Coupon
                        </h3>
                    </div>
                    <div className="px-6 py-4 space-y-4">
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                                }`}>
                                Coupon Code *
                            </label>
                            <input
                                type="text"
                                value={newCoupon.code}
                                onChange={(e) => setNewCoupon(prev => ({ ...prev, code: e.target.value }))}
                                className={`w-full px-3 py-2 border rounded-md ${theme === 'dark'
                                    ? 'border-zinc-600 bg-zinc-700 text-white'
                                    : 'border-gray-300 bg-white text-gray-900'
                                    }`}
                                placeholder="e.g. SAVE20"
                            />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                                }`}>
                                Monthly Discount (%)
                            </label>
                            <input
                                type="number"
                                value={newCoupon.monthlyDiscount}
                                onChange={(e) => setNewCoupon(prev => ({ ...prev, monthlyDiscount: e.target.value }))}
                                className={`w-full px-3 py-2 border rounded-md ${theme === 'dark'
                                    ? 'border-zinc-600 bg-zinc-700 text-white'
                                    : 'border-gray-300 bg-white text-gray-900'
                                    }`}
                                placeholder="e.g. 20"
                            />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                                }`}>
                                Yearly Discount (%)
                            </label>
                            <input
                                type="number"
                                value={newCoupon.yearlyDiscount}
                                onChange={(e) => setNewCoupon(prev => ({ ...prev, yearlyDiscount: e.target.value }))}
                                className={`w-full px-3 py-2 border rounded-md ${theme === 'dark'
                                    ? 'border-zinc-600 bg-zinc-700 text-white'
                                    : 'border-gray-300 bg-white text-gray-900'
                                    }`}
                                placeholder="e.g. 25"
                            />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                                }`}>
                                Description *
                            </label>
                            <textarea
                                value={newCoupon.description}
                                onChange={(e) => setNewCoupon(prev => ({ ...prev, description: e.target.value }))}
                                className={`w-full px-3 py-2 border rounded-md ${theme === 'dark'
                                    ? 'border-zinc-600 bg-zinc-700 text-white'
                                    : 'border-gray-300 bg-white text-gray-900'
                                    }`}
                                placeholder="Coupon description"
                                rows="2"
                            />
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="active"
                                checked={newCoupon.active}
                                onChange={(e) => setNewCoupon(prev => ({ ...prev, active: e.target.checked }))}
                                className="h-4 w-4 text-emerald-600 rounded"
                            />
                            <label htmlFor="active" className={`ml-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                                }`}>
                                Active
                            </label>
                        </div>
                    </div>
                    <div className={`px-6 py-4 border-t ${theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'
                        } flex justify-end space-x-3`}>
                        <button
                            onClick={() => {
                                const modal = document.getElementById('coupon-modal');
                                if (modal) modal.classList.add('hidden');
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={addCoupon}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                        >
                            Add Coupon
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SuperAdminCouponsTab;
