import React from 'react';

/**
 * Simple Emerald Loading Spinner
 * Clean and consistent across the app
 */
const LoadingSpinner = ({ size = 'default', message = 'Loading...', showMessage = true }) => {
  const sizeConfig = {
    small: { spinner: 'w-8 h-8 border-2', text: 'text-sm' },
    default: { spinner: 'w-12 h-12 border-3', text: 'text-base' },
    large: { spinner: 'w-16 h-16 border-4', text: 'text-lg' }
  };

  const config = sizeConfig[size] || sizeConfig.default;

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full h-full min-h-[200px]">
      {/* Simple Arc Spinner */}
      <div
        className={`${config.spinner} rounded-full border-transparent border-t-emerald-500 border-r-emerald-500 animate-spin`}
        style={{
          borderStyle: 'solid',
          animation: 'spin 1s linear infinite'
        }}
      />
      
      {/* Loading text */}
      {showMessage && message && (
        <p className={`text-gray-400 ${config.text} font-medium`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
