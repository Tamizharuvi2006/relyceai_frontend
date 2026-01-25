import React from 'react';
import { LogIn } from 'lucide-react';

const SignInPrompt = ({ theme, onSignIn }) => {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <LogIn size={48} className="mx-auto text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
          Sign in required
        </h2>
        <p className="mb-6 text-slate-600 dark:text-slate-400">
          Please sign in to access the chat
        </p>
        <button
          onClick={() => window.location.href = '/login'}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};

export default SignInPrompt;