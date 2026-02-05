// components/MessageComponent.jsx
import React, { useState, useEffect, useRef, memo, forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Download, Image, FileText, Globe, ExternalLink, Search, Sparkles, BrainCircuit } from 'lucide-react';
import { getFileIcon, formatFileSize } from '../../../utils/chatHelpers';

/**
 * Animated processing indicator (step-by-step)
 */
const LoadingDots = () => (
  <span className="inline-flex items-center gap-1 ml-2">
    <span className="relyce-dot" />
    <span className="relyce-dot relyce-dot-2" />
    <span className="relyce-dot relyce-dot-3" />
  </span>
);

const ProcessingIndicator = ({ query, showSearch, holdFinalStep }) => (
  <div className="relyce-processing space-y-3">
    <div className={`relyce-processing-card${holdFinalStep ? " is-hold" : ""}`}>
      <div className="relyce-step relyce-step-1">
        <div className="relyce-step-icon">
          <BrainCircuit size={14} />
        </div>
        <div className="relyce-step-text">
          Analyzing question
          <LoadingDots />
        </div>
      </div>
      <div className="relyce-step relyce-step-2">
        <div className="relyce-step-icon">
          <Search size={14} />
        </div>
        <div className="relyce-step-text">
          Searching for the best answer
          <LoadingDots />
        </div>
      </div>
      <div className="relyce-step relyce-step-3">
        <div className="relyce-step-icon">
          <Sparkles size={14} />
        </div>
        <div className="relyce-step-text">
          Processing information
          <LoadingDots />
        </div>
      </div>
    </div>
    {showSearch && query && (
      <div className="text-xs text-zinc-400/80 italic truncate">
        “{query.length > 80 ? query.substring(0, 80) + '…' : query}”
      </div>
    )}
  </div>
);

/**
 * Generating response indicator
 */
const GeneratingIndicator = () => <ProcessingIndicator showSearch={false} />;

/**
 * Sources display component
 */
