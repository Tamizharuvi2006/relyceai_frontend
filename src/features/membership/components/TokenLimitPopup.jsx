import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const TokenLimitPopup = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [popupData, setPopupData] = useState({ type: '', message: '' });
  const [outputLimitData, setOutputLimitData] = useState({ used: 0, limit: 0 });

  useEffect(() => {
    // Listen for token limit exceeded events
    const handleTokenLimitExceeded = (event) => {
      setPopupData(event.detail);
      setIsVisible(true);
    };

    // Listen for output limit exceeded events
    const handleOutputLimitExceeded = (event) => {
      setOutputLimitData(event.detail);
      setIsVisible(true);
    };

    window.addEventListener('tokenLimitExceeded', handleTokenLimitExceeded);
    window.addEventListener('outputLimitExceeded', handleOutputLimitExceeded);

    return () => {
      window.removeEventListener('tokenLimitExceeded', handleTokenLimitExceeded);
      window.removeEventListener('outputLimitExceeded', handleOutputLimitExceeded);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleNewChat = () => {
    // Navigate to a new chat
    navigate('/chat');
    setIsVisible(false);
  };

  const handleUpgrade = () => {
    // Navigate to membership page
    navigate('/membership');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`rounded-xl p-6 max-w-md w-full shadow-2xl transform transition-all duration-300 ${theme === 'dark'
          ? 'bg-zinc-800 border border-zinc-700'
          : 'bg-white border border-gray-200'
        }`}>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
            {popupData.type === 'daily' ? 'Daily Token Limit Exceeded' : 'Chat Output Limit Reached'}
          </h3>

          <div className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
            {popupData.type === 'daily' ? (
              <p>
                You have used {popupData.message?.match(/used ([\d,]+)/)?.[1] || '0'} of your daily token limit.
                Please upgrade your plan or wait until midnight (UTC) to reset your daily limit.
              </p>
            ) : (
              <p>
                You have reached the output token limit for this chat ({outputLimitData.used?.toLocaleString() || 0} / {outputLimitData.limit?.toLocaleString() || 0} tokens).
                To continue chatting, please start a new conversation.
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            {popupData.type === 'daily' ? (
              <>
                <button
                  type="button"
                  onClick={handleUpgrade}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                >
                  Upgrade Plan
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors ${theme === 'dark'
                      ? 'bg-zinc-700 text-white hover:bg-zinc-600'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleNewChat}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                >
                  Start New Chat
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors ${theme === 'dark'
                      ? 'bg-zinc-700 text-white hover:bg-zinc-600'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenLimitPopup;