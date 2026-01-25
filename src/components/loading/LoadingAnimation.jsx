import React from 'react';

const LoadingAnimation = ({ type = 'dots', theme = 'light', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  
  const dotSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };
  
  const currentSize = sizeClasses[size] || sizeClasses.md;
  const currentDotSize = dotSizeClasses[size] || dotSizeClasses.md;
  
  const isDark = theme === 'dark';
  const dotColor = isDark ? 'bg-slate-400' : 'bg-slate-500';
  const dotLightColor = isDark ? 'bg-slate-300' : 'bg-slate-400';
  
  // Dots wave animation
  if (type === 'dots') {
    return (
      <div className="flex items-center justify-center">
        <style>{`
          .dot-wave {
            position: relative;
            ${currentDotSize};
            border-radius: 50%;
            ${dotColor};
            animation: dotWave 1.5s infinite linear alternate;
            animation-delay: 0.5s;
          }
          
          .dot-wave::before, .dot-wave::after {
            content: '';
            display: inline-block;
            position: absolute;
            top: 0;
            ${currentDotSize};
            border-radius: 50%;
            ${dotColor};
          }
          
          .dot-wave::before {
            left: -${size === 'sm' ? '8px' : size === 'lg' ? '16px' : '12px'};
            animation: dotWave 1.5s infinite alternate;
            animation-delay: 0s;
          }
          
          .dot-wave::after {
            left: ${size === 'sm' ? '8px' : size === 'lg' ? '16px' : '12px'};
            animation: dotWave 1.5s infinite alternate;
            animation-delay: 1s;
          }
          
          @keyframes dotWave {
            0% {
              ${dotColor};
              transform: translateY(0);
            }
            50% {
              ${dotLightColor};
              transform: translateY(-5px);
            }
            100% {
              ${dotColor};
              transform: translateY(0);
            }
          }
        `}</style>
        <div className="dot-wave"></div>
      </div>
    );
  }
  
  // Spinner animation
  if (type === 'spinner') {
    return (
      <div className={`${currentSize} rounded-full border-4 border-dashed ${
        isDark ? 'border-slate-600' : 'border-slate-300'
      } animate-spin`}></div>
    );
  }
  
  // Pulse animation
  if (type === 'pulse') {
    return (
      <div className={`${currentSize} rounded-full ${
        isDark ? 'bg-slate-600' : 'bg-slate-300'
      } animate-pulse`}></div>
    );
  }
  
  // Default to dots if type is not recognized
  return (
    <div className="flex items-center justify-center">
      <style>{`
        .dot-wave {
          position: relative;
          ${currentDotSize};
          border-radius: 50%;
          ${dotColor};
          animation: dotWave 1.5s infinite linear alternate;
          animation-delay: 0.5s;
        }
        
        .dot-wave::before, .dot-wave::after {
          content: '';
          display: inline-block;
          position: absolute;
          top: 0;
          ${currentDotSize};
          border-radius: 50%;
          ${dotColor};
        }
        
        .dot-wave::before {
          left: -${size === 'sm' ? '8px' : size === 'lg' ? '16px' : '12px'};
          animation: dotWave 1.5s infinite alternate;
          animation-delay: 0s;
        }
        
        .dot-wave::after {
          left: ${size === 'sm' ? '8px' : size === 'lg' ? '16px' : '12px'};
          animation: dotWave 1.5s infinite alternate;
          animation-delay: 1s;
        }
        
        @keyframes dotWave {
          0% {
            ${dotColor};
            transform: translateY(0);
          }
          50% {
            ${dotLightColor};
            transform: translateY(-5px);
          }
          100% {
            ${dotColor};
            transform: translateY(0);
          }
        }
      `}</style>
      <div className="dot-wave"></div>
    </div>
  );
};

export default LoadingAnimation;