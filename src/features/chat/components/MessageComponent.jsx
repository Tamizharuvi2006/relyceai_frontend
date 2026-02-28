import React, { useState, useEffect, useRef, useMemo, memo, forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Download, Image, FileText, Globe, ExternalLink, Search, Sparkles, BrainCircuit, ChevronDown, ChevronUp } from 'lucide-react';
import { getFileIcon, formatFileSize } from '../../../utils/chatHelpers';
import IntelligenceBar from './IntelligenceBar';
import './MessageComponent.css';

const THINKING_START = "[THINKING]";
const THINKING_END = "[/THINKING]";

const parseThinkingContent = (content) => {
  if (!content) return { thinkingContent: "", displayContent: "" };

  const thinkingParts = [];
  const displayParts = [];
  let cursor = 0;

  while (cursor < content.length) {
    const start = content.indexOf(THINKING_START, cursor);
    if (start === -1) {
      displayParts.push(content.slice(cursor));
      break;
    }

    displayParts.push(content.slice(cursor, start));
    const end = content.indexOf(THINKING_END, start + THINKING_START.length);
    if (end === -1) {
      thinkingParts.push(content.slice(start + THINKING_START.length));
      cursor = content.length;
      break;
    }

    thinkingParts.push(content.slice(start + THINKING_START.length, end));
    cursor = end + THINKING_END.length;
  }

  return {
    thinkingContent: thinkingParts.join("\n").trim(),
    displayContent: displayParts.join("").trim()
  };
};

