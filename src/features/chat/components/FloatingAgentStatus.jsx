import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Cpu } from 'lucide-react';

export const FloatingAgentStatus = ({ messages, isTyping }) => {
  const activeMsg = messages?.length > 0 ? messages.find(m => m.isStreaming) : null;
  const meta = activeMsg?.agentMeta;

  const isIdle = !isTyping || !meta;
  const isCompleted = meta?.completed || false;

  if (isIdle || isCompleted) return null;

  const stateMap = {
    planning: "Planning Strategy",
    researching: "Researching",
    searching_web: "Searching the web",
    using_tool: `Running${meta?.tool ? `: ${meta.tool}` : ''}`,
    awaiting_confirmation: "Awaiting Review",
    repairing: "Repairing",
    rolling_back: "Rolling Back",
    finalizing: "Finalizing"
  };

  const currentState = stateMap[meta?.agent_state] || "Processing...";
  const isWarning =
    meta?.agent_state === "repairing" ||
    meta?.agent_state === "rolling_back" ||
    meta?.agent_state === "awaiting_confirmation";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed bottom-32 right-6 z-50 flex items-center gap-3 bg-[#0a0d14] border border-white/[0.08] px-4 py-2.5 rounded-lg shadow-lg"
      >
        <div className={`w-2 h-2 rounded-full ${isWarning ? 'bg-amber-500/80' : 'bg-emerald-500/60'}`}>
          <div className={`w-2 h-2 rounded-full animate-ping ${isWarning ? 'bg-amber-500/40' : 'bg-emerald-500/30'}`} />
        </div>

        <div className="flex flex-col">
          <span className={`text-[12px] font-light tracking-wide ${isWarning ? 'text-amber-400/90' : 'text-zinc-400'}`}>
            {currentState}
          </span>
        </div>

        <div className={`${isWarning ? 'text-amber-500/50' : 'text-white/20'}`}>
          {isWarning ? <ShieldAlert size={13} /> : <Cpu size={13} />}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
