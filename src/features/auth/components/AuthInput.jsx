import React from 'react';

/**
 * Reusable input component with icon for auth forms
 */
export function InputWithIcon({ icon, ...props }) {
    return (
        <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none opacity-50">
                {icon}
            </div>
            <input
                {...props}
                className="w-full pl-10 pr-4 py-3 bg-transparent border-b border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-white/40 transition-colors duration-300 text-sm tracking-wide font-light"
            />
        </div>
    );
}

export default InputWithIcon;
