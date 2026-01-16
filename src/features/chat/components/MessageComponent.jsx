// components/MessageComponent.jsx
import React, { useState, memo, forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Download, Image, FileText, Globe, ExternalLink, Search } from 'lucide-react';
import { getFileIcon, formatFileSize } from '../../../utils/chatHelpers';

/**
 * Skeleton loader component for searching state
 */
const SearchingSkeleton = ({ query }) => (
  <div className="animate-pulse space-y-3">
    {/* Searching status */}
    <div className="flex items-center gap-2 text-emerald-400">
      <Search size={16} className="animate-spin" />
      <span className="text-sm font-medium">Searching the web...</span>
    </div>
    
    {/* Query being searched */}
    {query && (
      <div className="text-xs text-gray-400 italic truncate">
        "{query.length > 60 ? query.substring(0, 60) + '...' : query}"
      </div>
    )}
    
    {/* Skeleton source links - shows WHERE the links will appear */}
    <div className="border-b border-zinc-700/50 pb-3">
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
        <Globe size={12} />
        <span>Finding sources...</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {/* Skeleton link badges */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div 
            key={i} 
            className="h-6 bg-zinc-700/50 rounded-md animate-pulse"
            style={{ width: `${60 + Math.random() * 40}px` }}
          />
        ))}
      </div>
    </div>
    
    {/* Skeleton text lines for response preview */}
    <div className="space-y-2 mt-2">
      <div className="h-3 bg-zinc-700/30 rounded w-full"></div>
      <div className="h-3 bg-zinc-700/30 rounded w-4/5"></div>
      <div className="h-3 bg-zinc-700/30 rounded w-3/4"></div>
    </div>
  </div>
);

/**
 * Generating response indicator (simpler - just dots)
 */
