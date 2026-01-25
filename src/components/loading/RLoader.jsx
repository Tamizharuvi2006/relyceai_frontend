import React from 'react';

/**
 * Animated R Logo Loader with emerald light trace effect
 */
const RLoader = ({ size = 'default', message = '' }) => {
    const sizeClasses = {
        small: 'w-12 h-12',
        default: 'w-20 h-20',
        large: 'w-32 h-32'
    };

    const textSizes = {
        small: 'text-2xl',
        default: 'text-4xl',
        large: 'text-6xl'
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            {/* R Logo Container */}
            <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/20 via-emerald-400/10 to-emerald-500/20 animate-pulse" />

                {/* Spinning trace light */}
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-emerald-400 rounded-full blur-sm shadow-lg shadow-emerald-400/80" />
                </div>

                {/* Second trace (offset) */}
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s', animationDelay: '-1s' }}>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-emerald-300 rounded-full blur-sm opacity-60" />
                </div>

                {/* R Letter */}
                <span
                    className={`${textSizes[size]} font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-400 animate-pulse relative z-10`}
                    style={{
                        textShadow: '0 0 30px rgba(16, 185, 129, 0.5), 0 0 60px rgba(16, 185, 129, 0.3)',
                        animationDuration: '1.5s'
                    }}
                >
                    R
                </span>

                {/* Inner glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-radial from-emerald-500/10 to-transparent animate-pulse" />
            </div>

            {/* Loading text */}
            {message && (
                <p className="text-gray-400 text-sm animate-pulse">{message}</p>
            )}

            {/* Animated dots */}
            <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.6s' }}
                    />
                ))}
            </div>
        </div>
    );
};

export default RLoader;
