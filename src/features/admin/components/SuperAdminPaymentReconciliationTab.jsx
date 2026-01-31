
import React, { useState } from 'react';
import { Search, Loader2, CheckCircle2, AlertCircle, RefreshCw, Calendar, CreditCard, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { checkPaymentStatus, syncPaymentManual } from '../services/adminDashboard';
import { useTheme } from '../../../context/ThemeContext'; // Assuming useTheme comes from next-themes

const SuperAdminPaymentReconciliationTab = ({ tabVariants, onSyncSuccess }) => {
  const { theme } = useTheme();
  
  // States
  const [paymentId, setPaymentId] = useState('');
  const [userId, setUserId] = useState('');
  const [planId, setPlanId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  const handleCheck = async () => {
    if (!paymentId.trim()) {
      toast.error('Please enter a Payment ID');
      return;
    }
    
    setLoading(true);
    setPaymentData(null);
    try {
      const result = await checkPaymentStatus(paymentId.trim());
      if (result.success) {
        setPaymentData(result.payment);
        
        // Logic to prefill or auto-select fields
        // Prioritize existing notes, then suggestions, then empty
        const noteUserId = result.payment.notes.user_id !== 'N/A' ? result.payment.notes.user_id : '';
        const suggestedUserId = result.payment.suggested_user_id; // Backend now returns this
        
        if (noteUserId) {
            setUserId(noteUserId);
        } else if (suggestedUserId) {
            setUserId(suggestedUserId);
            toast.success("User automatically found by email!");
        } else {
            setUserId('');
        }

        const notePlanId = result.payment.notes.plan_id !== 'N/A' ? result.payment.notes.plan_id : '';
        const inferredPlan = result.payment.inferred_plan; // Backend returns this based on amount
        
        if (notePlanId) {
            setPlanId(notePlanId);
        } else if (inferredPlan) {
            setPlanId(inferredPlan);
        } else {
             setPlanId('');
        }
        
        toast.success('Payment found');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Payment not found');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!userId.trim() || !planId.trim()) {
      toast.error('User ID and Plan ID are required for sync');
      return;
    }

    setSyncing(true);
    try {
      const result = await syncPaymentManual(paymentId.trim(), userId.trim(), planId);
      if (result.success) {
        toast.success(result.message);
        // Clear data or update UI
        setPaymentData(null);
        setPaymentId('');
        
        // Refresh parent data
        if (onSyncSuccess) onSyncSuccess();
        // Reset fields
        setUserId('');
        setPlanId('');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <motion.div
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        
        <div className="relative z-10">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <RefreshCw className="text-emerald-400 w-5 h-5 shadow-emerald-500/20" /> Payment Reconciliation
            </h3>
            <p className="text-zinc-400 mb-8 text-sm max-w-3xl leading-relaxed">
            Manually verify and sync missing payments. Enter a Razorpay Payment ID to verify status and activate plans instantly.
            </p>

            {/* Search Input - Clean & Big */}
            <div className="flex gap-4 items-stretch max-w-2xl mb-10">
            <div className="flex-1 relative group/input">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5 group-focus-within/input:text-emerald-400 transition-colors" />
                <input 
                    type="text" 
                    value={paymentId}
                    onChange={(e) => setPaymentId(e.target.value)}
                    placeholder="Enter Payment ID (e.g. pay_Z7s...)"
                    className="w-full bg-black/40 border border-zinc-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-mono tracking-wide"
                />
            </div>
            <button
                onClick={handleCheck}
                disabled={loading || !paymentId}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-500/20 active:scale-95 flex items-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Check Status'}
            </button>
            </div>

            {/* Results Area - Invoice Style */}
            <AnimatePresence>
            {paymentData && (
                <motion.div 
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="overflow-hidden"
                >
                    <div className="grid md:grid-cols-2 gap-8 border-t border-white/5 pt-8">
                        
                        {/* Left: Digital Receipt */}
                        <div className="bg-white/5 rounded-2xl p-1 border border-white/5 shadow-inner">
                            <div className="bg-black/40 rounded-xl p-6 h-full relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                                    <div className="w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
                                </div>

                                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center border border-white/5">
                                            <CreditCard className="text-zinc-400 w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-zinc-400">Payment Receipt</h4>
                                            <p className="text-xs text-zinc-600 font-mono mt-0.5">{paymentData.id}</p>
                                        </div>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                        paymentData.status === 'captured' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    }`}>
                                        {paymentData.status}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm text-zinc-500">Amount Paid</span>
                                        <span className="text-2xl font-bold text-white font-mono tracking-tight">₹{paymentData.amount?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-zinc-500">Payment Method</span>
                                        <span className="text-sm text-zinc-300 capitalize flex items-center gap-2">
                                            {paymentData.method}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-zinc-500">Payer Email</span>
                                        <span className="text-sm text-zinc-300">{paymentData.email || '—'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-zinc-500">Date</span>
                                        <span className="text-sm text-zinc-300">
                                            {new Date(paymentData.created_at * 1000).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-dashed border-zinc-800">
                                    <div className="flex items-center justify-between text-xs text-zinc-500 uppercase tracking-widest">
                                        <span>Total</span>
                                        <span>INR</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Action Form */}
                        <div className="flex flex-col justify-center">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Assign User</label>
                                    <div className="relative group/field">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 w-4 h-4 group-focus-within/field:text-blue-400 transition-colors" />
                                        <input 
                                            type="text" 
                                            value={userId}
                                            onChange={(e) => setUserId(e.target.value)}
                                            className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:border-blue-500/50 focus:bg-zinc-900 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-mono placeholder-zinc-700"
                                            placeholder="User UID"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Plan</label>
                                    <div className="relative group/field">
                                        <select 
                                            value={planId}
                                            onChange={(e) => setPlanId(e.target.value)}
                                            className={`w-full bg-zinc-900/50 border ${paymentData.inferred_plan ? 'border-emerald-500/30 text-emerald-100 shadow-[0_0_15px_-3px_rgba(16,185,129,0.1)]' : 'border-zinc-700/50 text-white'} rounded-xl py-3 pl-4 pr-10 text-sm focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none appearance-none cursor-pointer hover:bg-zinc-900`}
                                        >
                                            <option value="" className="bg-zinc-900 text-zinc-500">Select Plan...</option>
                                            <option value="starter" className="bg-zinc-900">Starter</option>
                                            <option value="plus" className="bg-zinc-900">Plus</option>
                                            <option value="pro" className="bg-zinc-900">Pro</option>
                                            <option value="business" className="bg-zinc-900">Business</option>
                                        </select>
                                        {paymentData.inferred_plan && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <div className="flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {paymentData.inferred_plan && (
                                        <p className="text-[10px] text-emerald-500/70 flex items-center gap-1.5 ml-1">
                                            <CheckCircle2 className="w-3 h-3" /> Auto-detected based on amount
                                        </p>
                                    )}
                                </div>

                                {paymentData.status === 'captured' ? (
                                    <button
                                        onClick={handleSync}
                                        disabled={syncing}
                                        className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5 active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                                    >
                                        {syncing ? <Loader2 className="animate-spin w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                                        Run Reconciliation Sync
                                    </button>
                                ) : (
                                    <div className="mt-4 bg-red-500/10 border border-red-500/10 rounded-xl p-4 flex items-center justify-center gap-3 text-red-200 text-sm font-medium">
                                        <AlertCircle className="w-5 h-5 text-red-500" />
                                        Payment execution failed/pending
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default SuperAdminPaymentReconciliationTab;
