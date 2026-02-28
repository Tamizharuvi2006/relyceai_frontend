import React from 'react';

/**
 * All CSS styles for the auth page animations
 */
export function AuthStyles() {
    return (
        <style dangerouslySetInnerHTML={{
            __html: `
      @keyframes fade-in-down {
        0% {
          opacity: 0;
          transform: translateY(-20px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .animate-fade-in-down {
        animation: fade-in-down 0.5s ease-out forwards;
      }
      
      /* Cloud-like morphing animations */
      @keyframes cloudMorphIn {
        0% {
          opacity: 0;
          transform: scale(1.1) translateX(30px);
          filter: blur(10px);
        }
        50% {
          filter: blur(5px);
        }
        100% {
          opacity: 1;
          transform: scale(1) translateX(0);
          filter: blur(0);
        }
      }
      
      @keyframes cloudMorphOut {
        0% {
          opacity: 1;
          transform: scale(1) translateX(0);
          filter: blur(0);
        }
        50% {
          filter: blur(5px);
        }
        100% {
          opacity: 0;
          transform: scale(0.9) translateX(-30px);
          filter: blur(10px);
        }
      }
      
      /* Premium cover-up slide effect */
      @keyframes coverSlideLeft {
        0% {
          transform: translateX(100%);
          opacity: 0.8;
        }
        30% {
          opacity: 1;
        }
        100% {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes coverSlideRight {
        0% {
          transform: translateX(-100%);
          opacity: 0.8;
        }
        30% {
          opacity: 1;
        }
        100% {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes floatParticles {
        0%, 100% {
          transform: translateY(0) rotate(0deg);
          opacity: 0.3;
        }
        50% {
          transform: translateY(-20px) rotate(180deg);
          opacity: 0.6;
        }
      }
      
      @keyframes shimmer {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }
      
      @keyframes glowPulse {
        0%, 100% {
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.2), inset 0 0 20px rgba(16, 185, 129, 0.05);
        }
        50% {
          box-shadow: 0 0 40px rgba(16, 185, 129, 0.4), inset 0 0 30px rgba(16, 185, 129, 0.1);
        }
      }
      
      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.05);
          opacity: 0.8;
        }
      }
      
      .animate-pulse-slow {
        animation: pulse 2s ease-in-out infinite;
      }
      
      /* Mobile form animations */
      @keyframes mobileFormIn {
        0% {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
          filter: blur(5px);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }
      }
      
      @keyframes mobileFormOut {
        0% {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }
        100% {
          opacity: 0;
          transform: translateY(-20px) scale(0.95);
          filter: blur(5px);
        }
      }
      
      .panel-active {
        opacity: 1;
        display: flex;
        transform: scale(1) translateY(0);
        filter: blur(0);
        z-index: 2;
        transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), 
                    transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), 
                    filter 0.3s ease;
      }
      
      .panel-inactive {
        opacity: 0;
        display: none;
        transform: scale(0.95) translateY(5px);
        filter: blur(4px);
        pointer-events: none;
        z-index: 1;
      }
      
      .overlay-container {
        transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1), 
                    right 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .overlay-panel {
        overflow: hidden;
      }
      
      .overlay-panel::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(ellipse at center, rgba(16, 185, 129, 0.15) 0%, transparent 70%);
        animation: floatParticles 6s ease-in-out infinite;
        pointer-events: none;
      }
      
      .overlay-panel::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        animation: shimmer 2s ease-in-out infinite;
        pointer-events: none;
      }
      
      .shimmer-border {
        position: relative;
      }
      
      .shimmer-border::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.3), transparent);
        background-size: 200% 100%;
        animation: shimmer 3s linear infinite;
        pointer-events: none;
        opacity: 0.5;
      }
      
      .form-panel {
        transition: opacity 0.5s ease, visibility 0.5s ease, transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), filter 0.5s ease;
      }
      
      .form-panel.active {
        opacity: 1;
        visibility: visible;
        transform: translateX(0) scale(1);
        filter: blur(0);
      }
      
      .form-panel.inactive {
        opacity: 0;
        visibility: hidden;
        transform: translateX(-20px) scale(0.95);
        filter: blur(8px);
        pointer-events: none;
      }
      
      /* Mobile animations */
      .mobile-form-enter {
        animation: mobileFormIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }
      
      .mobile-tab-container {
        position: relative;
        background: rgba(39, 39, 42, 0.5);
        border-radius: 0.5rem;
        padding: 4px;
      }
      
      .mobile-tab-indicator {
        position: absolute;
        top: 4px;
        bottom: 4px;
        width: calc(50% - 4px);
        background: #ffffff;
        border-radius: 2px;
        transition: transform 0.5s cubic-bezier(0.68, -0.15, 0.32, 1.15);
      }
      
      .mobile-tab-indicator.right {
        transform: translateX(calc(100% + 8px));
      }
      
      .mobile-tab-btn {
        position: relative;
        z-index: 1;
        flex: 1;
        padding: 0.75rem;
        transition: color 0.3s ease;
      }
      
      .mobile-tab-btn.active {
        color: black;
      }
      
      .mobile-tab-btn.inactive {
        color: #a1a1aa;
      }
    `}} />
    );
}

export default AuthStyles;
