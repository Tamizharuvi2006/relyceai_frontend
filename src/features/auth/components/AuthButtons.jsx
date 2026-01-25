import React from 'react';

/**
 * Primary button with emerald theme
 */
export function PrimaryButton({ children, className = '', ...props }) {
    return (
        <button
            {...props}
            className={`w-full py-3 rounded-lg font-semibold bg-emerald-500 hover:bg-emerald-600 text-black transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
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
            className="google-btn flex items-center justify-center gap-2 w-full py-3 rounded-lg font-semibold bg-white text-black hover:bg-gray-200 transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
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
            className="group relative px-10 py-4 rounded-xl font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/30"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 group-hover:opacity-90"></div>
            <span className="relative text-black flex items-center gap-2">
                {children}
            </span>
        </button>
    );
}
