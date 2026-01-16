import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Edit, Save, X } from 'lucide-react';
import { MEMBERSHIP_PLANS } from '../services/adminDashboard';

const SuperAdminPricingTab = ({
    tabVariants,
    editingPrices,
    setEditingPrices,
    tempPrices,
    setTempPrices,
    savePricingChanges
}) => {
    // Enforce dark theme
    const theme = 'dark';

    return (
        <motion.div
            key="pricing"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
        >
            <div className="rounded-lg shadow-sm border p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                <h2 className="text-lg font-semibold mb-4 flex items-center text-zinc-900 dark:text-white">
                    <CreditCard className="h-5 w-5 mr-2 text-emerald-500" />
                    Pricing Settings
                </h2>

                <div className="space-y-6">
                    {editingPrices ? (
                        <div className="space-y-4">
                            {Object.entries(tempPrices).map(([planId, plan]) => (
                                <div key={planId} className="p-4 rounded-lg border border-zinc-700">
                                    <h3 className="font-medium mb-3 text-white">
                                        {plan.name} Plan
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-zinc-300">
                                                Monthly Price (₹)
                                            </label>
                                            <input
                                                type="number"
                                                value={tempPrices[planId]?.monthly || ''}
                                                onChange={(e) => setTempPrices(prev => ({
                                                    ...prev,
                                                    [planId]: {
                                                        ...prev[planId],
                                                        monthly: parseFloat(e.target.value) || 0
                                                    }
                                                }))}
                                                className="w-full px-3 py-2 border rounded-md border-zinc-600 bg-zinc-700 text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-zinc-300">
                                                Yearly Price (₹)
                                            </label>
                                            <input
                                                type="number"
                                                value={tempPrices[planId]?.yearly || ''}
                                                onChange={(e) => setTempPrices(prev => ({
                                                    ...prev,
                                                    [planId]: {
                                                        ...prev[planId],
                                                        yearly: parseFloat(e.target.value) || 0
                                                    }
                                                }))}
                                                className="w-full px-3 py-2 border rounded-md border-zinc-600 bg-zinc-700 text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="flex space-x-3">
                                <button
                                    onClick={savePricingChanges}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center space-x-2"
                                >
                                    <Save className="h-4 w-4" />
                                    <span>Save Changes</span>
                                </button>
                                <button
                                    onClick={() => setEditingPrices(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600 flex items-center space-x-2"
                                >
                                    <X className="h-4 w-4" />
                                    <span>Cancel</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {Object.entries(MEMBERSHIP_PLANS).map(([planId, plan]) => (
                                <div key={planId} className="p-4 rounded-lg border border-zinc-700">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-medium text-white">
                                            {plan.name} Plan
                                        </h3>
                                        <span className="text-lg font-semibold text-emerald-400">
                                            ₹{plan.monthly}/month
                                        </span>
                                    </div>
                                    <div className="mt-2 text-sm text-zinc-400">
                                        Yearly: ₹{plan.yearly} ({plan.yearlyDiscountPercentage}% discount)
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={() => setEditingPrices(true)}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center space-x-2 mt-4"
                            >
                                <Edit className="h-4 w-4" />
                                <span>Edit Pricing</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default SuperAdminPricingTab;
