import React from 'react';

/**
 * Premium Minimalist Loading Spinner
 * Clean and consistent across the app
 */
const LoadingSpinner = ({ size = 'default', message = 'Loading...', showMessage = true }) => {
  const sizeConfig = {
    small: { spinner: 'w-6 h-6 border-[1px]', text: 'text-[10px]' },
    default: { spinner: 'w-10 h-10 border-[1px]', text: 'text-[11px]' },
    large: { spinner: 'w-14 h-14 border-[1px]', text: 'text-xs' }
  };

  const config = sizeConfig[size] || sizeConfig.default;

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full h-full min-h-[200px]">
      {/* Sleek Minimalist Spinner */}
      <div className="relative flex items-center justify-center">
        {/* Outer subtle track */}
        <div className={`absolute ${config.spinner} rounded-full border-white/[0.05]`} />
        {/* Spinning indicator */}
        <div
          className={`${config.spinner} rounded-full border-transparent border-t-white/80 border-l-white/80 animate-spin`}
          style={{
            animation: 'spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite'
          }}
        />
        {/* Core dot glow */}
        <div className="absolute w-1 h-1 bg-white/50 rounded-full blur-[2px]" />
      </div>
      
      {/* Loading text */}
      {showMessage && message && (
        <div className={`flex items-center gap-3 ${config.text} tracking-[0.2em] uppercase text-zinc-500 font-medium`}>
          <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse" />
          <span>{message}</span>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;
