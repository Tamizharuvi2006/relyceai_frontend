import React, { useState, useEffect } from 'react';
import { Sparkles, Globe, Search, Newspaper, BookOpen, ShoppingBag } from 'lucide-react';

/**
 * Bot Skeleton Loader - Premium loading animation for when the bot is preparing a response
 * Shows a clean, animated skeleton that matches the search skeleton style
 * When isDeepSearch is true, shows animated search sources
 */
const BotSkeletonLoader = ({ isDeepSearch = false, searchStatus = null }) => {
  const [currentSource, setCurrentSource] = useState(0);
  
  // Deep search sources to cycle through
  const deepSearchSources = [
    { name: 'Web Search', icon: Globe, color: 'text-blue-400' },
    { name: 'News', icon: Newspaper, color: 'text-red-400' },
    { name: 'Scholar', icon: BookOpen, color: 'text-purple-400' },
    { name: 'Shopping', icon: ShoppingBag, color: 'text-yellow-400' },
  ];

  // Cycle through sources when deep search is active
  useEffect(() => {
    if (isDeepSearch) {
      const interval = setInterval(() => {
        setCurrentSource(prev => (prev + 1) % deepSearchSources.length);
      }, 800);
      return () => clearInterval(interval);
    }
  }, [isDeepSearch]);

  const CurrentSourceIcon = deepSearchSources[currentSource].icon;
  
  return (
    <div className="flex items-start gap-6 mb-12 w-full animate-fade-in pb-10">
      <div className="flex-1 min-w-0 px-2 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-white/80 leading-loose text-[15px] font-light font-['Inter',sans-serif]">
          {/* Status indicator */}
          <div className="flex items-center gap-2 mb-3">
            {isDeepSearch ? (
              <div className="flex items-center gap-4 py-3 min-h-[44px]">
                <div className="relative flex h-3 w-3 mt-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20"></span>
                  <Search size={14} className="text-emerald-400 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <span className="text-[13px] font-sans tracking-wide text-emerald-400 font-light animate-pulse mt-1">Deep searching...</span>
              </div>
            ) : (
              <div className="flex items-center gap-4 py-3 min-h-[44px]">
                <div className="relative flex h-3 w-3 mt-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]"></span>
                </div>
                <span className="text-[13px] font-sans tracking-wide text-zinc-400 font-light animate-pulse mt-1">Thinking...</span>
              </div>
            )}
          </div>
          
          {/* Deep Search Sources Animation */}
          {isDeepSearch && (
            <div className="mb-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 shadow-inner max-w-md">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-white/50 mb-3">
                <CurrentSourceIcon size={12} className={`${deepSearchSources[currentSource].color}`} />
                <span>
                  Searching {deepSearchSources[currentSource].name}...
                </span>
              </div>
              {/* Source progress dots */}
              <div className="flex gap-1.5 mt-2">
                {deepSearchSources.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      idx <= currentSource ? 'w-4 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'w-1 bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Skeleton text lines - cleaner design matching MessageComponent typography */}
          <div className="space-y-4 animate-pulse mt-6">
            <div className="h-2 rounded-full w-full bg-white/[0.03]"></div>
            <div className="h-2 rounded-full w-[85%] bg-white/[0.03]"></div>
            <div className="h-2 rounded-full w-[95%] bg-white/[0.03]"></div>
            <div className="h-2 rounded-full w-[60%] bg-white/[0.03]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotSkeletonLoader;