const SourcesDisplay = ({ sources }) => (
  <div className="mb-3 pb-3 border-b border-zinc-700/50">
    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
      <Globe size={12} />
      <span>Sources ({sources.length})</span>
    </div>
    <div className="flex flex-wrap gap-2">
      {sources.slice(0, 5).map((source, idx) => {
        let domain = 'source';
        try {
          domain = new URL(source.link).hostname.replace('www.', '');
        } catch {}
        
        return (
          <a
            key={idx}
            href={source.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-zinc-800 hover:bg-zinc-700 text-emerald-400 hover:text-emerald-300 transition-colors"
            title={source.title}
          >
            <Globe size={10} />
            <span className="truncate max-w-[100px]">{domain}</span>
            <ExternalLink size={10} className="opacity-50" />
          </a>
        );
      })}
    </div>
  </div>
);

/**
 * Markdown components for rendering messages
 */
/**
 * Message component - ChatGPT style layout
 */
const MessageComponent = memo(forwardRef(({ msg, index, theme, onCopyMessage, isLastMessage, chatMode }, ref) => {
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

  /**
   * Markdown components for rendering messages - defined inside to access chatMode
   */
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

        // If not generic mode, use a simpler style (original style)
        if (!isGenericMode) {
          return (
            <div className="rounded-lg overflow-hidden my-3 relative group border border-zinc-800">
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10"
                title={copied ? "Copied!" : "Copy code"}
              >
                {copied ? <Copy size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
              <div className="overflow-x-auto" style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(52, 211, 153, 0.2) transparent',
                borderRadius: '0.5rem'
              }}>
                <SyntaxHighlighter
                  style={atomDark}
                  language={language}
                  PreTag="div"
                  customStyle={{ margin: 0, borderRadius: '0.5rem', background: '#09090b', padding: '1rem' }}
                  {...props}
                >
                  {String(code).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            </div>
          );
        }

        // ChatGPT style for Generic mode - Premium Emerald-Slate Theme
        return (
          <div className="rounded-xl overflow-hidden my-6 border border-emerald-500/20 bg-[#0a1211] shadow-xl">
            {/* Header bar - Slightly lighter emerald-slate */}
            <div className="flex items-center justify-between px-4 py-2 bg-emerald-900/10 border-b border-emerald-500/10">
              <span className="text-[10px] font-bold text-emerald-400/60 font-mono uppercase tracking-[0.1em]">
                {language || 'code'}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-emerald-500/10 text-emerald-400/50 hover:text-emerald-400 transition-all text-xs font-medium"
              >
                {copied ? (
                  <>
                    <Copy size={12} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Copy code</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="overflow-x-auto relative" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(52, 211, 153, 0.2) transparent'
            }}>
              <SyntaxHighlighter
                style={atomDark}
                language={language === 'text' ? 'text' : language}
                PreTag="div"
                customStyle={{
                  margin: 0,
                  background: 'transparent',
                  padding: '1.25rem',
                  fontSize: '0.875rem',
                  lineHeight: '1.6',
                  fontFamily: '"Fira Code", "JetBrains Mono", source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace'
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
      const isGeneric = chatMode === 'normal' || !chatMode; // Default to generic style if mode unknown

      return isBlock ? (
        <CodeBlockWithCopy code={children} language={language} isGenericMode={isGeneric} />
      ) : (
        <code
          className="bg-zinc-800/80 text-emerald-300 px-1.5 py-0.5 rounded border border-zinc-700/50 text-sm font-mono"
          {...props}
        >
          {children}
        </code>
      );
    },
    h1: ({ _node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4 pb-2 border-b border-gray-700" {...props} />,
    h2: ({ _node, ...props }) => <h2 className="text-xl font-semibold mt-5 mb-3 pb-1 border-b border-gray-700/50" {...props} />,
    h3: ({ _node, ...props }) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
    h4: ({ _node, ...props }) => <h4 className="text-base font-medium mt-3 mb-2" {...props} />,
    h5: ({ _node, ...props }) => <h5 className="text-sm font-medium mt-2 mb-1" {...props} />,
    h6: ({ _node, ...props }) => <h6 className="text-xs font-medium mt-2 mb-1 uppercase tracking-wide" {...props} />,
    ul: ({ _node, ...props }) => <ul className="list-disc list-inside space-y-1 my-3 ml-4" {...props} />,
    ol: ({ _node, ...props }) => <ol className="list-decimal list-inside space-y-1 my-3 ml-4" {...props} />,
    li: ({ _node, ...props }) => <li className="my-1 pl-1" {...props} />,
    hr: ({ _node, ...props }) => <hr className="my-6 border-gray-700" {...props} />,
    p: ({ _node, ...props }) => <p className="leading-relaxed my-3" {...props} />,
    blockquote: ({ _node, ...props }) => (
      <blockquote
        className="border-l-4 border-gray-500 pl-4 py-1 my-3 italic text-gray-300"
        {...props}
      />
    ),
    a: ({ _node, href, children, ...props }) => (
      <a
        className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 hover:underline bg-emerald-900/20 px-2 py-0.5 rounded-md text-sm transition-all"
        target="_blank"
        rel="noopener noreferrer"
        href={href}
        {...props}
      >
        {children}
        <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    ),
    table: ({ _node, ...props }) => (
      <div className="my-4 w-full overflow-x-auto rounded-md" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent'
      }}>
        <table className="w-full border-collapse border border-emerald-600/50 rounded-lg" {...props} />
      </div>
    ),
    thead: ({ _node, ...props }) => <thead className="bg-emerald-800/70" {...props} />,
    th: ({ _node, ...props }) => (
      <th
        className="border border-emerald-600/50 px-4 py-2 text-left font-semibold text-emerald-100"
        {...props}
      />
    ),
    td: ({ _node, ...props }) => (
      <td
        className="border border-emerald-600/50 px-4 py-2"
        {...props}
      />
    ),
    tr: ({ _node, ...props }) => (
      <tr
        className="even:bg-emerald-800/20 hover:bg-emerald-700/30"
        {...props}
      />
    ),
    img: ({ _node, ...props }) => (
      <img
        className="rounded-lg my-4 max-w-full h-auto"
        {...props}
      />
    ),
    strong: ({ _node, ...props }) => <strong className="font-bold" {...props} />,
    em: ({ _node, ...props }) => <em className="italic" {...props} />,
  };

  const handleCopy = () => {
    onCopyMessage(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Preprocess content to convert raw URLs to markdown links and handle raw code
  const preprocessContent = (content) => {
    if (!content) return content;

    let processed = content;

    // 1. Detect if the message is a standalone terminal command/code without backticks
    // Common terminal commands or code-like patterns
    const codePatterns = [
      /^(mkdir|cd|npm|npm run|npm install|git|sudo|apt-get|docker|pip|pip install|python|node|ls|cat|chmod|chown)\s+.+$/i,
      /^[a-z0-9_]+\s*=\s*['"][^'"]*['"]$/i, // Simple variable assignment
      /^\s*\{\s*".+":\s*.+\}\s*$/s, // JSON object
    ];

    const isRawCode = codePatterns.some(pattern => pattern.test(processed.trim())) && !processed.includes('```') && !processed.includes('`');

    if (isRawCode) {
      // Wrap it in a bash block if it looks like a command, otherwise generic code
      const isTerminal = /^(mkdir|cd|npm|git|sudo|apt-get|docker|pip|python|node|ls|cat|chmod|chown)/i.test(processed.trim());
      processed = `\`\`\`${isTerminal ? 'bash' : 'code'}\n${processed.trim()}\n\`\`\``;
    }

    // 2. Convert raw Source: URL patterns to markdown links
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

    // 3. Convert other raw URLs to markdown links
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
  const hasVisibleContent = Boolean(msg.content && msg.content.trim().length > 0);
  const indicatorActive = Boolean((isSearching || isGenerating) && !hasVisibleContent);

  useEffect(() => {
    const minDurationMs = 1200;
    const holdAfterMs = 2000;

    if (indicatorTimeoutRef.current) {
      clearTimeout(indicatorTimeoutRef.current);
      indicatorTimeoutRef.current = null;
    }
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }
    if (ghostTimeoutRef.current) {
      clearTimeout(ghostTimeoutRef.current);
      ghostTimeoutRef.current = null;
    }

    if (indicatorActive) {
      if (!indicatorStartRef.current) {
        indicatorStartRef.current = Date.now();
      }
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
      if (indicatorTimeoutRef.current) {
        clearTimeout(indicatorTimeoutRef.current);
        indicatorTimeoutRef.current = null;
      }
      if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current);
        holdTimeoutRef.current = null;
      }
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }
      if (ghostTimeoutRef.current) {
        clearTimeout(ghostTimeoutRef.current);
        ghostTimeoutRef.current = null;
      }
    };
  }, [indicatorActive]);

  // ChatGPT-style: User messages are simple pills on the right
  if (msg.role === "user") {
    return (
      <div
        ref={ref}
        className="flex justify-end mb-6 animate-fade-in"
        style={{ animationDelay: `${index * 0.03}s` }}
      >
        <div className="max-w-[70%]">
          {/* File attachments */}
          {msg.files && msg.files.length > 0 && (
            <div className="mb-2 space-y-2">
              {msg.files.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 rounded-lg px-3 py-2 bg-zinc-800/50">
                  {(() => {
                    const icon = getFileIcon(file.type);
                    switch (icon.type) {
                      case 'image': return <Image size={16} className={icon.className} />;
                      case 'pdf': return <FileText size={16} className={icon.className} />;
                      default: return <FileText size={16} className={icon.className} />;
                    }
                  })()}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate text-white">{file.name}</div>
                    <div className="text-xs text-gray-400">{formatFileSize(file.size)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* User message bubble - slightly rounded, not full pill */}
          <div className="inline-block px-4 py-2.5 rounded-2xl bg-zinc-700/60 text-white text-[15px] leading-relaxed">
            {msg.content}
          </div>
          
          {/* Copy button for user message */}
          <div className="mt-1 flex gap-1 justify-end">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md hover:bg-zinc-700/50 text-gray-500 hover:text-gray-300 transition-colors"
              title={copied ? "Copied!" : "Copy message"}
            >
              <Copy size={14} className={copied ? "text-green-500" : ""} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Bot messages - full width with actions below
  return (
    <div
      ref={ref}
      className="flex items-start gap-3 mb-6 animate-fade-in group"
      onMouseEnter={() => setShowCopyButton(true)}
      onMouseLeave={() => setShowCopyButton(false)}
      style={{ animationDelay: `${index * 0.03}s` }}
    >
      {/* Bot Avatar */}
      <div className="relative flex-shrink-0 hidden md:block">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg bg-gradient-to-br from-emerald-600 to-teal-600">
          R
        </div>
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0">
        <div className="text-gray-100 leading-relaxed max-w-none">
          {/* Animated processing indicator */}
          {(showIndicator || indicatorFade || ghostSpace) && (
            <div
              className={`relyce-processing-slot${indicatorFade ? " is-fading" : ""}${ghostSpace ? " is-ghost" : ""}`}
            >
              <ProcessingIndicator query={msg.searchQuery} showSearch={isSearching} holdFinalStep={holdFinalStep} />
              {sources.length > 0 && (
                <div className="mt-3">
                  <SourcesDisplay sources={sources} />
                </div>
              )}
            </div>
          )}

          {/* Sources + generating */}
          {isGenerating && !isSearching && (!msg.content || msg.content.length === 0) && (
            <>
              {sources.length > 0 && <SourcesDisplay sources={sources} />}
              {!showIndicator && <GeneratingIndicator />}
            </>
          )}

          {/* Sources (final state) */}
          {!isSearching && !isGenerating && sources.length > 0 && msg.content && (
            <SourcesDisplay sources={sources} />
          )}

          {/* Message text */}
          {msg.content && (
            <div className="relative">
              <ReactMarkdown
                components={MarkdownComponents}
                remarkPlugins={[remarkGfm]}
              >
                {preprocessContent(msg.content)}
              </ReactMarkdown>
              {/* Streaming cursor */}
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 animate-pulse"></span>
              )}
            </div>
          )}
        </div>
        
        {/* Copy and Download buttons - always visible, below message */}
        {msg.content && !isSearching && !isGenerating && !isStreaming && (
          <div className="mt-2 flex gap-1">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md hover:bg-zinc-700/50 text-gray-500 hover:text-gray-300 transition-colors"
              title={copied ? "Copied!" : "Copy message"}
            >
              <Copy size={16} className={copied ? "text-green-500" : ""} />
            </button>
            <button
              onClick={() => {
                // Download as text file
                const blob = new Blob([msg.content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `relyce-response-${Date.now()}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="p-1.5 rounded-md hover:bg-zinc-700/50 text-gray-500 hover:text-gray-300 transition-colors"
              title="Download as text"
            >
              <Download size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}));

export default MessageComponent;
