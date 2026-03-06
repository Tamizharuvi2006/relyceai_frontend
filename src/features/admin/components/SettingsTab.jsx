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
                <h2 className="text-[14px] font-mono tracking-widest uppercase text-white flex items-center gap-3">
                    <Server className="h-5 w-5 text-emerald-400" />
                    System Settings
                </h2>
                <p className="text-zinc-500 mt-2 font-light text-sm tracking-wide">Configure platform-wide settings and sales tools.</p>
            </div>

            {/* Coupon Management Section */}
            <div className="bg-[#030508]/40 backdrop-blur-3xl rounded-2xl border border-white/5 p-8 shadow-2xl relative overflow-hidden group flex flex-col max-h-[600px]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
                <div className="flex items-center justify-between mb-8 relative z-10 flex-shrink-0">
                    <div>
                        <h3 className="text-[13px] font-mono tracking-widest uppercase text-white flex items-center gap-3">
                            <Tag className="h-4 w-4 text-emerald-400" />
                            Coupon Management
                        </h3>
                        <p className="text-zinc-500 font-light text-sm mt-2 tracking-wide">Manage discount codes and promotional offers.</p>
                    </div>

                    <button
                        onClick={() => document.getElementById('coupon-modal').classList.remove('hidden')}
                        className="flex items-center px-6 py-3 bg-emerald-500 text-black text-[13px] font-medium tracking-wide rounded-xl hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95"
                    >
                        <Plus className="mr-2 h-4 w-4" strokeWidth={2} />
                        Create Coupon
                    </button>
                </div>

                {/* Coupon List */}
                <div className="overflow-hidden rounded-xl border border-white/5 relative z-10 flex flex-col max-h-[400px]">
                    <div className="overflow-y-auto theme-scrollbar">
                        <table className="min-w-full divide-y divide-white/5 relative">
                            <thead className="bg-[#030508]/90 backdrop-blur-md sticky top-0 z-20">
                                <tr>
                                    <th className="px-6 py-5 text-left text-[10px] font-mono text-zinc-500 uppercase tracking-widest whitespace-nowrap">Code</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-mono text-zinc-500 uppercase tracking-widest whitespace-nowrap">Discount</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-mono text-zinc-500 uppercase tracking-widest whitespace-nowrap">Duration</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-mono text-zinc-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                                    <th className="px-6 py-5 text-right text-[10px] font-mono text-zinc-500 uppercase tracking-widest whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 bg-transparent">
                                {coupons.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-zinc-500">
                                            No coupons active. Create one to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    coupons.map((coupon) => (
                                        <tr key={coupon.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-mono text-sm font-medium text-white bg-white/10 px-2 py-1 rounded inline-block border border-white/10">
                                                    {coupon.code}
                                                </div>
                                                <div className="text-[11px] text-zinc-500 mt-1.5 font-mono uppercase tracking-widest">{coupon.description}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-[13px] text-zinc-300">
                                                {coupon.type === 'percentage' ? (
                                                    <span className="text-emerald-400 font-mono tracking-wider">{coupon.monthlyDiscount}%</span>
                                                ) : (
                                                    <span className="text-emerald-400 font-mono tracking-wider">₹{coupon.monthlyDiscount}</span>
                                                )}
                                                <span className="text-zinc-600 mx-2">/</span>
                                                {coupon.type === 'percentage' ? (
                                                    <span className="text-emerald-400 font-mono tracking-wider">{coupon.yearlyDiscount}% <span className="text-zinc-500 text-[10px]">(YR)</span></span>
                                                ) : (
                                                    <span className="text-emerald-400 font-mono tracking-wider">₹{coupon.yearlyDiscount} <span className="text-zinc-500 text-[10px]">(YR)</span></span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-[11px] font-mono tracking-widest uppercase text-zinc-400 capitalize">
                                                {coupon.duration || 'monthly'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-widest uppercase border ${coupon.active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                    {coupon.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <div className="flex justify-end space-x-4">
                                                    <button
                                                        onClick={() => handleToggleCouponStatus(coupon.id, coupon.active)}
                                                        className={`text-[10px] font-mono tracking-widest uppercase ${coupon.active ? 'text-zinc-500 hover:text-amber-400' : 'text-emerald-500 hover:text-emerald-400'}`}
                                                    >
                                                        {coupon.active ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCoupon(coupon.id)}
                                                        className="text-[10px] font-mono tracking-widest uppercase text-red-500/70 hover:text-red-500 hover:underline"
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
                <div className="bg-[#030508] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                        <h3 className="text-lg font-light text-white">Create Promotional Code</h3>
                        <button
                            onClick={() => document.getElementById('coupon-modal').classList.add('hidden')}
                            className="text-zinc-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar bg-[#030508] relative">
                        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                        <div>
                            <label className="block text-[10px] font-mono text-emerald-400/80 uppercase tracking-widest mb-2">Coupon Code</label>
                            <div className="relative group/input">
                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500/50 group-focus-within/input:text-emerald-400 transition-colors" />
                                <input
                                    type="text"
                                    value={newCoupon.code}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                    className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-mono tracking-widest text-[13px] placeholder-zinc-700"
                                    placeholder="E.G., BLACKFRIDAY20"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">Type</label>
                                <select
                                    value={newCoupon.type}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 text-[11px] uppercase tracking-widest font-mono text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 appearance-none cursor-pointer hover:bg-white/5"
                                >
                                    <option className="bg-[#030508]" value="percentage">PERCENTAGE (%)</option>
                                    <option className="bg-[#030508]" value="fixed">FIXED AMOUNT (₹)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">Duration</label>
                                <select
                                    value={newCoupon.duration}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, duration: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 text-[11px] uppercase tracking-widest font-mono text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 appearance-none cursor-pointer hover:bg-white/5"
                                >
                                    <option className="bg-[#030508]" value="monthly">MONTHLY</option>
                                    <option className="bg-[#030508]" value="yearly">YEARLY</option>
                                    <option className="bg-[#030508]" value="lifetime">LIFETIME</option>
                                    <option className="bg-[#030508]" value="once">ONE-TIME</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">
                                    Monthly Discount
                                </label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <span className="text-emerald-500/50 text-[13px] font-mono">{newCoupon.type === 'percentage' ? '%' : '₹'}</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={newCoupon.monthlyDiscount}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, monthlyDiscount: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-4 text-white focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-mono text-[13px] placeholder-zinc-700"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">
                                    Yearly Discount
                                </label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <span className="text-emerald-500/50 text-[13px] font-mono">{newCoupon.type === 'percentage' ? '%' : '₹'}</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={newCoupon.yearlyDiscount}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, yearlyDiscount: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-4 text-white focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-mono text-[13px] placeholder-zinc-700"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">Description / Note</label>
                            <input
                                type="text"
                                value={newCoupon.description}
                                onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-4 text-white text-[13px] focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all placeholder-zinc-700"
                                placeholder="Internal note describing this offer..."
                            />
                        </div>

                        <div className="flex items-center p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                            <input
                                type="checkbox"
                                id="active"
                                checked={newCoupon.active}
                                onChange={(e) => setNewCoupon({ ...newCoupon, active: e.target.checked })}
                                className="h-4 w-4 bg-black border-zinc-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-[#030508] rounded"
                            />
                            <label htmlFor="active" className="ml-3 text-[11px] uppercase tracking-widest font-mono text-emerald-400">
                                Activate immediately upon creation
                            </label>
                        </div>
                    </div>

                    <div className="p-6 border-t border-white/10 bg-[#030508]/80 flex justify-end space-x-4">
                        <button
                            onClick={() => document.getElementById('coupon-modal').classList.add('hidden')}
                            className="px-6 py-3 bg-transparent text-zinc-400 border border-white/10 rounded-xl hover:bg-white/5 transition-colors font-medium text-[13px] tracking-wide"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={addCoupon}
                            className="px-6 py-3 bg-emerald-500 text-black rounded-xl hover:bg-emerald-400 transition-colors font-medium text-[13px] tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                        >
                            Create Coupon
                        </button>
                    </div>
                </div>
            </div>

            {/* General Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#030508]/40 backdrop-blur-3xl rounded-2xl border border-white/5 p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
                    <h3 className="text-[14px] font-mono tracking-widest uppercase text-white mb-8 flex items-center gap-3 relative z-10">
                        <Server className="h-5 w-5 text-emerald-400" />
                        System Preferences
                    </h3>

                    <div className="space-y-6 relative z-10">
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

                <div className="bg-[#030508]/40 backdrop-blur-3xl rounded-2xl border border-white/5 p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
                    <h3 className="text-[14px] font-mono tracking-widest uppercase text-white mb-8 flex items-center gap-3 relative z-10">
                        <Shield className="h-5 w-5 text-emerald-400" />
                        Security & Access
                    </h3>

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-zinc-200">Admin 2FA</p>
                                <p className="text-sm font-light text-zinc-500">Require Two-Factor Auth for admins</p>
                            </div>
                            <Toggle active={false} onClick={() => { }} />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-zinc-200">Session Timeout</p>
                                <p className="text-sm font-light text-zinc-500">Auto-logout duration</p>
                            </div>
                            <select className="bg-white/5 border border-white/10 text-zinc-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500/50">
                                <option className="bg-[#030508]">15 minutes</option>
                                <option className="bg-[#030508]">30 minutes</option>
                                <option className="bg-[#030508]" selected>1 hour</option>
                                <option className="bg-[#030508]">2 hours</option>
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
