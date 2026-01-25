import React from 'react';
import TokenVisualization from './TokenVisualization';

const TokenDisplay = ({ tokenData, theme, userRole }) => {
  if (!tokenData) return null;

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-2">
      <TokenVisualization tokenData={tokenData} theme={theme} userRole={userRole} />
    </div>
  );
};

export default TokenDisplay;