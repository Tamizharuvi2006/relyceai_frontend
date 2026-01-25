import React from 'react';

/**
 * Reusable input component with icon for auth forms
 */
export function InputWithIcon({ icon, ...props }) {
    return (
        <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                {icon}
            </div>
            <input
                {...props}
                className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-zinc-900/50 border border-zinc-700 text-emerald-400 placeholder-zinc-500 hover:border-emerald-500/50"
            />
        </div>
    );
}

export default InputWithIcon;