const normalizeThinkingContent = (text) => {
  if (!text) return "";
  let cleaned = text.replace(/\r\n/g, "\n");
  cleaned = cleaned.replace(/\[\/?THINKING\]/gi, "");
  cleaned = cleaned.replace(/^(Thinking Process:|Thinking:|Reasoning:)\s*/i, "");

  cleaned = cleaned.replace(/\b(\w+):\s*\1:/gi, "$1:");
  cleaned = cleaned.replace(/\b([A-Z][a-z]+)\s+\1\b/g, "$1");
  cleaned = cleaned.replace(/^(\w+)\s+\1:/gim, "$1:");
  cleaned = cleaned.replace(/(\w+\s+\w+):\s*\1:/gi, "$1:");
  cleaned = cleaned.replace(/\b([a-zA-Z]{3,})([a-z]{3,})\2\b/g, "$1$2");
  cleaned = cleaned.replace(/\b([A-Za-z]{2,})\1\b/g, "$1");
  cleaned = cleaned.replace(/\b([A-Za-z]{2,})\b([,:;!?])\s*\1\b/gi, "$1$2");
  cleaned = cleaned.replace(/\b([A-Za-z]{2,})\b(?:\s+\1\b)+/gi, "$1");
  cleaned = cleaned.replace(/\b([A-Za-z]+(?:'s|'re|'ve|'d|n't))\b(?:\s+\1\b)+/gi, "$1");
  cleaned = cleaned.replace(/'s\s*'s\b/gi, "'s");

  cleaned = cleaned.replace(/::+/g, ":");
  cleaned = cleaned.replace(/\.{2,}/g, ".");
  cleaned = cleaned.replace(/--+/g, "-");
  cleaned = cleaned.replace(/\s{2,}/g, " ");
  cleaned = cleaned.replace(/\b([A-Za-z]{2,}\s+[A-Za-z]{2,})\s+\1\b/gi, "$1");
  cleaned = cleaned.replace(/\*\*\s*\*\*/g, "");
  cleaned = cleaned.replace(/(\n|^)\s*\*\s*Option\s+(\d+)\s*(.*?):/gi, "$1- **Option $2$3:**");
  cleaned = cleaned.replace(/\*\*\s*:\s*\*\*/g, ":");

  const lines = cleaned.split("\n");
  const deduped = [];
  let lastLine = "";
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed === lastLine) continue;
    deduped.push(line);
    lastLine = trimmed;
  }

  return deduped.join("\n").trim();
};

const formatThinkingForDisplay = (text) => {
  if (!text) return text;
  let cleaned = text
    .replace(/\r\n/g, "\n")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*\*/g, "")
    .replace(/[â€¢]/g, "*")
    .replace(/\s*\*\s*\*\s*/g, "\n")
    .replace(/([^\n])\s*(\d+(?:\.\d+)*)(?:\.){1,}\s+/g, "$1\n$2. ")
    .replace(/\n{3,}/g, "\n\n");

  const normalizeSectionNumber = (value) => {
    const first = value.split(".")[0];
    if (/^(\d)\1+$/.test(first)) {
      return first[0];
    }
    return first;
  };

  const cleanTitle = (value) =>
    value
      .replace(/\*+/g, "")
      .replace(/[:\-]\s*$/, "")
      .replace(/\s{2,}/g, " ")
      .trim();

  const splitIntoItems = (value) => {
    if (!value) return [];
    let working = value;
    working = working.replace(
      /\s+(?=(?:Input|Context|Persona|Preferences|Intent|Tone|Constraints|Option|Safety|Final|Response|Strategy|Plan|Drafting|Refining)\b\s*:)/gi,
      "\n"
    );
    working = working.replace(/\s+(?=Option\s+\d+\b)/gi, "\n");
    working = working.replace(/\s+(?=Final Output Generation\b)/gi, "\n");
    working = working.replace(/\s+(?=Final Polish\b)/gi, "\n");
    working = working.replace(/\s+(?=Safety Check\b)/gi, "\n");
    working = working.replace(/\s+(?=Response Strategy\b)/gi, "\n");
    working = working.replace(/\s*\*\s*\*\s*/g, "\n");

    const chunks = working.split("\n");
    const items = [];
    for (const chunk of chunks) {
      if (!chunk) continue;
      let trimmed = chunk.trim();
      if (!trimmed) continue;
      trimmed = trimmed.replace(/^\s*[*â€¢-]\s*/, "");
      trimmed = trimmed.replace(/\s{2,}/g, " ");
      const subparts = trimmed
        .split(/\s+\*\s+/)
        .map((part) => part.trim())
        .filter(Boolean);
      if (subparts.length > 1) {
        items.push(...subparts);
      } else {
        items.push(trimmed);
      }
    }
    return items;
  };

  const lines = cleaned.split("\n");
  const output = [];
  let currentSection = null;
  let buffer = [];

  const flushSection = () => {
    if (!currentSection && buffer.length === 0) return;
    if (currentSection) {
      output.push(`### ${currentSection}`);
    }
    if (buffer.length > 0) {
      buffer.forEach((item) => output.push(`- ${item}`));
    }
    buffer = [];
  };

  const pushLine = (value) => {
    splitIntoItems(value).forEach((item) => {
      if (item) buffer.push(item);
    });
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const sectionMatch = line.match(/^\s*(\d+(?:\.\d+)*)(?:\.)+\s*(.+)$/);
    if (sectionMatch) {
      flushSection();
      const number = normalizeSectionNumber(sectionMatch[1]);
      const remainder = sectionMatch[2].trim();
      const parts = splitIntoItems(remainder);
      const titleRaw = parts.shift() || remainder;
      const title = cleanTitle(titleRaw);
      currentSection = title ? `${number}. ${title}` : `${number}.`;
      parts.forEach((item) => buffer.push(item));
      continue;
    }

    pushLine(line);
  }

  flushSection();
  return output.join("\n");
};

