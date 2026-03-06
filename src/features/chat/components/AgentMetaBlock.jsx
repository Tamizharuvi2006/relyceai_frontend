import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Activity, CheckCircle2, CircleDashed, AlertCircle, BrainCircuit, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownComponents = {
  h3: ({ node, ...props }) => <h3 className="text-[11px] font-medium tracking-wider mb-2 text-zinc-300 uppercase" {...props} />,
  p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
  ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-3 space-y-1" {...props} />,
  li: ({ node, ...props }) => <li className="marker:text-zinc-600" {...props} />,
};

const StateBadge = ({ type, children }) => {
  let colorClass = "border-white/10 text-zinc-400 bg-white/5";
  if (type === "green") colorClass = "border-emerald-500/30 text-emerald-400 bg-emerald-500/10";
  if (type === "yellow") colorClass = "border-amber-500/30 text-amber-400 bg-amber-500/10";
  if (type === "orange") colorClass = "border-orange-500/30 text-orange-400 bg-orange-500/10";
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase border ${colorClass}`}>
      {children}
    </span>
  );
};

// Simplified timeline status mapping based on logs
const ExecutionStepper = ({ logs }) => {
  if (!logs || logs.length === 0) return null;

  return (
    <div className="mt-4 px-1 py-1">
      <div className="relative pl-8 space-y-6">
        {/* Continuous vertical line */}
        <div className="absolute left-[14px] top-2 bottom-2 w-px bg-gradient-to-b from-cyan-500/50 via-white/10 to-zinc-800/20" />
        
        {logs.map((log, i) => {
          const lowerLog = log.toLowerCase();
          const isFinalizing = lowerLog.includes("completed") || lowerLog.includes("finalizing");
          const isError = lowerLog.includes("failed") || lowerLog.includes("error");
          const isTool = lowerLog.includes("[using_tool]") || lowerLog.includes("tool");
          const isPlanning = lowerLog.includes("[planning]") || lowerLog.includes("plan");
          const isRunning = i === logs.length - 1 && !isFinalizing && !isError;
          
          // Clean the log text for display
          let cleanText = log.replace(/^\[(.*?)\]\s*/, '').trim();
          if (isTool && !cleanText) {
            cleanText = 'Invoking internal tool...';
          }

          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative flex flex-col gap-1"
            >
              {/* Stepper Dot */}
              <div className="absolute -left-[25px] top-1 w-[18px] h-[18px] rounded-full bg-[#0a0d14] border border-white/10 flex items-center justify-center z-10 transition-shadow duration-500">
                {isFinalizing ? (
                  <CheckCircle2 size={12} className="text-emerald-400" />
                ) : isError ? (
                  <AlertCircle size={12} className="text-orange-500" />
                ) : isRunning ? (
                  <div className="relative flex items-center justify-center">
                    <motion.div 
                       animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.7, 0.3] }}
                       transition={{ repeat: Infinity, duration: 2 }}
                       className="absolute w-4 h-4 rounded-full bg-cyan-500/20"
                    />
                    <Activity size={10} className="text-cyan-400" />
                  </div>
                ) : isTool ? (
                  <CircleDashed size={10} className="text-indigo-400 animate-spin-slow" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                )}
              </div>

              {/* Step Header */}
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-mono tracking-widest uppercase ${
                  isFinalizing ? 'text-emerald-400/70' : 
                  isError ? 'text-orange-400/70' : 
                  isRunning ? 'text-cyan-400' : 'text-zinc-500'
                }`}>
                  {isPlanning ? "Planning" : isTool ? "Action" : isFinalizing ? "Success" : "Reasoning"}
                </span>
                {isRunning && (
                  <span className="flex gap-1 items-center">
                    <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse [animation-delay:200ms]" />
                    <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse [animation-delay:400ms]" />
                  </span>
                )}
              </div>

              {/* Step Content */}
              <div className={`text-[13px] tracking-tight leading-relaxed ${
                isFinalizing ? 'text-zinc-400' : 
                isError ? 'text-orange-200/80' : 
                isRunning ? 'text-white font-normal' : 'text-zinc-500'
              }`}>
                {isTool ? (
                  <span className="inline-flex items-center gap-2 bg-indigo-500/5 border border-indigo-500/20 px-2 py-0.5 rounded text-indigo-300 font-mono text-[11px] shadow-sm">
                    {cleanText}
                  </span>
                ) : cleanText}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const AgentMetaBlock = ({ meta, logs, thinkingContent, thinkingDurationMs, isStreaming }) => {
  const [isProcessOpen, setIsProcessOpen] = useState(false);
  
  if (!meta?.agent_state && (!logs || logs.length === 0) && !thinkingContent) return null;

  // Find latest topic for compact header
  const latestLog = logs && logs.length > 0 ? logs[logs.length - 1] : "Thinking...";
  const compactTitle = latestLog.replace(/^\[(.*?)\]\s*/, '').trim() || "Interpreting Request";

  const strategy = meta?.strategy_mode || "DEFAULT_MODE";
  const confidence = meta?.confidence_metrics?.confidence || meta?.confidence || 0.95;
  const isHybrid = strategy !== "DEFAULT_MODE" && strategy !== undefined;

  let confidenceBadge = null;
  if (meta?.confidence_metrics) {
      const metrics = meta.confidence_metrics;
      if (metrics.forced_finalize || metrics.loop_break || metrics.tool_failures > 1) {
          confidenceBadge = <StateBadge type="orange">🔴 Limited Confidence</StateBadge>;
      } else if (metrics.tool_failures === 1) {
          confidenceBadge = <StateBadge type="yellow">🟡 Partial Confidence</StateBadge>;
      } else {
          confidenceBadge = <StateBadge type="green">🟢 Reliable</StateBadge>;
      }
  }

  return (
    <div className="mb-4 group/thinking relative z-30">
        {/* Compact Top-Level Toggle */}
        <button 
          onClick={() => setIsProcessOpen(!isProcessOpen)}
          className="flex items-center gap-2 px-1 py-1 hover:bg-white/5 rounded-lg transition-all group/btn"
        >
          <div className="flex items-center gap-3">
             <div className="relative">
                <Sparkles size={14} className="text-blue-400 group-hover/btn:text-blue-300 transition-colors" />
                {isStreaming && (
                   <motion.div 
                    animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-blue-400/30 blur-sm rounded-full"
                   />
                )}
             </div>
             <span className="text-[14px] font-medium text-zinc-300 group-hover/btn:text-white transition-colors">
               {compactTitle}
             </span>
             {!isStreaming && thinkingDurationMs > 0 && (
               <span className="text-[11px] text-zinc-500 font-light ml-2 italic">
                 Thought for {(thinkingDurationMs / 1000).toFixed(1)}s
               </span>
             )}
          </div>
          <motion.div
            animate={{ rotate: isProcessOpen ? 180 : 0 }}
            className="text-zinc-500 group-hover/btn:text-white transition-colors ml-1"
          >
            <ChevronDown size={14} />
          </motion.div>
        </button>

        <AnimatePresence>
          {isProcessOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -10 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -10 }}
              className="overflow-hidden mt-3"
            >
              <div className="p-6 border border-white/10 bg-[#0a0d14]/90 backdrop-blur-2xl rounded-2xl shadow-2xl relative">
                {/* Internal Card Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <BrainCircuit size={16} className="text-emerald-400" />
                    <span className="text-[12px] font-mono tracking-widest uppercase text-zinc-400">
                      Cognitive Engine Details
                    </span>
                  </div>
                  {confidenceBadge}
                </div>

                <div className="space-y-8">
                    {/* Execution Timeline Integration */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                         <span className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase">Process Execution</span>
                         <span className="text-[10px] font-mono text-zinc-600 tracking-wider font-light italic">{logs.length} operations</span>
                      </div>
                      <ExecutionStepper logs={logs} />
                    </div>

                    {/* Strategic Roadmap (Plan) */}
                    {meta?.plan && Array.isArray(meta.plan) && meta.plan.length > 0 && (
                      <div className="pt-6 border-t border-white/5">
                        <div className="flex items-center justify-between mb-4 px-1">
                           <span className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase">Strategic Roadmap</span>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {meta.plan.map((step, idx) => (
                            <div key={idx} className="flex gap-4 group/step">
                              <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-[10px] font-mono text-emerald-400/40 group-hover/step:text-emerald-400 transition-colors">
                                {idx + 1}
                              </div>
                              <span className="text-[13px] text-zinc-400 font-light leading-snug group-hover/step:text-zinc-200 transition-colors">
                                {step}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cognitive Insight (Thinking Process) */}
                    {thinkingContent && thinkingContent.trim().length > 0 && (
                      <div className="pt-6 border-t border-white/5">
                         <div className="flex items-center justify-between mb-4 px-1">
                           <span className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase">Cognitive Insight</span>
                        </div>
                        <div className="prose prose-sm prose-invert max-w-none text-zinc-500 font-light text-[12px] leading-relaxed">
                           <ReactMarkdown components={MarkdownComponents} remarkPlugins={[remarkGfm]}>
                             {thinkingContent}
                           </ReactMarkdown>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
};

// Re-using MessageComponent.jsx's MarkdownComponents logic locally or importing it would be ideal.
// For now, assuming MarkdownComponents and ReactMarkdown are available in the scope or passed.
// Actually, I'll use a simplified list if ReactMarkdown isn't imported here.
// But wait, AgentMetaBlock is in the same directory. I should make sure it has what it needs.
export default AgentMetaBlock;
