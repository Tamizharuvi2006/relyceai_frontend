import React from 'react';

/**
 * Hero Skeleton - Matches the actual HeroSection layout
 * Shows skeleton placeholders that resemble the real content
 */
const HeroSkeleton = () => {
    return (
        <div className="min-h-screen bg-[#05060a] overflow-hidden">
            {/* Main Content Container */}
            <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-12 lg:pt-5 lg:pb-16">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[calc(100vh-120px)]">

                    {/* Left Side - Text Content */}
                    <div className="text-center lg:text-left">
                        {/* Main Heading Skeleton */}
                        <div className="space-y-3 mb-6">
                            <div className="h-12 lg:h-16 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 rounded-lg w-full animate-shimmer" />
                            <div className="h-12 lg:h-16 bg-gradient-to-r from-emerald-900/30 via-emerald-800/40 to-emerald-900/30 rounded-lg w-4/5 mx-auto lg:mx-0 animate-shimmer" style={{ animationDelay: '0.1s' }} />
                        </div>

                        {/* Subtitle Skeleton */}
                        <div className="space-y-2 mb-8 max-w-xl mx-auto lg:mx-0">
                            <div className="h-5 bg-zinc-800/60 rounded w-full animate-shimmer" style={{ animationDelay: '0.2s' }} />
                            <div className="h-5 bg-zinc-800/40 rounded w-3/4 mx-auto lg:mx-0 animate-shimmer" style={{ animationDelay: '0.3s' }} />
                        </div>

                        {/* CTA Button Skeleton */}
                        <div className="flex justify-center lg:justify-start mb-12">
                            <div className="h-14 w-48 bg-gradient-to-r from-emerald-600/40 to-emerald-500/30 rounded-full animate-shimmer" />
                        </div>

                        {/* Feature Cards Skeleton */}
                        <div className="grid grid-cols-3 gap-4">
                            {[0, 1, 2].map(i => (
                                <div
                                    key={i}
                                    className="p-4 rounded-xl bg-emerald-900/10 border border-emerald-500/10 animate-shimmer"
                                    style={{ animationDelay: `${0.4 + i * 0.1}s` }}
                                >
                                    <div className="w-10 h-10 bg-emerald-500/10 rounded-lg mb-3" />
                                    <div className="h-3 bg-zinc-700/50 rounded w-3/4 mb-2" />
                                    <div className="h-3 bg-zinc-700/30 rounded w-1/2" />
                                </div>
                            ))}
                        </div>

                        {/* Developer Tag Skeleton */}
                        <div className="mt-8 flex justify-center lg:justify-start">
                            <div className="h-3 bg-zinc-800/30 rounded w-40 animate-shimmer" style={{ animationDelay: '0.7s' }} />
                        </div>
                    </div>

                    {/* Right Side - Chat Mockup Skeleton */}
                    <div className="flex justify-center lg:justify-end">
                        <div className="relative w-full max-w-sm lg:max-w-md">
                            {/* Glow Effect */}
                            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 via-emerald-400/5 to-emerald-500/10 rounded-3xl blur-2xl animate-pulse" />

                            {/* Chat Window Skeleton */}
                            <div className="relative rounded-2xl bg-[#0a0f0a]/80 border border-emerald-500/20 backdrop-blur-xl overflow-hidden">
                                {/* Chat Header */}
                                <div className="p-4 border-b border-emerald-500/10 flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/50 animate-pulse" />
                                    <div className="h-3 bg-zinc-700/50 rounded w-32 animate-shimmer" />
                                </div>

                                {/* Chat Messages */}
                                <div className="p-6 space-y-4 min-h-[280px]">
                                    {/* AI Message Skeleton */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/20 animate-shimmer" />
                                        <div className="bg-[#0f1a0f] border border-emerald-500/10 rounded-2xl rounded-tl-none px-4 py-3 w-3/4">
                                            <div className="h-3 bg-zinc-700/40 rounded w-full mb-2 animate-shimmer" />
                                            <div className="h-3 bg-zinc-700/30 rounded w-2/3 animate-shimmer" style={{ animationDelay: '0.1s' }} />
                                        </div>
                                    </div>

                                    {/* Typing Indicator Skeleton */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/20 animate-shimmer" />
                                        <div className="bg-[#0f1a0f] border border-emerald-500/10 rounded-2xl rounded-tl-none px-4 py-3">
                                            <div className="flex gap-1">
                                                {[0, 1, 2].map(i => (
                                                    <div
                                                        key={i}
                                                        className="w-2 h-2 rounded-full bg-emerald-400/50 animate-bounce"
                                                        style={{ animationDelay: `${i * 0.15}s` }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Chat Input Skeleton */}
                                <div className="p-4 border-t border-emerald-500/10">
                                    <div className="flex items-center gap-3 bg-[#0a0f0a] border border-emerald-500/10 rounded-xl px-4 py-3">
                                        <div className="flex-1 h-4 bg-zinc-800/40 rounded animate-shimmer" />
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/40 animate-shimmer" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Shimmer Animation */}
            <style>{`
        @keyframes shimmer {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
        .animate-shimmer {
          animation: shimmer 1.5s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
};

export default HeroSkeleton;
