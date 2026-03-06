import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Plus, Eye, EyeOff, Trash2, Pencil } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const SuperAdminCouponsTab = ({
    tabVariants,
    coupons,
    newCoupon,
    setNewCoupon,
    addCoupon,
    handleToggleCouponStatus,
    handleDeleteCoupon,
    handleUpdateCoupon
}) => {
    const { theme } = useTheme();
    const [editingId, setEditingId] = React.useState(null);

    const handleEditClick = (coupon) => {
        setEditingId(coupon.id);
        setNewCoupon({
            code: coupon.code,
            monthlyDiscount: coupon.monthlyDiscount || '',
            yearlyDiscount: coupon.yearlyDiscount || '',
            type: coupon.type,
            description: coupon.description,
            active: coupon.active
        });
        const modal = document.getElementById('coupon-modal');
        if (modal) modal.classList.remove('hidden');
    };

    const handleCloseModal = () => {
        setEditingId(null);
        setNewCoupon({
            code: '',
            monthlyDiscount: '',
            yearlyDiscount: '',
            type: 'percentage',
            description: '',
            active: true
        });
        const modal = document.getElementById('coupon-modal');
        if (modal) modal.classList.add('hidden');
    };

    const handleSave = async () => {
        if (editingId) {
            const success = await handleUpdateCoupon(editingId, newCoupon);
            if (success) handleCloseModal();
        } else {
            // allow addCoupon to handle its own logic/state reset if needed, 
            // but usually we might want to wrap it to close modal on success too.
            // For now assuming addCoupon handles its own success/failure toast but not modal closing?
            // Checking previous code: addCoupon resets state but doesn't explicitly close modal via DOM?
            // The original button just called addCoupon. The modal closing was manual in cancel. 
            // Let's assume addCoupon needs to be called. 
            // Actually original Add Coupon button just opened the modal. 
            // The "Add Coupon" inside modal called addCoupon.
            // Let's wrap addCoupon to close modal if successful.
            // But addCoupon in parent doesn't return success/failure easily unless we change it.
            // Parent addCoupon resets state. 
            // Let's just call addCoupon(); if it works, user manually closes or we can close it.
            // Standardizing: Let's close modal after add.
            await addCoupon();
            handleCloseModal();
        }
    };

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
                <div className="bg-[#030508]/40 backdrop-blur-3xl rounded-2xl shadow-2xl border border-white/5 p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <h2 className="text-[13px] font-mono tracking-widest uppercase flex items-center text-white">
                            <CreditCard className="h-4 w-4 mr-3 text-emerald-400" />
                            Coupon Management
                        </h2>
                        <button
                            onClick={() => {
                                setEditingId(null);
                                setNewCoupon({
                                    code: '',
                                    monthlyDiscount: '',
                                    yearlyDiscount: '',
                                    type: 'percentage',
                                    description: '',
                                    active: true
                                });
                                const modal = document.getElementById('coupon-modal');
                                if (modal) modal.classList.remove('hidden');
                            }}
                            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-medium text-[13px] tracking-wide rounded-lg flex items-center space-x-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                        >
                            <Plus className="h-4 w-4" strokeWidth={2} />
                            <span>Create Coupon</span>
                        </button>
                    </div>

                    <div className="overflow-x-auto relative z-10">
                        <table className="min-w-full divide-y divide-white/5">
                            <thead className="bg-[#030508]/80">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-widest">Code</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-widest">Discount</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-widest">Type</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-widest">Description</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-transparent divide-y divide-white/5">
                                {coupons.map((coupon) => (
                                    <tr key={coupon.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-5 whitespace-nowrap text-[13px] font-mono font-medium text-white tracking-widest">
                                            {coupon.code}
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400 font-mono tracking-wide">
                                            {coupon.monthlyDiscount > 0 && <div className="text-zinc-300">Mo: <span className="text-emerald-400">{coupon.monthlyDiscount}%</span></div>}
                                            {coupon.yearlyDiscount > 0 && <div className="text-zinc-300">Yr: <span className="text-emerald-400">{coupon.yearlyDiscount}%</span></div>}
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-xs font-mono tracking-widest uppercase text-zinc-500">
                                            {coupon.type}
                                        </td>
                                        <td className="px-6 py-5 text-sm text-zinc-400 font-light">
                                            {coupon.description}
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-sm">
                                            <span className={`px-2.5 py-1 inline-flex text-[10px] font-mono uppercase tracking-widest rounded border ${coupon.active
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : 'bg-red-500/10 text-red-500 border-red-500/20'
                                                }`}>
                                                {coupon.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-300">
                                            <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleToggleCouponStatus(coupon.id, coupon.active)}
                                                    className={`p-1.5 rounded transition-colors ${coupon.active
                                                        ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                                                        : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                                                        }`}
                                                    title={coupon.active ? 'Deactivate' : 'Activate'}
                                                >
                                                    {coupon.active ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                                                </button>
                                                <button
                                                    onClick={() => handleEditClick(coupon)}
                                                    className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-4 w-4" strokeWidth={1.5} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCoupon(coupon.id)}
                                                    className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
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
            <div id="coupon-modal" className="hidden fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
                <div className="bg-[#030508] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] relative">
                    <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-50" />
                    <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                        <h3 className="text-[13px] font-mono tracking-widest uppercase text-white">
                            {editingId ? 'Edit Configuration' : 'New Configuration'}
                        </h3>
                    </div>
                    <div className="p-8 overflow-y-auto space-y-6 custom-scrollbar">
                        <div>
                            <label className="block text-[10px] font-mono text-emerald-400/80 uppercase tracking-widest mb-3">
                                Coupon Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={newCoupon.code}
                                onChange={(e) => setNewCoupon(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-mono tracking-widest text-[13px] placeholder-zinc-700"
                                placeholder="E.G. SAVE20"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">
                                    Monthly Discount (%)
                                </label>
                                <input
                                    type="number"
                                    value={newCoupon.monthlyDiscount}
                                    onChange={(e) => setNewCoupon(prev => ({ ...prev, monthlyDiscount: e.target.value }))}
                                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-mono text-[13px] placeholder-zinc-700"
                                    placeholder="20"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">
                                    Yearly Discount (%)
                                </label>
                                <input
                                    type="number"
                                    value={newCoupon.yearlyDiscount}
                                    onChange={(e) => setNewCoupon(prev => ({ ...prev, yearlyDiscount: e.target.value }))}
                                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-mono text-[13px] placeholder-zinc-700"
                                    placeholder="25"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={newCoupon.description}
                                onChange={(e) => setNewCoupon(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-light text-sm placeholder-zinc-700"
                                placeholder="What is this coupon for?"
                                rows="2"
                            />
                        </div>
                        <div className="flex items-center p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl mt-6 cursor-pointer hover:bg-emerald-500/10 transition-colors" onClick={() => setNewCoupon(prev => ({ ...prev, active: !prev.active }))}>
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    id="active"
                                    checked={newCoupon.active}
                                    onChange={(e) => setNewCoupon(prev => ({ ...prev, active: e.target.checked }))}
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-emerald-500/30 bg-black/50 checked:bg-emerald-500 checked:border-emerald-500 transition-all"
                                />
                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">
                                    <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </span>
                            </div>
                            <label htmlFor="active" className="ml-4 text-[11px] font-mono tracking-widest uppercase text-emerald-400 cursor-pointer">
                                Status: {newCoupon.active ? 'ACTIVE' : 'INACTIVE'}
                            </label>
                        </div>
                    </div>
                    <div className="p-6 border-t border-white/5 bg-white/5 flex justify-end space-x-4">
                        <button
                            onClick={handleCloseModal}
                            className="px-6 py-2.5 bg-transparent text-zinc-400 hover:text-white rounded-lg transition-colors font-medium text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2.5 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors font-medium text-sm shadow-lg shadow-white/10"
                        >
                            {editingId ? 'Save Changes' : 'Create Coupon'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SuperAdminCouponsTab;
