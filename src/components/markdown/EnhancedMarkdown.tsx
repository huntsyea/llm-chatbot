/**
 * Enhanced Markdown Component for the Wabbit application
 *
 * This component provides a standardized way to render markdown content with
 * consistent formatting, interactive elements, and normalized display across
 * different LLM sources. All headers and bold text are made clickable to trigger new queries.
 * Supports math rendering with $ for inline and $$ for display equations.
 */
import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import type { Components } from "react-markdown";
import { visit } from "unist-util-visit"; // Added for AST manipulation
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
  // Extract header text by flattening children to a string
  const headerText = React.Children.toArray(children)
    .map(child => (typeof child === "string" ? child : String(child)))
    .join("")
    .trim();

  // Define styling based on heading level, consistent with prompt's H2 and H3 focus
  const styles = {
    1: "text-xl font-bold mb-4 markdown-h1",
    2: "text-lg font-bold mb-3 markdown-h2", // Matches ## in prompt
    3: "text-base font-bold mb-2 markdown-h3", // Matches ### in prompt
    4: "text-base font-bold mb-2 markdown-h4",
    5: "text-sm font-bold mb-1 markdown-h5",
    6: "text-xs font-bold mb-1 markdown-h6",
  };

  const className = `${styles[level]} cursor-pointer hover:text-primary hover:underline markdown-heading`;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (headerText && onElementClick) {
      console.log("Heading clicked:", { level, headerText });
      onElementClick("heading", headerText);
    }
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

/** Reusable bold component for clickable bold text */
interface MarkdownBoldProps {
  children: React.ReactNode;
  onElementClick?: (element: string, text: string) => void;
  [key: string]: unknown;
}

const MarkdownBold: React.FC<MarkdownBoldProps> = ({
  children,
  onElementClick,
  ...props
}) => {
  // Extract bold text by flattening children to a string
  const boldText = React.Children.toArray(children)
    .map(child => (typeof child === "string" ? child : String(child)))
    .join("")
    .trim();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (boldText && onElementClick) {
      console.log("Bold text clicked:", { boldText });
      onElementClick("bold", boldText);
    }
  };

  return (
    <strong
      className="font-bold cursor-pointer hover:text-primary hover:underline markdown-bold"
      onClick={handleClick}
      {...props}
    >
      {children}
    </strong>
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

  // Debug function to log and clean math nodes without affecting list items
  const cleanMathNodes = (tree: any) => {
    console.log("Processing markdown AST for math cleanup:", JSON.stringify(tree, null, 2));
    visit(tree, "math", (mathNode, mathIndex, mathParent) => {
      console.log("Found math node:", mathNode);
      // Check for raw LaTeX text that failed to parse, but avoid list items
      visit(tree, "text", (textNode, textIndex, textParent) => {
        if (textNode.value && (textNode.value.includes("$") || textNode.value.includes("$$"))) {
          const isPrecededByMath = textParent.children[textIndex - 1]?.type === "math";
          const isInList = textParent.type === "list" || textParent.type === "listItem";
          // Only remove if it's raw LaTeX that failed to parse and not within a list
          if (isPrecededByMath && !isInList) {
            console.warn("Removing raw math text that failed to parse:", textNode.value);
            textNode.value = "";
          } else if (isInList) {
            console.log("Preserving text in list item:", textNode.value);
          }
        }
      });
    });
    return tree;
  };

  // Define custom components for ReactMarkdown
  const customComponents = React.useMemo<Components>(() => {
    return {
      // Ensure all heading levels are clickable
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

      // Make bold text clickable
      strong: ({ children, ...props }) => (
        <MarkdownBold onElementClick={onElementClick} {...props}>
          {children}
        </MarkdownBold>
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
      <ReactMarkdown
        components={customComponents}
        remarkPlugins={[remarkGfm, remarkMath]} // Prioritize remarkGfm for lists, then math
        rehypePlugins={[rehypeKatex]} // Ensure KaTeX renders math after remark processing
        transformAst={cleanMathNodes} // Clean up raw math text post-rendering
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default EnhancedMarkdown;