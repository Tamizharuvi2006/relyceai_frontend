import React from 'react';
import { Plus, X, Shield, Lock, Bell, Server, Tag, ToggleLeft, ToggleRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SettingsTab = ({
    coupons,
    addCoupon,
    handleToggleCouponStatus,
    handleDeleteCoupon,
    newCoupon,
    setNewCoupon,
}) => {

    const Toggle = ({ active, onClick }) => (
        <button
            onClick={onClick}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${active ? 'bg-emerald-500' : 'bg-zinc-700'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${active ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">System Settings</h2>
                <p className="text-zinc-400 mt-1">Configure platform-wide settings and sales tools.</p>
            </div>

            {/* Coupon Management Section */}
            <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-800 p-6 shadow-xl shadow-black/10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Tag className="h-5 w-5 text-emerald-500" />
                            Coupon Management
                        </h3>
                        <p className="text-sm text-zinc-400 mt-1">Manage discount codes and promotional offers.</p>
                    </div>

                    <button
                        onClick={() => document.getElementById('coupon-modal').classList.remove('hidden')}
                        className="flex items-center px-4 py-2 bg-emerald-500 text-black font-medium rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Coupon
                    </button>
                </div>

                {/* Coupon List */}
                <div className="overflow-hidden rounded-xl border border-zinc-800">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-zinc-800/50">
                            <thead className="bg-zinc-900/80">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Code</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Discount</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Duration</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {coupons.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-zinc-500">
                                            No coupons active. Create one to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    coupons.map((coupon) => (
                                        <tr key={coupon.id} className="hover:bg-zinc-800/30 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-mono text-sm font-medium text-white bg-zinc-800/80 px-2 py-1 rounded inline-block border border-zinc-700">
                                                    {coupon.code}
                                                </div>
                                                <div className="text-xs text-zinc-500 mt-1">{coupon.description}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                                                {coupon.type === 'percentage' ? (
                                                    <span className="text-emerald-400 font-medium">{coupon.monthlyDiscount}%</span>
                                                ) : (
                                                    <span className="text-emerald-400 font-medium">₹{coupon.monthlyDiscount}</span>
                                                )}
                                                <span className="text-zinc-600 mx-1">/</span>
                                                {coupon.type === 'percentage' ? (
                                                    <span className="text-emerald-400 font-medium">{coupon.yearlyDiscount}% (Yearly)</span>
                                                ) : (
                                                    <span className="text-emerald-400 font-medium">₹{coupon.yearlyDiscount} (Yearly)</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400 capitalize">
                                                {coupon.duration || 'monthly'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${coupon.active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                    {coupon.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <div className="flex justify-end space-x-3">
                                                    <button
                                                        onClick={() => handleToggleCouponStatus(coupon.id, coupon.active)}
                                                        className={`text-xs font-medium ${coupon.active ? 'text-zinc-400 hover:text-amber-400' : 'text-emerald-500 hover:text-emerald-400'}`}
                                                    >
                                                        {coupon.active ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCoupon(coupon.id)}
                                                        className="text-xs font-medium text-red-500/70 hover:text-red-500 hover:underline"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Coupon Modal */}
            <div id="coupon-modal" className="hidden fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                        <h3 className="text-lg font-bold text-white">Create Promotional Code</h3>
                        <button
                            onClick={() => document.getElementById('coupon-modal').classList.add('hidden')}
                            className="text-zinc-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
                        <div>
                            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Coupon Code</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                <input
                                    type="text"
                                    value={newCoupon.code}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                    className="w-full bg-black/50 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono"
                                    placeholder="e.g., BLACKFRIDAY20"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Type</label>
                                <select
                                    value={newCoupon.type}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                >
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount (₹)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Duration</label>
                                <select
                                    value={newCoupon.duration}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, duration: e.target.value })}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                >
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                    <option value="lifetime">Lifetime</option>
                                    <option value="once">One-time</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                                    Monthly Discount
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-zinc-500 text-sm">{newCoupon.type === 'percentage' ? '%' : '₹'}</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={newCoupon.monthlyDiscount}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, monthlyDiscount: e.target.value })}
                                        className="w-full bg-black/50 border border-zinc-700 rounded-xl pl-8 pr-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                                    Yearly Discount
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-zinc-500 text-sm">{newCoupon.type === 'percentage' ? '%' : '₹'}</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={newCoupon.yearlyDiscount}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, yearlyDiscount: e.target.value })}
                                        className="w-full bg-black/50 border border-zinc-700 rounded-xl pl-8 pr-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Description</label>
                            <input
                                type="text"
                                value={newCoupon.description}
                                onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                                className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                                placeholder="Internal note describing this offer..."
                            />
                        </div>

                        <div className="flex items-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                            <input
                                type="checkbox"
                                id="active"
                                checked={newCoupon.active}
                                onChange={(e) => setNewCoupon({ ...newCoupon, active: e.target.checked })}
                                className="h-4 w-4 text-emerald-500 rounded border-zinc-600 bg-zinc-700 focus:ring-emerald-500 focus:ring-offset-zinc-900"
                            />
                            <label htmlFor="active" className="ml-3 text-sm font-medium text-emerald-400">
                                Activate immediately upon creation
                            </label>
                        </div>
                    </div>

                    <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex justify-end space-x-3">
                        <button
                            onClick={() => document.getElementById('coupon-modal').classList.add('hidden')}
                            className="px-5 py-2.5 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-colors font-medium text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={addCoupon}
                            className="px-5 py-2.5 bg-emerald-500 text-black rounded-xl hover:bg-emerald-400 transition-colors font-medium text-sm shadow-lg shadow-emerald-500/20"
                        >
                            Create Coupon
                        </button>
                    </div>
                </div>
            </div>

            {/* General Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Server className="h-5 w-5 text-zinc-400" />
                        System Preferences
                    </h3>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-zinc-200">Maintenance Mode</p>
                                <p className="text-sm text-zinc-500">Temporarily disable access for users</p>
                            </div>
                            <Toggle active={false} onClick={() => { }} />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-zinc-200">System Notifications</p>
                                <p className="text-sm text-zinc-500">Send email alerts for system events</p>
                            </div>
                            <Toggle active={true} onClick={() => { }} />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-zinc-200">Automatic Backups</p>
                                <p className="text-sm text-zinc-500">Daily database snapshots</p>
                            </div>
                            <Toggle active={true} onClick={() => { }} />
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-zinc-400" />
                        Security & Access
                    </h3>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-zinc-200">Admin 2FA</p>
                                <p className="text-sm text-zinc-500">Require Two-Factor Auth for admins</p>
                            </div>
                            <Toggle active={false} onClick={() => { }} />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-zinc-200">Session Timeout</p>
                                <p className="text-sm text-zinc-500">Auto-logout duration</p>
                            </div>
                            <select className="bg-black/50 border border-zinc-700 text-zinc-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                                <option>15 minutes</option>
                                <option>30 minutes</option>
                                <option selected>1 hour</option>
                                <option>2 hours</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-zinc-200">API Access</p>
                                <p className="text-sm text-zinc-500">Enable public API endpoints</p>
                            </div>
                            <Toggle active={true} onClick={() => { }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsTab;
