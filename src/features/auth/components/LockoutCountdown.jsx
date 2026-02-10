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
        <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-500/20">
                    <AlertTriangle size={20} className="text-red-400" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-red-400">
                        Too many failed attempts
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        <Clock size={14} className="text-zinc-400" />
                        <span className="text-xs text-zinc-400">
                            Try again in <span className="font-mono text-red-400">{formatTime(remaining)}</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Optional: Password Reset Link */}
            <button
                type="button"
                onClick={() => {
                    // Could trigger Firebase password reset here
                    window.open(`https://relyce.ai/reset-password?email=${encodeURIComponent(email)}`, '_blank');
                }}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-3 text-xs text-zinc-400 hover:text-emerald-400 transition-colors"
            >
                <RefreshCw size={12} />
                Forgot password? Reset it
            </button>
        </div>
    );
}

export default LockoutCountdown;
