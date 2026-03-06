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
            <div className="bg-[#030508]/40 backdrop-blur-3xl rounded-2xl shadow-2xl border border-white/5 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
                <h2 className="text-[13px] font-mono tracking-widest uppercase flex items-center text-white mb-8 relative z-10">
                    <CreditCard className="h-4 w-4 mr-3 text-emerald-400" />
                    Pricing Configuration
                </h2>

                <div className="space-y-6 relative z-10">
                    {editingPrices ? (
                        <div className="space-y-4">
                            {Object.entries(tempPrices).map(([planId, plan]) => (
                                <div key={planId} className="p-8 rounded-2xl border border-white/5 bg-white/5 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <h3 className="text-[13px] font-mono tracking-widest uppercase text-white mb-6">
                                        {plan.name} Tier
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                        <div>
                                            <label className="block text-[10px] font-mono uppercase tracking-widest text-emerald-400/80 mb-3">
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
                                                className="w-full px-4 py-3 border rounded-xl border-white/10 bg-black text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all font-mono text-[13px] tracking-wide"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-mono uppercase tracking-widest text-emerald-400/80 mb-3">
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
                                                className="w-full px-4 py-3 border rounded-xl border-white/10 bg-black text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all font-mono text-[13px] tracking-wide"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="flex space-x-4 pt-4">
                                <button
                                    onClick={savePricingChanges}
                                    className="px-6 py-3 bg-emerald-500 text-black rounded-xl hover:bg-emerald-400 flex items-center space-x-3 font-medium text-[13px] tracking-wide shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                                >
                                    <Save className="h-4 w-4" strokeWidth={2} />
                                    <span>Save Configuration</span>
                                </button>
                                <button
                                    onClick={() => setEditingPrices(false)}
                                    className="px-6 py-3 bg-transparent border border-white/10 text-zinc-400 hover:text-white rounded-xl hover:bg-white/5 flex items-center space-x-3 font-medium text-[13px] tracking-wide transition-all"
                                >
                                    <X className="h-4 w-4" strokeWidth={2} />
                                    <span>Cancel</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {Object.entries(MEMBERSHIP_PLANS).map(([planId, plan]) => (
                                <div key={planId} className="p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors group relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex justify-between items-center relative z-10">
                                        <h3 className="text-[13px] font-mono tracking-widest uppercase text-white">
                                            {plan.name} Tier
                                        </h3>
                                        <div className="flex flex-col items-end">
                                            <span className="text-xl font-mono tracking-wide text-emerald-400">
                                                ₹{plan.monthly}/mo
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-3 text-[10px] font-mono text-zinc-500 uppercase tracking-widest relative z-10">
                                        Yearly: ₹{plan.yearly} <span className="text-emerald-500 ml-2">[{plan.yearlyDiscountPercentage}% discount]</span>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={() => setEditingPrices(true)}
                                className="px-6 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 flex items-center justify-center space-x-3 w-full mt-8 font-medium text-[13px] tracking-wide transition-all"
                            >
                                <Edit className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
                                <span>Modify Configuration</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default SuperAdminPricingTab;
