import React from 'react';
// No need for logo import since we use the public folder

/**
 * Premium typing indicator — emerald breathing orb with Relyce logo + dot pulse
 */
const TypingIndicator = () => (
  <div className="flex items-center gap-3 py-1">
    {/* Emerald Orb */}
    <div className="relative flex-shrink-0">
      {/* Outer pulse ring */}
      <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" style={{ animationDuration: '2s' }} />
      {/* Inner orb */}
      <div className="relative w-8 h-8 rounded-full bg-[#0a0d14] border border-emerald-500/25 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.15)]">
        <img src="/logo.svg" alt="Relyce" className="w-4 h-4 opacity-70" style={{ filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.5))' }} />
      </div>
    </div>

    {/* Dot animation */}
    <div className="flex items-center gap-1">
      <span className="typing-dot" />
      <span className="typing-dot typing-dot-2" />
      <span className="typing-dot typing-dot-3" />
    </div>
  </div>
);

export default TypingIndicator;