const GeneratingIndicator = () => (
  <div className="flex items-center gap-2 text-blue-400 py-2">
    <div className="flex space-x-1">
      <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
    <span className="text-sm font-medium">Generating response...</span>
  </div>
);

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
const MarkdownComponents = {
  code({ _node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");

    // Create a custom component for code blocks with copy functionality
    const CodeBlockWithCopy = ({ code, language }) => {
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
        <div className="rounded-lg overflow-hidden my-3 relative">
          {/* Copy button for code blocks */}
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 rounded-md bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
            title={copied ? "Copied!" : "Copy code"}
          >
            {copied ? (
              <Copy size={14} className="text-green-400" />
            ) : (
              <Copy size={14} />
            )}
          </button>
          <div className="overflow-x-auto" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent',
            borderRadius: '0.5rem'
          }}>
            <SyntaxHighlighter
              style={atomDark}
              language={language}
              PreTag="div"
              customStyle={{
                margin: 0,
                borderRadius: '0.5rem'
              }}
              {...props}
            >
              {String(code).replace(/\n$/, "")}
            </SyntaxHighlighter>
          </div>
        </div>
      );
    };

    return !inline && match ? (
      <CodeBlockWithCopy code={children} language={match[1]} />
    ) : (
      <code
        className="bg-zinc-700/50 text-emerald-300 px-1.5 py-0.5 rounded-md text-sm"
        {...props}
      >
        {children}
      </code>
    );
  },
  h1: ({ _node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4 pb-2 border-b border-gray-700 print:text-black print:border-black" {...props} />,
  h2: ({ _node, ...props }) => <h2 className="text-xl font-semibold mt-5 mb-3 pb-1 border-b border-gray-700/50 print:text-black print:border-black" {...props} />,
  h3: ({ _node, ...props }) => <h3 className="text-lg font-semibold mt-4 mb-2 print:text-black" {...props} />,
  h4: ({ _node, ...props }) => <h4 className="text-base font-medium mt-3 mb-2 print:text-black" {...props} />,
  h5: ({ _node, ...props }) => <h5 className="text-sm font-medium mt-2 mb-1 print:text-black" {...props} />,
  h6: ({ _node, ...props }) => <h6 className="text-xs font-medium mt-2 mb-1 uppercase tracking-wide print:text-black" {...props} />,
  ul: ({ _node, ...props }) => <ul className="list-disc list-inside space-y-1 my-3 ml-4 print:text-black" {...props} />,
  ol: ({ _node, ...props }) => <ol className="list-decimal list-inside space-y-1 my-3 ml-4 print:text-black" {...props} />,
  li: ({ _node, ...props }) => <li className="my-1 pl-1 print:text-black" {...props} />,
  hr: ({ _node, ...props }) => <hr className="my-6 border-gray-700 print:border-black" {...props} />,
  p: ({ _node, ...props }) => <p className="leading-relaxed my-3 print:text-black" {...props} />,
  blockquote: ({ _node, ...props }) => (
    <blockquote
      className="border-l-4 border-gray-500 pl-4 py-1 my-3 italic text-gray-300 print:text-black print:border-black"
      {...props}
    />
  ),
  a: ({ _node, href, children, ...props }) => (
    <a
      className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 hover:underline bg-emerald-900/20 px-2 py-0.5 rounded-md text-sm transition-all print:text-emerald-600"
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
      <table className="w-full border-collapse border border-emerald-600/50 rounded-lg print:border-black print:text-black" {...props} />
    </div>
  ),
  thead: ({ _node, ...props }) => <thead className="bg-emerald-800/70 print:bg-gray-200" {...props} />,
  th: ({ _node, ...props }) => (
    <th
      className="border border-emerald-600/50 px-4 py-2 text-left font-semibold text-emerald-100 print:border-black print:bg-gray-200"
      {...props}
    />
  ),
  td: ({ _node, ...props }) => (
    <td
      className="border border-emerald-600/50 px-4 py-2 print:border-black"
      {...props}
    />
  ),
  tr: ({ _node, ...props }) => (
    <tr
      className="even:bg-emerald-800/20 hover:bg-emerald-700/30 print:even:bg-gray-100 print:text-black"
      {...props}
    />
  ),
  img: ({ _node, ...props }) => (
    <img
      className="rounded-lg my-4 max-w-full h-auto print:max-w-full"
      {...props}
    />
  ),
  strong: ({ _node, ...props }) => <strong className="font-bold print:text-black" {...props} />,
  em: ({ _node, ...props }) => <em className="italic print:text-black" {...props} />,
};

/**
 * Message component for rendering individual chat messages
 * @param {Object} props - Component props
 * @returns {JSX.Element} Message component
 */
const MessageComponent = memo(forwardRef(({ msg, index, theme, onCopyMessage, isLastMessage }, ref) => {
  const [showCopyButton, setShowCopyButton] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopyMessage(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Preprocess content to convert raw URLs to markdown links
  const preprocessContent = (content) => {
    if (!content) return content;

    // Convert "Source: URL" format to styled source links
    let processed = content.replace(
      /Source:\s*(https?:\/\/[^\s]+)/gi,
      (match, url) => {
        // Extract domain for display
        try {
          const domain = new URL(url).hostname.replace('www.', '');
          return `[🔗 ${domain}](${url})`;
        } catch {
          return `[🔗 Source](${url})`;
        }
      }
    );

    // Convert standalone URLs that aren't already in markdown format
    processed = processed.replace(
      /(?<!\[.*?\]\()(?<!\()(?<!")(?<!')\b(https?:\/\/[^\s\)"\]<>]+)/g,
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

  // Check for special states
  const isSearching = msg.isSearching;
  const isGenerating = msg.isGenerating;
  const isStreaming = msg.isStreaming;
  const sources = msg.sources || [];

  return (
    <div
      key={msg.id}
      className={`flex items-start gap-3 mb-6 animate-fade-in ${msg.role === "user" ? "justify-end" : "justify-start"
        }`}
      ref={ref}
      onMouseEnter={() => setShowCopyButton(true)}
      onMouseLeave={() => setShowCopyButton(false)}
      style={{
        animationDelay: `${index * 0.03}s`
      }}
    >
      {/* Only show avatar for bot messages, hide on mobile */}
      {msg.role === "bot" && (
        <div className="relative flex-shrink-0 hidden md:block">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${theme === 'dark' ? 'bg-gradient-to-br from-blue-600 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-purple-500'
            }`}>
            R
          </div>
        </div>
      )}

      <div className="relative message-container group w-full">
        {/* Copy button for bot messages - appears after receiving answer */}
        {msg.role === "bot" && msg.content && !isSearching && !isGenerating && (
          <div className={`copy-button copy-button-bot copy-button-transition ${showCopyButton ? 'opacity-100' : 'opacity-0'
            }`}>
            <button
              onClick={handleCopy}
              className={`p-1.5 rounded-lg shadow-md transition-all ${theme === 'dark'
                ? 'bg-zinc-800 hover:bg-zinc-700 text-gray-300'
                : 'bg-white hover:bg-gray-100 text-gray-600'
                }`}
              title={copied ? "Copied!" : "Copy message"}
            >
              {copied ? (
                <Copy size={14} className="text-green-500" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>
        )}

        <div
          className={`px-4 py-3 rounded-2xl leading-relaxed ${msg.role === "user"
            ? (theme === 'dark'
              ? "ml-auto bg-gray-600/10 text-white rounded-br-md user-message-desktop w-[80%]"
              : "ml-auto bg-gray-200 text-gray-800 rounded-br-md user-message-desktop w-[80%]")
            : (theme === 'dark'
              ? " text-gray-100 rounded-bl-md max-w-[100%] sm:max-w-2xl md:max-w-3xl"
              : "bg-white text-gray-800 rounded-bl-md max-w-[100%] sm:max-w-2xl md:max-w-3xl")
            }`}
        >
          {/* File attachments */}
          {msg.files && msg.files.length > 0 && (
            <div className="mb-3 space-y-2">
              {msg.files.map((file, index) => (
                <div key={index} className={`flex items-center gap-2 rounded-lg px-3 py-2 ${theme === 'dark' ? 'bg-black/20' : 'bg-gray-200'
                  }`}>
                  {(() => {
                    const icon = getFileIcon(file.type);
                    switch (icon.type) {
                      case 'image': return <Image size={16} className={icon.className} />;
                      case 'pdf': return <FileText size={16} className={icon.className} />;
                      default: return <FileText size={16} className={icon.className} />;
                    }
                  })()}
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>{file.name}</div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>{formatFileSize(file.size)}</div>
                  </div>
                  <button
                    onClick={() => {
                      if (file.file) {
                        try {
                          const url = URL.createObjectURL(file.file);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = file.name;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          setTimeout(() => URL.revokeObjectURL(url), 100);
                        } catch (error) {
                          console.error('Error downloading file:', error);
                          alert('Failed to download file. Please try again.');
                        }
                      } else {
                        alert('File not available for download.');
                      }
                    }}
                    className={`opacity-70 hover:opacity-100 p-1 rounded transition ${theme === 'dark' ? 'text-current' : 'text-gray-700'
                      }`}
                    title="Download file"
                  >
                    <Download size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Searching skeleton loader */}
          {isSearching && (
            <SearchingSkeleton query={msg.searchQuery} />
          )}

          {/* Sources display with generating indicator */}
          {isGenerating && !isSearching && (
            <>
              {sources.length > 0 && <SourcesDisplay sources={sources} />}
              <GeneratingIndicator />
            </>
          )}

          {/* Sources display (when we have content - final state) */}
          {!isSearching && !isGenerating && sources.length > 0 && msg.content && (
            <SourcesDisplay sources={sources} />
          )}

          {/* Message text with preprocessed URLs */}
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
      </div>
    </div>
  );
}));

export default MessageComponent;