const cleanHeading = (value) => {
  if (!value) return "";
  return value
    .replace(/^[#*\s]+/, "")
    .replace(/\s+[*#:]+$/, "")
    .trim();
};

const extractCurrentHeading = (text) => {
  if (!text) return "";
  const isNoiseHeading = (value) =>
    /final output generation|safety check/i.test(value);
  const lines = text.split('\n');
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (/^#{1,6}\s+.+$/.test(line) || /^\d+\.\s+.+$/.test(line)) {
      const cleaned = cleanHeading(line.replace(/^\d+\.\s*/, ""));
      if (cleaned && cleaned.length < 60 && !isNoiseHeading(cleaned)) {
         return cleaned;
      }
    }
  }
  return "";
};

const ThinkingLoader = () => (
  <div className="flex items-center gap-4 py-3 min-h-[44px]">
    <div className="relative flex h-3 w-3 mt-1.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]"></span>
    </div>
    <span className="text-[13px] font-sans tracking-wide text-zinc-400 font-light animate-pulse mt-1">Analyzing request...</span>
  </div>
);

const ProcessingIndicator = ({ query, showSearch, holdFinalStep }) => (
  <div className="py-2">
    {showSearch ? (
      <div className="flex items-center gap-4 py-3 min-h-[44px]">
        <div className="relative flex h-3 w-3 mt-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-20"></span>
            <Search size={14} className="text-zinc-400 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <span className="text-[13px] font-sans tracking-wide text-zinc-400 font-light animate-pulse mt-1">Deep search active...</span>
      </div>
    ) : (
      <ThinkingLoader />
    )}
  </div>
);

const GeneratingIndicator = ({ query, holdFinalStep }) => (
  <ThinkingLoader />
);

const SourcesDisplay = ({ sources }) => (
  <div className="mb-4 pb-4 border-b border-white/5">
    <div className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-widest text-white/40 mb-3">
      <Globe size={10} />
      <span>REFERENCES ({sources.length})</span>
    </div>
    <div className="flex flex-wrap gap-2">
      {sources.slice(0, 5).map((source, idx) => {
        let domain = 'source';
        try {
          domain = new URL(source.link).hostname.replace('www.', '');
        } catch {}
        const sourceKey = source.link || source.title || `source-${idx}`;
        
        return (
          <a
            key={sourceKey}
            href={source.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 border border-white/10 text-[10px] uppercase tracking-wider font-mono text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            title={source.title}
          >
            <span className="truncate max-w-[120px]">{domain}</span>
            <ExternalLink size={10} className="opacity-50" />
          </a>
        );
      })}
    </div>
  </div>
);

const ThinkingDropdown = ({ formattedContent, currentHeading, isStreaming, hasAnswer }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUserToggled, setHasUserToggled] = useState(false);

  if (!formattedContent) return null;

  const showLiveHeading = Boolean(isStreaming && currentHeading);
  const showStaticHeading = Boolean(!isStreaming && currentHeading);

  useEffect(() => {
    if (hasAnswer && isOpen && !hasUserToggled) {
      setIsOpen(false);
    }
  }, [hasAnswer, isOpen, hasUserToggled]);

  return (
    <div className="thinking-dropdown-container">
      <button
        onClick={() => {
          setHasUserToggled(true);
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 py-2 text-[10px] font-mono tracking-widest text-white/40 hover:text-white w-full uppercase border-b border-transparent hover:border-white/20 transition-all text-left group"
      >
        {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        <Sparkles size={12} className={isOpen ? "text-white" : "opacity-40"} />
        <span>{isStreaming ? "PROCESSING" : "SHOW LOGS"}</span>
        
        {showLiveHeading && (
          <span className="text-white border-l border-white/20 pl-2 ml-2 tracking-normal truncate">
            {currentHeading}
          </span>
        )}
        {!showLiveHeading && showStaticHeading && (
          <span className="opacity-50 border-l border-white/10 pl-2 ml-2 tracking-normal truncate">
            {currentHeading}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="border border-white/5 bg-[#0a0d14]/50 backdrop-blur-md rounded-2xl p-5 mt-3 shadow-inner">
          <div className="prose prose-sm prose-invert max-w-none text-zinc-400 prose-p:leading-relaxed text-[13px] font-light">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {formattedContent}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

const isSafeUrl = (url) => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

const MessageComponent = memo(forwardRef(({ msg, index, theme, onCopyMessage, onContinue, continueMeta, isLastMessage, chatMode, thinkingVisibility = 'auto' }, ref) => {
  const [showCopyButton, setShowCopyButton] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);
  const [holdFinalStep, setHoldFinalStep] = useState(false);
  const [indicatorFade, setIndicatorFade] = useState(false);
  const [ghostSpace, setGhostSpace] = useState(false);
  const indicatorStartRef = useRef(0);
  const indicatorTimeoutRef = useRef(null);
  const holdTimeoutRef = useRef(null);
  const fadeTimeoutRef = useRef(null);
  const ghostTimeoutRef = useRef(null);

  const isGeneric = chatMode === 'normal' || !chatMode;

  const MarkdownComponents = {
    code({ _node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      const language = match ? match[1] : "text";

      const CodeBlockWithCopy = ({ code, language, isGenericMode }) => {
        const [copied, setCopied] = useState(false);

        const handleCopy = async () => {
          try {
            await navigator.clipboard.writeText(String(code).replace(/\n$/, ""));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch (err) {
            console.error('Failed to copy code: ', err);
          }
        };

        return (
          <div className="overflow-hidden my-6 border border-white/[0.05] bg-[#0a0d14] rounded-2xl shadow-xl group/code">
            <div className="flex items-center justify-between px-5 py-3 bg-[#030508]/80 backdrop-blur-sm border-b border-white/[0.02]">
              <span className="text-[11px] text-zinc-500 font-medium tracking-wider">
                {language || 'code'}
              </span>
              <button
                onClick={handleCopy}
                className="text-[11px] font-medium tracking-wide text-zinc-500 hover:text-white transition-colors flex items-center gap-1.5 opacity-0 group-hover/code:opacity-100"
              >
                {copied ? <span className="text-emerald-400">Copied</span> : <>Copy code</>}
              </button>
            </div>
            
            <div className="overflow-x-auto relative" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255, 255, 255, 0.1) transparent' }}>
              <SyntaxHighlighter
                style={atomDark}
                language={language === 'text' ? 'text' : language}
                PreTag="div"
                customStyle={{
                  margin: 0,
                  background: 'transparent',
                  padding: '1.25rem 1.5rem',
                  fontSize: '13px',
                  lineHeight: '1.7',
                  fontFamily: '"JetBrains Mono", source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace'
                }}
                {...props}
              >
                {String(code).replace(/\n$/, "")}
              </SyntaxHighlighter>
            </div>
          </div>
        );
      };

      const isBlock = !inline || String(children).includes('\n');
      return isBlock ? (
        <CodeBlockWithCopy code={children} language={language} isGenericMode={isGeneric} />
      ) : (
        <code className="bg-white/5 text-white/90 px-1.5 py-0.5 border border-white/10 text-sm font-mono" {...props}>
          {children}
        </code>
      );
    },
    h1: ({ _node, ...props }) => <h1 className="text-2xl sm:text-3xl font-normal tracking-tight mt-10 mb-5 text-white" {...props} />,
    h2: ({ _node, ...props }) => <h2 className="text-xl sm:text-2xl font-light tracking-wide mt-10 mb-5 border-b border-white/5 pb-3 text-zinc-100" {...props} />,
    h3: ({ _node, ...props }) => <h3 className="text-lg font-medium tracking-wide mt-8 mb-4 text-zinc-200" {...props} />,
    h4: ({ _node, ...props }) => <h4 className="text-base font-medium mt-6 mb-3 text-zinc-300" {...props} />,
    h5: ({ _node, ...props }) => <h5 className="text-sm tracking-wide mt-5 mb-2 text-zinc-400" {...props} />,
    h6: ({ _node, ...props }) => <h6 className="text-[12px] font-medium mt-4 mb-2 uppercase tracking-wider text-zinc-500" {...props} />,
    ul: ({ _node, ...props }) => <ul className="list-disc list-outside space-y-2 my-5 ml-6 marker:text-zinc-500 text-zinc-300" {...props} />,
    ol: ({ _node, ...props }) => <ol className="list-decimal list-outside space-y-2 my-5 ml-6 marker:text-zinc-500 text-zinc-300" {...props} />,
    li: ({ _node, ...props }) => <li className="my-1.5 leading-relaxed pl-1" {...props} />,
    hr: ({ _node, ...props }) => <hr className="my-10 border-white/5" {...props} />,
    p: ({ _node, ...props }) => <p className="leading-relaxed my-5 text-zinc-300 font-light" {...props} />,
    blockquote: ({ _node, ...props }) => <blockquote className="border-l-2 border-emerald-500/30 bg-emerald-500/5 rounded-r-2xl px-5 py-3 my-6 italic text-zinc-400" {...props} />,
    a: ({ _node, href, children, ...props }) => {
      const safeHref = isSafeUrl(href) ? href : '#';
      return (
        <a className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 border-b border-emerald-500/30 hover:border-emerald-400 transition-colors" target="_blank" rel="noopener noreferrer" href={safeHref} {...props}>
          {children}
          <ExternalLink size={12} className="opacity-70" />
        </a>
      );
    },
    table: ({ _node, ...props }) => (
      <div className="my-8 w-full overflow-x-auto border border-white/5 bg-[#0a0d14] rounded-2xl shadow-lg">
        <table className="w-full border-collapse text-sm text-left" {...props} />
      </div>
    ),
    thead: ({ _node, ...props }) => <thead className="bg-[#030508]/80 backdrop-blur-sm border-b border-white/5 text-[11px] uppercase tracking-wider font-medium text-zinc-500" {...props} />,
    th: ({ _node, ...props }) => <th className="px-6 py-4 font-medium" {...props} />,
    td: ({ _node, ...props }) => <td className="border-t border-white/[0.02] px-6 py-4 text-zinc-300 font-light" {...props} />,
    tr: ({ _node, ...props }) => <tr className="hover:bg-white/[0.02] transition-colors" {...props} />,
    img: ({ _node, ...props }) => <img className="my-8 max-w-full h-auto border border-white/5 rounded-2xl shadow-xl" {...props} />,
    strong: ({ _node, ...props }) => <strong className="font-medium text-white" {...props} />,
    em: ({ _node, ...props }) => <em className="italic text-zinc-400" {...props} />,
  };

  const stripContinueMarkers = (content) => {
    if (!content) return content;
    return content.replace(/^[^\n]*CONTINUE_AVAILABLE[^\n]*\n?/gmi, "");
  };

  const stripSystemMarkers = (content) => {
    if (!content) return content;
    let cleaned = stripContinueMarkers(content);
    cleaned = cleaned.replace(/\[THINKING\][\s\S]*?\[\/THINKING\]/g, "");
    cleaned = cleaned.replace(/\[THINKING\][\s\S]*$/g, "");
    return cleaned;
  };

  const handleCopy = () => {
    onCopyMessage(stripSystemMarkers(msg.content));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const preprocessContent = (content) => {
    if (!content) return content;
    let processed = stripContinueMarkers(content);

    const codePatterns = [
      /^(mkdir|cd|npm|npm run|npm install|git|sudo|apt-get|docker|pip|pip install|python|node|ls|cat|chmod|chown)\s+.+$/i,
      /^[a-z0-9_]+\s*=\s*['"][^'"]*['"]$/i,
      /^\s*\{\s*".+":\s*.+\}\s*$/s,
    ];

    const isRawCode = codePatterns.some(pattern => pattern.test(processed.trim())) && !processed.includes('```') && !processed.includes('`');

    if (isRawCode) {
      const isTerminal = /^(mkdir|cd|npm|git|sudo|apt-get|docker|pip|python|node|ls|cat|chmod|chown)/i.test(processed.trim());
      processed = `\`\`\`${isTerminal ? 'bash' : 'code'}\n${processed.trim()}\n\`\`\``;
    }

    processed = processed.replace(
      /Source:\s*(https?:\/\/[^\s]+)/gi,
      (match, url) => {
        try {
          const domain = new URL(url).hostname.replace('www.', '');
          return `[🔗 ${domain}](${url})`;
        } catch {
          return `[🔗 Source](${url})`;
        }
      }
    );

    processed = processed.replace(
      /(?<!\[.*?\]\()(?<!\()(?<!")(?<!')\b(https?:\/\/[^\s\)"'\]<>]+)/g,
      (url) => {
        try {
          const domain = new URL(url).hostname.replace('www.', '');
          return `[${domain}](${url})`;
        } catch {
          return `[Link](${url})`;
        }
      }
    );

    return processed;
  };

  const isSearching = msg.isSearching;
  const isGenerating = msg.isGenerating;
  const isStreaming = msg.isStreaming;
  const sources = msg.sources || [];

  const parsedContent = useMemo(() => parseThinkingContent(msg.content || ""), [msg.content]);
  const displayContent = useMemo(() => {
    let cleaned = stripContinueMarkers(parsedContent.displayContent || "");
    cleaned = cleaned.replace(/\[\/?THINKING\]/gi, "").trim();
    return cleaned;
  }, [parsedContent.displayContent]);
  const thinkingContent = parsedContent.thinkingContent || "";
  const normalizedThinking = useMemo(() => normalizeThinkingContent(thinkingContent), [thinkingContent]);
  const formattedThinking = useMemo(() => formatThinkingForDisplay(normalizedThinking), [normalizedThinking]);
  const currentHeading = useMemo(() => extractCurrentHeading(formattedThinking), [formattedThinking]);
  const preprocessedDisplay = useMemo(() => preprocessContent(displayContent), [displayContent]);

  const hasVisibleContent = Boolean(displayContent && displayContent.trim().length > 0);
  const allowThinkingPanel = thinkingVisibility !== 'off' && Boolean(formattedThinking);
  const indicatorActive = Boolean((isSearching || isGenerating) && !hasVisibleContent && !formattedThinking);

  useEffect(() => {
    const minDurationMs = 1200;
    const holdAfterMs = 2000;

    if (indicatorTimeoutRef.current) clearTimeout(indicatorTimeoutRef.current);
    if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    if (ghostTimeoutRef.current) clearTimeout(ghostTimeoutRef.current);

    if (indicatorActive) {
      indicatorStartRef.current = Date.now();
      setShowIndicator(true);
      setHoldFinalStep(false);
      setIndicatorFade(false);
      setGhostSpace(false);
      holdTimeoutRef.current = setTimeout(() => {
        setHoldFinalStep(true);
        holdTimeoutRef.current = null;
      }, holdAfterMs);
      return;
    }

    const elapsed = indicatorStartRef.current ? Date.now() - indicatorStartRef.current : minDurationMs;
    const remaining = Math.max(0, minDurationMs - elapsed);

    indicatorTimeoutRef.current = setTimeout(() => {
      setIndicatorFade(true);
      fadeTimeoutRef.current = setTimeout(() => {
        setShowIndicator(false);
        setIndicatorFade(false);
        setGhostSpace(true);
        indicatorStartRef.current = 0;
        setHoldFinalStep(false);
        fadeTimeoutRef.current = null;
      }, 220);
      ghostTimeoutRef.current = setTimeout(() => {
        setGhostSpace(false);
        ghostTimeoutRef.current = null;
      }, 520);
      indicatorTimeoutRef.current = null;
    }, remaining);

    return () => {
      if (indicatorTimeoutRef.current) clearTimeout(indicatorTimeoutRef.current);
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
      if (ghostTimeoutRef.current) clearTimeout(ghostTimeoutRef.current);
      setIndicatorFade(false);
      setShowIndicator(false);
      setGhostSpace(false);
      setHoldFinalStep(false);
      indicatorStartRef.current = 0;
    };
  }, [indicatorActive]);

  if (msg.role === "user") {
    return (
      <div ref={ref} className="flex justify-end mb-10 animate-fade-in group w-full px-4 md:px-0" style={{ animationDelay: `${index * 0.03}s` }}>
        <div className="max-w-[90%] md:max-w-[75%] lg:max-w-[65%] flex flex-col items-end">
          {msg.files && msg.files.length > 0 && (
            <div className="mb-3 space-y-2 inline-flex flex-col items-end w-full">
              {msg.files.map((file, idx) => {
                const fileKey = file.id || `${file.name || 'file'}:${file.size || 0}:${file.lastModified || idx}`;
                return (
                  <div key={fileKey} className="flex items-center gap-3 px-4 py-3 border border-white/10 bg-[#030508] shadow-sm w-auto max-w-full">
                  <div className="text-zinc-500">
                    {(() => {
                      const icon = getFileIcon(file.type);
                      switch (icon.type) {
                        case 'image': return <Image size={18} />;
                        case 'pdf': return <FileText size={18} />;
                        default: return <FileText size={18} />;
                      }
                    })()}
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="text-sm truncate text-zinc-300 font-medium">{file.name}</div>
                    <div className="text-[11px] text-zinc-500 font-mono tracking-wide">{formatFileSize(file.size)}</div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
          
          <div className="inline-block px-6 py-4 bg-white/[0.02] border border-white/10 rounded-[2px] shadow-sm text-white/90 text-sm leading-relaxed font-light text-left min-w-[60px] max-w-full break-words">
            {msg.content}
          </div>
          
          <div className="mt-2 flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={handleCopy} className="text-[11px] font-medium tracking-wide text-zinc-500 hover:text-white transition-all flex items-center gap-1.5" title={copied ? "Copied!" : "Copy request"}>
              {copied ? <><Sparkles size={12} className="text-emerald-400" /> <span className="text-emerald-400">Copied</span></> : <><Copy size={12} /> Copy</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // System/Bot Message Body
  return (
    <div
      ref={ref}
      className={`flex items-start gap-6 mb-12 animate-fade-in group w-full ${isLastMessage ? 'pb-8' : 'border-b border-white/5 pb-10'}`}
      onMouseEnter={() => setShowCopyButton(true)}
      onMouseLeave={() => setShowCopyButton(false)}
      style={{ animationDelay: `${index * 0.03}s` }}
    >
      <div className="flex-1 min-w-0 px-2 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-white/80 leading-loose text-[15px] font-light font-['Inter',sans-serif]">
          {(!displayContent && !formattedThinking) && (isSearching || isGenerating) && (
            <ProcessingIndicator query={msg.searchQuery} showSearch={isSearching} holdFinalStep={holdFinalStep} />
          )}

          {sources.length > 0 && !showIndicator && !indicatorFade && !ghostSpace && (
            <SourcesDisplay sources={sources} />
          )}

          {allowThinkingPanel && (
            <ThinkingDropdown formattedContent={formattedThinking} currentHeading={currentHeading} isStreaming={Boolean(isStreaming && !hasVisibleContent)} hasAnswer={hasVisibleContent} />
          )}

          {msg.intelligence && (
            <IntelligenceBar intelligence={msg.intelligence} isStreaming={isStreaming} />
          )}

          {displayContent && (
            <div className="relative">
              <div className="prose prose-invert max-w-none prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0">
                <ReactMarkdown components={MarkdownComponents} remarkPlugins={[remarkGfm]}>
                  {preprocessedDisplay}
                </ReactMarkdown>
              </div>
              {isStreaming && (
                <span className="inline-block w-2.5 h-4 bg-emerald-400 ml-2 animate-pulse align-middle opacity-80 decoration-blink rounded-sm"></span>
              )}
            </div>
          )}
        </div>
        
        {displayContent && !isSearching && !isGenerating && !isStreaming && (
          <div className="mt-8 pt-4 border-t border-white/5 flex gap-4 items-center opacity-30 group-hover:opacity-100 transition-opacity">
            <button onClick={handleCopy} className="text-[11px] font-medium tracking-wide text-zinc-500 hover:text-white transition-colors flex items-center gap-1.5" title={copied ? "Copied!" : "Copy text"}>
              <Copy size={12} className={copied ? "text-emerald-400" : ""} /> {copied ? <span className="text-emerald-400">Copied</span> : 'Copy text'}
            </button>
            {isGeneric && continueMeta && (
              <span className="text-[11px] font-medium tracking-wide text-zinc-500 border border-white/5 bg-white/[0.02] px-3 py-1.5 rounded-full flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Continuation Available
              </span>
            )}
            {isGeneric && continueMeta && onContinue && (
              <button onClick={() => onContinue(msg, continueMeta)} className="text-[11px] font-medium tracking-wide text-zinc-300 hover:text-white transition-colors bg-white/5 px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/10 hover:border-white/20">
                <Sparkles size={12} className="text-emerald-400" /> Proceed
              </button>
            )}
            <button
              onClick={() => {
                const blob = new Blob([stripSystemMarkers(msg.content)], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = `relyce-log-${Date.now()}.txt`;
                document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
              }}
              className="text-[11px] font-medium tracking-wide text-zinc-500 hover:text-white transition-colors flex items-center gap-1.5"
              title="Download text file"
            >
              <Download size={12} /> Export
            </button>
          </div>
        )}
      </div>
    </div>
  );
}));

export default MessageComponent;
