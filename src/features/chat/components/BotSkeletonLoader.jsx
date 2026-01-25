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
    <div className="flex items-start gap-3 mb-6 animate-fade-in">
      {/* Spacer to align with avatar position on desktop */}
      <div className="w-8 hidden md:block flex-shrink-0"></div>

      {/* Message Bubble Skeleton */}
      <div className="relative w-full max-w-[80%] sm:max-w-2xl md:max-w-3xl">
        <div className="px-4 py-4 rounded-2xl rounded-bl-none bg-zinc-800/50 border border-emerald-500/20">
          {/* Status indicator */}
          <div className="flex items-center gap-2 mb-3">
            {isDeepSearch ? (
              <>
                <Search size={16} className="text-emerald-400 animate-pulse" />
                <span className="text-sm font-medium text-emerald-400">
                  Deep searching...
                </span>
              </>
            ) : (
              <>
                <Sparkles size={16} className="text-emerald-400 animate-pulse" />
                <span className="text-sm font-medium text-emerald-400">
                  Thinking...
                </span>
              </>
            )}
          </div>
          
          {/* Deep Search Sources Animation */}
          {isDeepSearch && (
            <div className="mb-3 p-2 rounded-lg bg-zinc-900/50 border border-zinc-700/50">
              <div className="flex items-center gap-2 text-xs">
                <CurrentSourceIcon size={14} className={`${deepSearchSources[currentSource].color} animate-bounce`} />
                <span className="text-zinc-400">
                  Searching {deepSearchSources[currentSource].name}...
                </span>
              </div>
              {/* Source progress dots */}
              <div className="flex gap-1 mt-2">
                {deepSearchSources.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      idx <= currentSource ? 'bg-emerald-500' : 'bg-zinc-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Skeleton text lines - cleaner design */}
          <div className="space-y-2.5 animate-pulse">
            <div className="h-3 rounded-full w-[90%] bg-zinc-700/50"></div>
            <div className="h-3 rounded-full w-[75%] bg-zinc-700/50"></div>
            <div className="h-3 rounded-full w-[60%] bg-zinc-700/50"></div>
          </div>
          
          {/* Animated thinking dots at the bottom */}
          <div className="mt-4 flex gap-1.5 items-center">
            <div 
              className="w-2 h-2 rounded-full bg-emerald-500/70 animate-bounce" 
              style={{ animationDelay: '0ms', animationDuration: '0.8s' }}
            />
            <div 
              className="w-2 h-2 rounded-full bg-emerald-500/70 animate-bounce" 
              style={{ animationDelay: '150ms', animationDuration: '0.8s' }}
            />
            <div 
              className="w-2 h-2 rounded-full bg-emerald-500/70 animate-bounce" 
              style={{ animationDelay: '300ms', animationDuration: '0.8s' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotSkeletonLoader;
