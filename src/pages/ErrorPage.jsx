import React from 'react';
import { useNavigate, useRouteError } from 'react-router-dom';
import { AlertTriangle, Home, LogIn, ArrowLeft } from 'lucide-react';

const ErrorPage = ({ 
  title = "Something went wrong", 
  message = "Please try again in a moment.",
  showLoginButton = true,
  showHomeButton = true,
  showBackButton = false
}) => {
  const navigate = useNavigate();
  const error = useRouteError();
  const status = error?.status;
  const isNotFound = status === 404 || title === "Page Not Found";
  
  // Do not surface raw route errors to the UI.
  const displayTitle = isNotFound ? "Page Not Found" : title;
  const displayMessage = message;
  const displayCode = typeof status === 'number' ? status : (isNotFound ? 404 : 500);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        
        {/* Error Icon */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
        </div>

        {/* Error Content */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">
            {displayTitle}
          </h1>
          
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-zinc-700 dark:text-zinc-300 text-sm text-left">
                {displayMessage}
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
            <p>Please check the URL or navigate back to a valid page.</p>
            <p>If you believe this is an error, please contact support.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {showBackButton && (
            <button
              onClick={() => navigate(-1)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          )}
          
          {showHomeButton && (
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
            >
              <Home className="w-4 h-4" />
              Return Home
            </button>
          )}
          
          {showLoginButton && (
            <button
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg font-medium transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          )}
        </div>

        {/* Error Code */}
        <div className="mt-8 text-xs text-zinc-500 dark:text-zinc-600">
          Error Code: {displayCode} | {displayTitle}
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
