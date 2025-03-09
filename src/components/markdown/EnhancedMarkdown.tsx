/**
 * Enhanced Markdown Component for the Wabbit application
 *
 * This component provides a standardized way to render markdown content with
 * consistent formatting, interactive elements, and normalized display across
 * different LLM sources.
 */
import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import {
  MarkdownService,
  MarkdownNormalizationOptions,
} from "../../services/markdown/MarkdownNormalizer";

/** Props for the EnhancedMarkdown component */
export interface EnhancedMarkdownProps {
  /** The markdown content to render */
  content: string;

  /** Whether to normalize the markdown before rendering */
  normalize?: boolean;

  /** Options for markdown normalization */
  normalizationOptions?: MarkdownNormalizationOptions;

  /** Callback for when an element in the markdown is clicked */
  onElementClick?: (element: string, text: string) => void;

  /** Additional CSS class names */
  className?: string;

  /** Whether to enable code block copy buttons */
  enableCodeCopy?: boolean;

  /** Extension point: additional props */
  [key: string]: unknown;
}

/** Reusable heading component for markdown headings */
interface MarkdownHeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  onElementClick?: (element: string, text: string) => void;
  [key: string]: unknown;
}

const MarkdownHeading: React.FC<MarkdownHeadingProps> = ({
  level,
  children,
  onElementClick,
  ...props
}) => {
  const headerText = String(children).trim();

  // Define styling based on heading level
  const styles = {
    1: "text-xl font-bold mb-4 markdown-h1",
    2: "text-lg font-bold mb-3 markdown-h2",
    3: "text-base font-bold mb-2 markdown-h3",
    4: "text-base font-bold mb-2 markdown-h4",
    5: "text-sm font-bold mb-1 markdown-h5",
    6: "text-xs font-bold mb-1 markdown-h6",
  };

  const className = `${styles[level]} cursor-pointer hover:text-primary hover:underline markdown-heading`;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Heading clicked:", { level, headerText });
    onElementClick?.("heading", headerText);
  };

  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <HeadingTag
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </HeadingTag>
  );
};

/**
 * Enhanced Markdown component for rendering normalized markdown content
 *
 * @param props - Component props
 * @returns React component for rendering markdown
 */
const EnhancedMarkdown: React.FC<EnhancedMarkdownProps> = ({
  content,
  normalize = true,
  normalizationOptions = {},
  onElementClick,
  className = "",
  enableCodeCopy = true,
  ...rest
}) => {
  // Initialize markdown service
  const markdownService = React.useMemo(() => new MarkdownService(), []);

  // Process content with normalization if enabled
  const processedContent = React.useMemo(() => {
    if (normalize) {
      return markdownService.normalizeMarkdown(content, normalizationOptions);
    }
    return content;
  }, [content, normalize, normalizationOptions, markdownService]);

  // Define custom components for ReactMarkdown
  const customComponents = React.useMemo<Components>(() => {
    return {
      // Customized heading components using the reusable MarkdownHeading
      h1: ({ children, ...props }) => (
        <MarkdownHeading level={1} onElementClick={onElementClick} {...props}>
          {children}
        </MarkdownHeading>
      ),
      h2: ({ children, ...props }) => (
        <MarkdownHeading level={2} onElementClick={onElementClick} {...props}>
          {children}
        </MarkdownHeading>
      ),
      h3: ({ children, ...props }) => (
        <MarkdownHeading level={3} onElementClick={onElementClick} {...props}>
          {children}
        </MarkdownHeading>
      ),
      h4: ({ children, ...props }) => (
        <MarkdownHeading level={4} onElementClick={onElementClick} {...props}>
          {children}
        </MarkdownHeading>
      ),
      h5: ({ children, ...props }) => (
        <MarkdownHeading level={5} onElementClick={onElementClick} {...props}>
          {children}
        </MarkdownHeading>
      ),
      h6: ({ children, ...props }) => (
        <MarkdownHeading level={6} onElementClick={onElementClick} {...props}>
          {children}
        </MarkdownHeading>
      ),

      // Customized code block component with copy button
      code: ({
        className,
        children,
        ...props
      }: React.HTMLAttributes<HTMLElement> & { className?: string }) => {
        // Handle inline code
        if (!className) {
          return (
            <code className={`bg-muted px-1 py-0.5 rounded text-sm`} {...props}>
              {children}
            </code>
          );
        }

        // Extract language from className (format: language-*)
        const match = /language-(\w+)/.exec(className || "");
        const language = match ? match[1] : "";

        // Function to handle copy button click
        const handleCopyClick = () => {
          const code = String(children).replace(/\n$/, "");
          navigator.clipboard.writeText(code);
        };

        return (
          <div className="relative group">
            {enableCodeCopy && (
              <button
                onClick={handleCopyClick}
                className="absolute top-2 right-2 bg-primary/10 hover:bg-primary/20 text-primary rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Copy
              </button>
            )}
            <pre
              className={`p-4 rounded-md bg-muted overflow-x-auto ${className || ""}`}
            >
              <code
                className={language ? `language-${language}` : ""}
                {...props}
              >
                {children}
              </code>
            </pre>
            {language && (
              <div className="absolute top-0 right-0 bg-muted text-muted-foreground text-xs px-2 py-1 rounded-bl-md">
                {language}
              </div>
            )}
          </div>
        );
      },

      // Customized table component
      table: ({ children, ...props }) => (
        <div className="overflow-x-auto my-4">
          <table className="w-full border-collapse" {...props}>
            {children}
          </table>
        </div>
      ),

      // Customized table header
      th: ({ children, ...props }) => (
        <th
          className="border px-4 py-2 bg-muted font-bold text-left"
          {...props}
        >
          {children}
        </th>
      ),

      // Customized table cell
      td: ({ children, ...props }) => (
        <td className="border px-4 py-2" {...props}>
          {children}
        </td>
      ),

      // Customized blockquote
      blockquote: ({ children, ...props }) => (
        <blockquote
          className="border-l-4 border-primary/50 pl-4 italic my-4"
          {...props}
        >
          {children}
        </blockquote>
      ),

      // Customized list items
      li: ({ children, ...props }) => (
        <li className="my-1" {...props}>
          {children}
        </li>
      ),

      // Customized links
      a: ({ children, href, ...props }) => (
        <a
          href={href}
          className="text-primary underline hover:text-primary/80 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      ),
    };
  }, [onElementClick, enableCodeCopy]);

  return (
    <div className={`markdown-content ${className}`} {...rest}>
      <ReactMarkdown components={customComponents} remarkPlugins={[remarkGfm]}>
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default EnhancedMarkdown;