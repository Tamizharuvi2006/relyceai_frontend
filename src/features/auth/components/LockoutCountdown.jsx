import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Countdown timer shown when login is temporarily locked
 */
export function LockoutCountdown({ waitSeconds, onExpire, email }) {
    const [remaining, setRemaining] = useState(waitSeconds);

    useEffect(() => {
        setRemaining(waitSeconds);
    }, [waitSeconds]);

    useEffect(() => {
        if (remaining <= 0) {
            onExpire?.();
            return;
        }

        const timer = setInterval(() => {
            setRemaining(prev => {
                if (prev <= 1) {
                    onExpire?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [remaining, onExpire]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
    };

    if (remaining <= 0) return null;

    return (
        <div className="mb-6 p-5 rounded-xl bg-[#0a0d14] border border-red-500/20 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-50" />
            
            <div className="flex flex-col items-center text-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-1">
                    <AlertTriangle size={18} className="text-red-400" />
                </div>
                
                <div>
                    <h3 className="text-[14px] font-medium text-white mb-1 tracking-wide">Access Temporarily Locked</h3>
                    <p className="text-[12px] text-zinc-400 leading-relaxed max-w-[240px] mx-auto">
                        Maximum login attempts reached for security purposes.
                    </p>
                </div>

                <div className="flex items-center gap-2 mt-2 px-4 py-2 rounded-full bg-white/5 border border-white/5">
                    <Clock size={12} className="text-zinc-500" />
                    <span className="text-[11px] uppercase tracking-widest text-zinc-300">
                        Try again in <span className="text-red-400 font-mono ml-1">{formatTime(remaining)}</span>
                    </span>
                </div>
            </div>

            <button
                type="button"
                onClick={() => {
                    window.open(`https://relyce.ai/reset-password?email=${encodeURIComponent(email)}`, '_blank');
                }}
                className="mt-5 w-full flex items-center justify-center gap-2 py-3 border-t border-white/5 text-[11px] uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/[0.02] transition-all duration-300"
            >
                <RefreshCw size={12} />
                Reset Password
            </button>
        </div>
    );
}

export default LockoutCountdown;
