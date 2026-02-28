import React from 'react';

/**
 * Primary button with emerald theme
 */
export function PrimaryButton({ children, className = '', ...props }) {
    return (
        <button
            {...props}
            className={`w-full py-4 bg-white text-black text-[11px] font-mono tracking-[0.2em] uppercase transition-all duration-300 hover:bg-zinc-200 focus:outline-none focus:ring-1 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {children}
        </button>
    );
}

/**
 * Google sign-in button with white theme
 */
export function GoogleButton({ children, ...props }) {
    return (
        <button
            {...props}
            className="google-btn flex items-center justify-center gap-3 w-full py-4 border border-white/10 bg-transparent text-white text-[11px] font-mono tracking-[0.2em] uppercase hover:bg-white/[0.03] hover:border-white/20 transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-white/20"
        >
            {children}
        </button>
    );
}

/**
 * Gradient button for overlay panels
 */
export function GradientButton({ children, onClick }) {
    return (
        <button
            onClick={onClick}
            className="group relative px-10 py-4 border border-white/20 hover:border-white/40 transition-all duration-500 bg-transparent overflow-hidden"
        >
            <span className="relative text-[11px] font-mono tracking-[0.2em] uppercase text-zinc-300 group-hover:text-white flex items-center justify-center gap-2 transition-colors duration-500">
                {children}
            </span>
        </button>
    );
}
