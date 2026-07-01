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

const getNodeText = (node: React.ReactNode): string => {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getNodeText).join("");
  }

  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return getNodeText(node.props.children);
  }

  return "";
};

const getCodeLanguage = (node: React.ReactNode): string => {
  if (Array.isArray(node)) {
    return node.map(getCodeLanguage).find(Boolean) ?? "";
  }

  if (React.isValidElement<{ className?: string }>(node)) {
    const className = node.props.className ?? "";
    const match = /language-(\w+)/.exec(className);
    return match ? match[1] : "";
  }

  return "";
};

const omitMarkdownNode = <Props extends { node?: unknown }>(
  props: Props,
): Omit<Props, "node"> => {
  const propsWithoutNode = { ...props };
  delete propsWithoutNode.node;
  return propsWithoutNode;
};

const copyTextToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "true");
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, text.length);

    try {
      const copied = document.execCommand("copy");
      if (!copied) {
        throw new Error("Fallback copy command failed");
      }
    } finally {
      document.body.removeChild(textArea);
    }
  }
};

const selectCodeText = (element: HTMLElement | null): boolean => {
  if (!element) {
    return false;
  }

  const selection = window.getSelection();
  if (!selection) {
    return false;
  }

  const range = document.createRange();
  range.selectNodeContents(element);
  selection.removeAllRanges();
  selection.addRange(range);
  element.focus({ preventScroll: true });
  return selection.toString().length > 0;
};

interface MarkdownCodeBlockProps {
  children: React.ReactNode;
  enableCodeCopy: boolean;
  language: string;
  preProps: React.HTMLAttributes<HTMLPreElement>;
}

const MarkdownCodeBlock: React.FC<MarkdownCodeBlockProps> = ({
  children,
  enableCodeCopy,
  language,
  preProps,
}) => {
  const [copyLabel, setCopyLabel] = React.useState("Copy");
  const preRef = React.useRef<HTMLPreElement>(null);
  const code = getNodeText(children).replace(/\n$/, "");

  const handleCopyClick = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      await copyTextToClipboard(code);
      setCopyLabel("Copied");
    } catch {
      setCopyLabel(selectCodeText(preRef.current) ? "Selected" : "Copy failed");
    }

    window.setTimeout(() => setCopyLabel("Copy"), 1500);
  };

  return (
    <div className="rounded-md bg-muted overflow-hidden">
      {(language || (enableCodeCopy && code)) && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border">
          <span className="text-xs text-muted-foreground">
            {language || "code"}
          </span>
          {enableCodeCopy && code && (
            <button
              type="button"
              onClick={handleCopyClick}
              onPointerDown={(event) => event.stopPropagation()}
              aria-label="Copy code block"
              className="bg-primary/10 hover:bg-primary/20 text-primary rounded px-2 py-1 text-xs transition-colors"
            >
              {copyLabel}
            </button>
          )}
        </div>
      )}
      <pre
        ref={preRef}
        tabIndex={-1}
        className="p-4 overflow-x-auto"
        {...preProps}
      >
        {children}
      </pre>
    </div>
  );
};

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
  const headerText = getNodeText(children).trim();
  const headingProps = omitMarkdownNode(props);

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
    onElementClick?.("heading", headerText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    onElementClick?.("heading", headerText);
  };

  const headingTags = {
    1: "h1",
    2: "h2",
    3: "h3",
    4: "h4",
    5: "h5",
    6: "h6",
  } as const satisfies Record<MarkdownHeadingProps["level"], React.ElementType>;
  const HeadingTag = headingTags[level];

  return (
    <HeadingTag
      className={className}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      {...headingProps}
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
        <MarkdownHeading
          level={1}
          onElementClick={onElementClick}
          {...omitMarkdownNode(props)}
        >
          {children}
        </MarkdownHeading>
      ),
      h2: ({ children, ...props }) => (
        <MarkdownHeading
          level={2}
          onElementClick={onElementClick}
          {...omitMarkdownNode(props)}
        >
          {children}
        </MarkdownHeading>
      ),
      h3: ({ children, ...props }) => (
        <MarkdownHeading
          level={3}
          onElementClick={onElementClick}
          {...omitMarkdownNode(props)}
        >
          {children}
        </MarkdownHeading>
      ),
      h4: ({ children, ...props }) => (
        <MarkdownHeading
          level={4}
          onElementClick={onElementClick}
          {...omitMarkdownNode(props)}
        >
          {children}
        </MarkdownHeading>
      ),
      h5: ({ children, ...props }) => (
        <MarkdownHeading
          level={5}
          onElementClick={onElementClick}
          {...omitMarkdownNode(props)}
        >
          {children}
        </MarkdownHeading>
      ),
      h6: ({ children, ...props }) => (
        <MarkdownHeading
          level={6}
          onElementClick={onElementClick}
          {...omitMarkdownNode(props)}
        >
          {children}
        </MarkdownHeading>
      ),

      pre: ({ children, ...props }) => {
        const language = getCodeLanguage(children);
        const preProps = omitMarkdownNode(props);

        return (
          <MarkdownCodeBlock
            enableCodeCopy={enableCodeCopy}
            language={language}
            preProps={preProps}
          >
            {children}
          </MarkdownCodeBlock>
        );
      },

      code: ({ className, children, ...props }) => (
        <code
          className={
            className ? className : "bg-muted px-1 py-0.5 rounded text-sm"
          }
          {...omitMarkdownNode(props)}
        >
          {children}
        </code>
      ),

      // Customized table component
      table: ({ children, ...props }) => (
        <div className="overflow-x-auto my-4">
          <table
            className="w-full border-collapse"
            {...omitMarkdownNode(props)}
          >
            {children}
          </table>
        </div>
      ),

      // Customized table header
      th: ({ children, ...props }) => (
        <th
          className="border px-4 py-2 bg-muted font-bold text-left"
          {...omitMarkdownNode(props)}
        >
          {children}
        </th>
      ),

      // Customized table cell
      td: ({ children, ...props }) => (
        <td className="border px-4 py-2" {...omitMarkdownNode(props)}>
          {children}
        </td>
      ),

      // Customized blockquote
      blockquote: ({ children, ...props }) => (
        <blockquote
          className="border-l-4 border-primary/50 pl-4 italic my-4"
          {...omitMarkdownNode(props)}
        >
          {children}
        </blockquote>
      ),

      // Customized list items
      li: ({ children, ...props }) => (
        <li className="my-1" {...omitMarkdownNode(props)}>
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
          {...omitMarkdownNode(props)}
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
