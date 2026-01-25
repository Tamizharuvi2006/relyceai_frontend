import React from 'react';

const TokenVisualization = ({ tokenData, theme, userRole }) => {
  if (!tokenData) return null;

  const { 
    input_tokens, 
    output_tokens, 
    input_limit, 
    output_limit, 
    input_percentage, 
    output_percentage,
    daily_tokens,
    daily_limit,
    daily_percentage,
    user_role // Get user role from tokenData
  } = tokenData;

  // Check if user is admin or superadmin - they have unlimited tokens
  // Use user_role from tokenData if available, otherwise use the prop
  const effectiveUserRole = user_role || userRole;
  const isUserAdminOrSuperadmin = effectiveUserRole === 'admin' || effectiveUserRole === 'superadmin';

  // Determine if limits are unlimited (0 means unlimited)
  const isInputUnlimited = isUserAdminOrSuperadmin || input_limit === 0;
  const isOutputUnlimited = isUserAdminOrSuperadmin || output_limit === 0;
  const isDailyUnlimited = isUserAdminOrSuperadmin || daily_limit === 0;

  // Calculate bar colors based on percentage
  const getInputBarColor = () => {
    if (isInputUnlimited) return 'bg-emerald-500';
    if (input_percentage > 90) return 'bg-red-500';
    if (input_percentage > 75) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const getOutputBarColor = () => {
    if (isOutputUnlimited) return 'bg-blue-500';
    if (output_percentage > 90) return 'bg-red-500';
    if (output_percentage > 75) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getDailyBarColor = () => {
    if (isDailyUnlimited) return 'bg-purple-500';
    if (daily_percentage > 90) return 'bg-red-500';
    if (daily_percentage > 75) return 'bg-yellow-500';
    return 'bg-purple-500';
  };

  return (
    <div className={`rounded-lg p-3 mb-4 text-xs ${
      theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'
    }`}>
      <div className="font-medium mb-2 text-center">Token Usage</div>
      
      {/* Daily Tokens (NEW) */}
      <div className="mb-2">
        <div className="flex justify-between mb-1">
          <span>Daily Tokens</span>
          <span>
            {isDailyUnlimited ? (
              <span>Unlimited</span>
            ) : (
              <span>{daily_tokens?.toLocaleString() || 0}/{daily_limit?.toLocaleString() || 0}</span>
            )}
          </span>
        </div>
        <div className={`w-full h-2 rounded-full ${
          theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-300'
        }`}>
          {isDailyUnlimited ? (
            <div className="h-2 rounded-full bg-purple-500 w-full"></div>
          ) : (
            <div 
              className={`h-2 rounded-full ${getDailyBarColor()}`} 
              style={{ width: `${Math.min(daily_percentage || 0, 100)}%` }}
            ></div>
          )}
        </div>
        {!isDailyUnlimited && (
          <div className="text-right text-xs mt-1">
            {Math.round(daily_percentage || 0)}% used
          </div>
        )}
      </div>
      
      {/* Input Tokens */}
      <div className="mb-2">
        <div className="flex justify-between mb-1">
          <span>Input Tokens</span>
          <span>
            {isInputUnlimited ? (
              <span>Unlimited</span>
            ) : (
              <span>{input_tokens?.toLocaleString() || 0}/{input_limit?.toLocaleString() || 0}</span>
            )}
          </span>
        </div>
        <div className={`w-full h-2 rounded-full ${
          theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-300'
        }`}>
          {isInputUnlimited ? (
            <div className="h-2 rounded-full bg-emerald-500 w-full"></div>
          ) : (
            <div 
              className={`h-2 rounded-full ${getInputBarColor()}`} 
              style={{ width: `${Math.min(input_percentage || 0, 100)}%` }}
            ></div>
          )}
        </div>
      </div>
      
      {/* Output Tokens */}
      <div>
        <div className="flex justify-between mb-1">
          <span>Output Tokens</span>
          <span>
            {isOutputUnlimited ? (
              <span>Unlimited</span>
            ) : (
              <span>{output_tokens?.toLocaleString() || 0}/{output_limit?.toLocaleString() || 0}</span>
            )}
          </span>
        </div>
        <div className={`w-full h-2 rounded-full ${
          theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-300'
        }`}>
          {isOutputUnlimited ? (
            <div className="h-2 rounded-full bg-blue-500 w-full"></div>
          ) : (
            <div 
              className={`h-2 rounded-full ${getOutputBarColor()}`} 
              style={{ width: `${Math.min(output_percentage || 0, 100)}%` }}
            ></div>
          )}
        </div>
        {!isOutputUnlimited && (
          <div className="text-right text-xs mt-1">
            {Math.round(output_percentage || 0)}% used
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenVisualization;