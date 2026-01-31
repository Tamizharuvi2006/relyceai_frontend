import React from 'react';
import { Edit, X, Save } from 'lucide-react';

const PricingTab = ({
    editingPrices,
    setEditingPrices,
    tempPrices,
    setTempPrices,
    handleSavePrices,
    formatCurrency
}) => {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Pricing Management</h2>
                <button
                    onClick={() => setEditingPrices(!editingPrices)}
                    className="flex items-center px-4 py-2 bg-emerald-500 text-black rounded-md hover:bg-emerald-600 transition-colors"
                >
                    {editingPrices ? (
                        <>
                            <X className="mr-2" size={16} />
                            Cancel
                        </>
                    ) : (
                        <>
                            <Edit className="mr-2" size={16} />
                            Edit Prices
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.keys(tempPrices).map((planId) => (
                    <div key={planId} className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                        <h3 className="text-lg font-semibold mb-4 capitalize">{planId}</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Monthly</span>
                                <span className="text-white font-medium">
                                    {editingPrices ? (
                                        <input
                                            type="number"
                                            value={tempPrices[planId].monthly}
                                            onChange={(e) =>
                                                setTempPrices({
                                                    ...tempPrices,
                                                    [planId]: {
                                                        ...tempPrices[planId],
                                                        monthly: parseFloat(e.target.value),
                                                    },
                                                })
                                            }
                                            className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    ) : (
                                        formatCurrency(tempPrices[planId].monthly)
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Yearly</span>
                                <span className="text-white font-medium">
                                    {editingPrices ? (
                                        <input
                                            type="number"
                                            value={Math.round(tempPrices[planId].monthly * 12 * (1 - (tempPrices[planId].yearlyDiscountPercentage || 0) / 100))}
                                            disabled
                                            className="bg-zinc-800/50 border border-zinc-700 text-zinc-400 text-sm rounded-md px-2 py-1 cursor-not-allowed"
                                        />
                                    ) : (
                                        formatCurrency(tempPrices[planId].yearly)
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Yearly Discount</span>
                                <span className="text-white font-medium">
                                    {editingPrices ? (
                                        <input
                                            type="number"
                                            value={tempPrices[planId].yearlyDiscountPercentage}
                                            onChange={(e) =>
                                                setTempPrices({
                                                    ...tempPrices,
                                                    [planId]: {
                                                        ...tempPrices[planId],
                                                        yearlyDiscountPercentage: parseFloat(e.target.value),
                                                    },
                                                })
                                            }
                                            className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    ) : (
                                        `${tempPrices[planId].yearlyDiscountPercentage}%`
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {editingPrices && (
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSavePrices}
                        className="flex items-center px-4 py-2 bg-emerald-500 text-black rounded-md hover:bg-emerald-600 transition-colors"
                    >
                        <Save className="mr-2" size={16} />
                        Save Changes
                    </button>
                </div>
            )}
        </div>
    );
};

export default PricingTab;
