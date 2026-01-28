import React from 'react';

/**
 * Hero Skeleton - Matches the actual HeroSection layout
 * Shows skeleton placeholders that resemble the real content
 */
const HeroSkeleton = () => {
    return (
        <div className="min-h-screen bg-[#05060a] overflow-hidden">
            {/* Main Content Container */}
            <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-12 lg:pt-5 lg:pb-16"> // Added top padding for mobile to account for fixed header
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[calc(100vh-120px)]">

                    {/* Left Side - Text Content */}
                    <div className="text-center lg:text-left order-1">
                        
                        {/* Premium Pill Skeleton */}
                        <div className="inline-flex h-8 w-40 bg-emerald-900/20 rounded-full mb-6 mx-auto lg:mx-0 animate-shimmer border border-emerald-500/10" />

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

                        {/* CTA Buttons Skeleton - Updated to match new layout (2 buttons) */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                            <div className="h-14 w-48 bg-gradient-to-r from-emerald-600/40 to-emerald-500/30 rounded-full animate-shimmer" />
                            <div className="h-14 w-48 bg-emerald-900/10 border border-emerald-500/10 rounded-full animate-shimmer" />
                        </div>

                        {/* Feature Cards Skeleton */}
                        <div className="grid grid-cols-3 gap-3 lg:gap-6">
                            {[0, 1, 2].map(i => (
                                <div
                                    key={i}
                                    className="p-4 rounded-xl bg-emerald-900/10 border border-emerald-500/10 animate-shimmer flex flex-col items-center justify-center lg:block"
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
                            <div className="h-4 bg-zinc-800/30 rounded w-56 animate-shimmer" style={{ animationDelay: '0.7s' }} />
                        </div>
                    </div>

                    {/* Right Side - Chat Mockup Skeleton */}
                    <div className="hidden lg:flex order-2 justify-end">
                        <div className="relative w-full max-w-md">
                            {/* Glow Effect */}
                            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 via-emerald-400/5 to-emerald-500/10 rounded-3xl blur-2xl animate-pulse" />

                            {/* Chat Window Skeleton */}
                            <div className="relative rounded-2xl bg-[#0a0f0a]/80 border border-emerald-500/20 backdrop-blur-xl overflow-hidden shadow-2xl">
                                {/* Chat Header */}
                                <div className="h-12 border-b border-emerald-500/10 flex items-center px-4 gap-3 bg-emerald-500/5">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/20 animate-pulse" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 animate-pulse" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/20 animate-pulse" />
                                    </div>
                                    <div className="flex-1 flex justify-center">
                                        <div className="h-2 bg-emerald-500/20 rounded w-24" />
                                    </div>
                                </div>

                                {/* Chat Messages Body */}
                                <div className="p-5 space-y-4 min-h-[350px]">
                                    
                                    {/* AI Message 1 */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/20 animate-shimmer shrink-0" />
                                        <div className="bg-[#0f1a0f] border border-emerald-500/10 rounded-2xl rounded-tl-none px-4 py-3 w-4/5">
                                            <div className="h-3 bg-zinc-700/40 rounded w-full mb-2 animate-shimmer" />
                                            <div className="h-3 bg-zinc-700/30 rounded w-2/3 animate-shimmer" style={{ animationDelay: '0.1s' }} />
                                        </div>
                                    </div>
                                    
                                    {/* User Message */}
                                    <div className="flex items-start gap-3 flex-row-reverse">
                                        <div className="w-9 h-9 rounded-xl bg-zinc-800/80 border border-white/10 animate-shimmer shrink-0" />
                                        <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-2xl rounded-tr-none px-4 py-3 w-3/4">
                                            <div className="h-3 bg-emerald-500/10 rounded w-full animate-shimmer" style={{ animationDelay: '0.2s' }} />
                                        </div>
                                    </div>

                                    {/* AI Message 2 with Chart Skeleton */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/20 animate-shimmer shrink-0" />
                                        
                                        <div className="space-y-2 w-full max-w-[85%]">
                                             {/* Analyzing text */}
                                             <div className="h-2 w-24 bg-emerald-500/30 rounded animate-pulse mb-1" />
                                             
                                             <div className="bg-[#0f1a0f] border border-emerald-500/10 rounded-2xl rounded-tl-none px-4 py-3 w-full">
                                                <div className="h-3 bg-zinc-700/40 rounded w-full mb-3 animate-shimmer" />
                                                
                                                {/* Chart Placeholder */}
                                                <div className="h-24 w-full bg-black/40 rounded-lg border border-emerald-500/10 relative overflow-hidden flex items-end justify-between px-2 pb-2 gap-1">
                                                    {[50, 80, 40, 90, 60, 75].map((h, i) => (
                                                        <div 
                                                          key={i} 
                                                          className="w-full bg-emerald-500/20 rounded-t-sm animate-shimmer" 
                                                          style={{ height: `${h}%`, animationDelay: `${0.3 + i * 0.1}s` }} 
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Chat Input Skeleton */}
                                <div className="p-3 border-t border-white/5 bg-black/20">
                                    <div className="flex items-center gap-3 bg-white/5 border border-emerald-500/10 rounded-xl px-3 py-2.5">
                                        <div className="flex-1 h-3 bg-zinc-800/40 rounded animate-shimmer" />
                                        <div className="w-7 h-7 rounded-lg bg-emerald-500/30 animate-shimmer" />
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
