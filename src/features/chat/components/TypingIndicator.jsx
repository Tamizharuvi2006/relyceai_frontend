// components/TypingIndicator.jsx
import React from 'react';

/**
 * Typing indicator component for showing bot is typing
 * @param {Object} props - Component props
 * @returns {JSX.Element} Typing indicator component
 */
const TypingIndicator = ({ theme }) => (
  <div className="flex items-center">
    <div className="relative">
      {/* Wave animation circles */}
      <div className="absolute inset-0">
        <div className={`absolute inset-0 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} animate-ping opacity-75`}></div>
        <div className={`absolute inset-0 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} animate-ping opacity-50`} style={{ animationDelay: '0.5s', animationDuration: '1.5s' }}></div>
        <div className={`absolute inset-0 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} animate-ping opacity-25`} style={{ animationDelay: '1s', animationDuration: '1.5s' }}></div>
      </div>
      
      {/* "R" letter with better styling */}
      <div className={`relative w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
        theme === 'dark' ? 'bg-gradient-to-br from-blue-600 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-purple-500'
      }`}>
        R
      </div>
    </div>
  </div>
);

export default TypingIndicator;