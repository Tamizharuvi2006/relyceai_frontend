import React from 'react';
import { CheckCircle } from 'lucide-react';

/**
 * Success message with redirect progress bar
 */
export function SuccessMessage({ message }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black text-emerald-400 p-4">
            <div className="text-center max-w-md w-full animate-fade-in-down">
                <div className="mb-6">
                    <div className="bg-emerald-500/10 p-4 rounded-full inline-block animate-pulse-slow">
                        <CheckCircle size={48} className="text-emerald-400" />
                    </div>
                </div>
                <h1 className="text-3xl font-extrabold text-white mb-4">Thank You!</h1>
                <p className="text-lg mb-6">{message}</p>
                <div className="w-full bg-zinc-800 rounded-full h-2.5">
                    <div className="bg-emerald-500 h-2.5 rounded-full w-full animate-pulse"></div>
                </div>
                <p className="text-zinc-400 mt-4">Redirecting to home page...</p>
            </div>
        </div>
    );
}

/**
 * Loading spinner
 */
export function LoadingSpinner() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black text-emerald-400">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                <p className="text-lg">Loading...</p>
            </div>
        </div>
    );
}

export default SuccessMessage;
