"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

interface MarkdownPreviewProps {
  content: string;
  placeholder?: string;
}

function escapeCustomTags(text: string): string {
  return text.replace(/<(?!\/?(?:p|br|em|strong|a|ul|ol|li|h[1-6]|blockquote|code|pre|table|thead|tbody|tr|th|td|hr|del|input)\b)[^>]*>/gi, (match) => {
    return match.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  });
}

export function MarkdownPreview({ content, placeholder }: MarkdownPreviewProps) {
  if (!content) {
    return (
      <div className="text-muted-foreground italic h-full">
        {placeholder}
      </div>
    );
  }

  // Highlight fit-promo placeholders
  const processed = content
    .replace(
      /\{analysis_context\}/g,
      "**`{analysis_context}`**"
    )
    .replace(
      /\{adapted_text\}/g,
      "**`{adapted_text}`**"
    );

  return (
    <div>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mt-6 mb-4 first:mt-0 pb-2 border-b border-border">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold mt-5 mb-3 first:mt-0 pb-1 border-b border-border">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium mt-4 mb-2 first:mt-0">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="my-3 first:mt-0 last:mb-0 leading-relaxed text-sm">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="my-3 ml-6 list-disc space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 ml-6 list-decimal space-y-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed text-sm">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-4 border-muted-foreground/30 pl-4 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          code: ({ className, children }) => {
            const codeContent = String(children);
            const isBlock = className || codeContent.includes("\n");
            if (isBlock) {
              return <code className="text-sm font-mono">{children}</code>;
            }
            return (
              <code className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono text-primary">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-3 p-4 bg-muted rounded-lg overflow-x-auto whitespace-pre-wrap break-words text-sm">
              {children}
            </pre>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-primary underline hover:no-underline"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          hr: () => <hr className="my-6 border-border" />,
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto">
              <table className="min-w-full border-collapse border border-border text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted">{children}</thead>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-border">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="border border-border px-3 py-2 text-left font-medium text-sm">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-3 py-2 text-sm">{children}</td>
          ),
        }}
      >
        {escapeCustomTags(processed)}
      </ReactMarkdown>
    </div>
  );
}
