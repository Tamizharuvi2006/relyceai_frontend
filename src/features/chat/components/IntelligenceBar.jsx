// components/IntelligenceBar.jsx
// Visible intelligence layer — shows users what the AI is doing
import React, { useState, useEffect, memo } from 'react';
import {
  Zap, Brain, Target, Shield, Search, Code2, BookOpen,
  MessageSquare, Wrench, Lightbulb, TrendingUp, ChevronDown,
  Sparkles, AlertTriangle, CheckCircle2, HelpCircle, X
} from 'lucide-react';

// ── Mode Config ──────────────────────────────────────────────
const MODE_CONFIG = {
  debugging:      { icon: Wrench,        label: 'Debug Mode',       color: 'from-red-500 to-orange-500',     text: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     glow: 'shadow-red-500/20' },
  coding:         { icon: Code2,         label: 'Code Mode',        color: 'from-blue-500 to-cyan-500',      text: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    glow: 'shadow-blue-500/20' },
  analysis:       { icon: Brain,         label: 'Deep Analysis',    color: 'from-purple-500 to-violet-500',  text: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  glow: 'shadow-purple-500/20' },
  research:       { icon: Search,        label: 'Research Mode',    color: 'from-emerald-500 to-teal-500',   text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/20' },
  reasoning:      { icon: Lightbulb,     label: 'Deep Thinking',    color: 'from-amber-500 to-yellow-500',   text: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   glow: 'shadow-amber-500/20' },
  creative:       { icon: Sparkles,      label: 'Creative Mode',    color: 'from-pink-500 to-rose-500',      text: 'text-pink-400',    bg: 'bg-pink-500/10',    border: 'border-pink-500/20',    glow: 'shadow-pink-500/20' },
  system_design:  { icon: Target,        label: 'Architecture',     color: 'from-indigo-500 to-blue-500',    text: 'text-indigo-400',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20',  glow: 'shadow-indigo-500/20' },
  education:      { icon: BookOpen,      label: 'Learning Mode',    color: 'from-green-500 to-emerald-500',  text: 'text-green-400',   bg: 'bg-green-500/10',   border: 'border-green-500/20',   glow: 'shadow-green-500/20' },
  general:        { icon: MessageSquare, label: 'Assistant',        color: 'from-zinc-500 to-zinc-400',      text: 'text-zinc-400',    bg: 'bg-zinc-500/10',    border: 'border-zinc-500/20',    glow: 'shadow-zinc-500/10' },
};

const PERSONALIZATION_LABELS = {
  'code-first':    'Code-first approach',
  'concise':       'Concise answers',
  'step-by-step':  'Step-by-step',
  'examples':      'With examples',
};

// ── Confidence Badge ─────────────────────────────────────────
const ConfidenceBadge = memo(({ confidence }) => {
  if (confidence >= 0.75) {
    return (
      <div className="flex items-center gap-1 text-[10px] text-emerald-400/70">
        <CheckCircle2 size={10} className="text-emerald-500" />
        <span>High confidence</span>
      </div>
    );
  }
  if (confidence >= 0.45) {
    return (
      <div className="flex items-center gap-1 text-[10px] text-amber-400/70">
        <AlertTriangle size={10} className="text-amber-500" />
        <span>Medium confidence</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 text-[10px] text-red-400/70">
      <HelpCircle size={10} className="text-red-400" />
      <span>Low confidence — verify this</span>
    </div>
  );
});

// ── Debug Mode Banner ────────────────────────────────────────
const DebugBanner = memo(() => {
  const steps = ['Understand', 'Hypothesize', 'Diagnose', 'Fix', 'Prevent'];
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-red-950/40 to-orange-950/30 border border-red-500/20">
      <Wrench size={12} className="text-red-400 animate-pulse" />
      <div className="flex items-center gap-1.5">
        {steps.map((step, i) => (
          <React.Fragment key={step}>
            <span className={`text-[10px] font-medium transition-all duration-500 ${
              i <= activeStep ? 'text-red-300' : 'text-zinc-600'
            }`}>
              {step}
            </span>
            {i < steps.length - 1 && (
              <span className={`text-[8px] transition-colors duration-500 ${
                i < activeStep ? 'text-red-500' : 'text-zinc-700'
              }`}>→</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
});

// ── Proactive Help Card ──────────────────────────────────────
const ProactiveHelp = memo(({ onDismiss }) => (
  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-950/30 to-yellow-950/20 border border-amber-500/20 animate-slideDown">
    <Lightbulb size={12} className="text-amber-400 flex-shrink-0" />
    <span className="text-[11px] text-amber-200/80">
      This seems complex. I'm breaking it down step-by-step for clarity.
    </span>
    {onDismiss && (
      <button onClick={onDismiss} className="ml-auto text-amber-500/40 hover:text-amber-400 transition-colors">
        <X size={10} />
      </button>
    )}
  </div>
));

// ── Personalization Tags ─────────────────────────────────────
const PersonalizationTags = memo(({ tags }) => {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="flex items-center gap-1 text-[10px] text-zinc-500">
      <TrendingUp size={9} className="text-emerald-600" />
      <span>
        {tags.map(t => PERSONALIZATION_LABELS[t] || t).join(' · ')}
        <span className="text-zinc-600 ml-1">(learned)</span>
      </span>
    </div>
  );
});

// ── Main IntelligenceBar ─────────────────────────────────────
const IntelligenceBar = memo(({ intelligence, isStreaming }) => {
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (intelligence) {
      // Slight delay for smooth entrance animation
      const timer = setTimeout(() => setVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [intelligence]);

  if (!intelligence) return null;

  const {
    mode = 'general',
    debug_active = false,
    confidence = 1.0,
    skill_level = 0.5,
    personalization = [],
    proactive_help = false
  } = intelligence;

  // Don't show for simple "general" assistant mode with high confidence
  const isSimple = mode === 'general' && confidence >= 0.9 && !debug_active && !proactive_help && personalization.length === 0;
  if (isSimple) return null;

  const modeConfig = MODE_CONFIG[mode] || MODE_CONFIG.general;
  const ModeIcon = modeConfig.icon;

  return (
    <div className={`mb-3 space-y-1.5 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
      {/* Mode + Confidence Row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Mode Pill */}
        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 border ${modeConfig.border} text-[10px] font-mono tracking-widest uppercase ${modeConfig.bg} ${modeConfig.text}`}>
          <ModeIcon size={10} />
          <span>{modeConfig.label}</span>
        </div>

        {/* Confidence */}
        <ConfidenceBadge confidence={confidence} />

        {/* Skill Level Dot */}
        {skill_level > 0.7 && (
          <div className="flex items-center gap-1 text-[10px] text-indigo-400/60">
            <Target size={9} />
            <span>Expert</span>
          </div>
        )}
        {skill_level < 0.3 && (
          <div className="flex items-center gap-1 text-[10px] text-green-400/60">
            <BookOpen size={9} />
            <span>Beginner-friendly</span>
          </div>
        )}
      </div>

      {/* Debug Banner */}
      {debug_active && <DebugBanner />}

      {/* Proactive Help */}
      {proactive_help && !dismissed && (
        <ProactiveHelp onDismiss={() => setDismissed(true)} />
      )}

      {/* Personalization Tags */}
      <PersonalizationTags tags={personalization} />
    </div>
  );
});

export default IntelligenceBar;
