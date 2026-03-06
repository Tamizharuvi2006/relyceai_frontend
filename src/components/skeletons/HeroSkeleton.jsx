import React from 'react';

/**
 * Premium Hero Skeleton - Matches the minimalist centered HeroSection layout
 */
const HeroSkeleton = () => {
    return (
        <div className="relative h-screen min-h-[700px] w-full bg-[#030508] overflow-hidden flex flex-col justify-center items-center font-sans">
            {/* Soft radial vignette matching the Hero */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(3,5,8,0.95)_100%)] pointer-events-none z-10" />
            
            {/* Subtle atmospheric glow */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-20 w-full max-w-4xl mx-auto px-6 flex flex-col items-center justify-center text-center mt-[-8vh]">
                
                {/* Status Pill Skeleton */}
                <div className="mb-8 w-48 h-8 rounded-full bg-white/[0.03] border border-white/5 relative overflow-hidden skeleton-shimmer" />

                {/* Main Heading Skeleton - 2 lines */}
                <div className="w-full flex flex-col items-center gap-4 mb-8">
                    <div className="w-3/4 max-w-[600px] h-16 sm:h-20 lg:h-24 bg-white/[0.02] rounded-lg border border-white/5 relative overflow-hidden skeleton-shimmer" />
                    <div className="w-2/3 max-w-[500px] h-16 sm:h-20 lg:h-24 bg-white/[0.02] rounded-lg border border-white/5 relative overflow-hidden skeleton-shimmer" />
                </div>

                {/* Subtitle Skeleton - 2 lines */}
                <div className="w-full flex flex-col items-center gap-3 mb-12">
                    <div className="w-2/3 max-w-[600px] h-5 bg-white/[0.02] rounded border border-white/5 relative overflow-hidden skeleton-shimmer" />
                    <div className="w-1/2 max-w-[400px] h-5 bg-white/[0.02] rounded border border-white/5 relative overflow-hidden skeleton-shimmer" />
                </div>

                {/* CTA Buttons Skeleton */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center w-full">
                    <div className="w-48 h-12 rounded-full bg-white/[0.03] border border-white/10 relative overflow-hidden skeleton-shimmer" />
                </div>
            </div>

            {/* Shimmer Animation Styles */}
            <style dangerouslySetInnerHTML={{__html: `
                .skeleton-shimmer {
                    position: relative;
                }
                .skeleton-shimmer::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    transform: translateX(-100%);
                    background-image: linear-gradient(
                        90deg,
                        rgba(255, 255, 255, 0) 0%,
                        rgba(255, 255, 255, 0.05) 50%,
                        rgba(255, 255, 255, 0) 100%
                    );
                    animation: shimmer 2s infinite ease-in-out;
                }
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}} />
        </div>
    );
};

export default HeroSkeleton;
