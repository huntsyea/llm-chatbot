/**
 * Markdown Normalizer for the Wabbit application
 *
 * This service provides functionality for normalizing and processing markdown
 * content from different LLM sources to ensure consistency in formatting and
 * presentation.
 */

/** Options for markdown normalization */
export interface MarkdownNormalizationOptions {
  /** Convert inconsistent heading styles to standard format */
  standardizeHeadings?: boolean;

  /** Enforce consistent list formatting */
  enforceListFormatting?: boolean;

  /** Standardize table formatting */
  standardizeTables?: boolean;

  /** Remove or sanitize potentially unsafe HTML */
  sanitizeHTML?: boolean;

  /** Ensure code blocks use proper fencing and language tags */
  enforceCodeBlocks?: boolean;

  /** Convert standalone bolded lines to ## headings */
  convertBoldedToHeadings?: boolean;

  /** Extension point: additional normalization options */
  [key: string]: unknown;
}

/** Service for normalizing and processing markdown content */
export class MarkdownService {
  /**
   * Normalize markdown content according to specified options
   *
   * @param markdown - The markdown content to normalize
   * @param options - Options to control normalization behavior
   * @returns Normalized markdown string
   */
  normalizeMarkdown(
    markdown: string,
    options: MarkdownNormalizationOptions = {},
  ): string {
    const {
      standardizeHeadings = true,
      enforceListFormatting = true,
      standardizeTables = true,
      sanitizeHTML = true,
      enforceCodeBlocks = true,
      convertBoldedToHeadings = false,
    } = options;

    let normalizedMarkdown = markdown;

    // Apply standardization based on options
    if (standardizeHeadings) {
      normalizedMarkdown = this.standardizeHeadings(normalizedMarkdown);
    }

    if (enforceListFormatting) {
      normalizedMarkdown = this.enforceListFormatting(normalizedMarkdown);
    }

    if (standardizeTables) {
      normalizedMarkdown = this.standardizeTables(normalizedMarkdown);
    }

    if (sanitizeHTML) {
      normalizedMarkdown = this.sanitizeHTML(normalizedMarkdown);
    }

    if (enforceCodeBlocks) {
      normalizedMarkdown = this.enforceCodeBlocks(normalizedMarkdown);
    }

    if (convertBoldedToHeadings) {
      normalizedMarkdown = this.convertBoldedLinesToHeadings(normalizedMarkdown);
    }

    return normalizedMarkdown.trim(); // Ensure no trailing whitespace
  }

  /**
   * Standardize heading format in markdown
   *
   * @param markdown - The markdown content to process
   * @returns Markdown with standardized headings
   */
  private standardizeHeadings(markdown: string): string {
    // Convert numbered headings (e.g., "1. Elliptic Curves:") to ## syntax
    let result = markdown.replace(/^(\d+\.\s+(.+?):)$/gm, "## $2");

    // Convert underlined headings to # syntax
    // Example: Convert "Heading\n=======" to "# Heading"
    result = result.replace(/^(.+)\n=+$/gm, "# $1");

    // Convert underlined subheadings to ## syntax
    // Example: Convert "Subheading\n--------" to "## Subheading"
    result = result.replace(/^(.+)\n-+$/gm, "## $1");

    // Ensure space after # characters
    // Example: Convert "#Heading" to "# Heading"
    result = result.replace(/^(#+)([^#\s])/gm, "$1 $2");

    return result;
  }

  /**
   * Enforce consistent list formatting
   *
   * @param markdown - The markdown content to process
   * @returns Markdown with standardized list formatting
   */
  private enforceListFormatting(markdown: string): string {
    // Ensure consistent unordered list markers (use - instead of mixed */+/-)
    let result = markdown.replace(/^(\s*)[*+](\s)/gm, "$1-$2");

    // Ensure space after list markers
    result = result.replace(/^(\s*-\S)/gm, "$1 ");
    result = result.replace(/^(\s*\d+\.\S)/gm, "$1 ");

    // Preserve math expressions within lists and avoid overzealous deduplication
    const lines = result.split("\n");
    const seenLines = new Set<string>();
    result = lines
      .map((line) => {
        const match = line.match(/^(\s*[-|\d+\.]\s*)(.+)$/);
        if (match) {
          const [, prefix, content] = match;
          // Skip deduplication for lines with math to prevent removal
          if (content.match(/\$|∏|ε/)) {
            return line;
          }
          const lineKey = `${prefix}${content}`.trim();
          if (seenLines.has(lineKey)) {
            return ""; // Remove duplicate
          }
          seenLines.add(lineKey);
        }
        return line;
      })
      .filter((line) => line.trim() !== "")
      .join("\n");

    // Remove empty list items
    result = result.replace(/^\s*-\s*$/gm, "");

    return result.trim();
  }

  /**
   * Standardize table formatting in markdown
   *
   * @param markdown - The markdown content to process
   * @returns Markdown with standardized tables
   */
  private standardizeTables(markdown: string): string {
    // Find table sections in the markdown
    const tableRegex =
      /^\|(.+)\|[\r\n]+\|([-:\s|]+)\|[\r\n]+((?:\|.+\|[\r\n]+)+)/gm;

    return markdown.replace(tableRegex, (match) => {
      // Split the table into lines
      const lines = match.split(/[\r\n]+/);

      if (lines.length < 3) return match; // Not a valid table

      // Process header row
      const headerRow = lines[0].trim();

      // Process separator row (ensure proper alignment markers)
      let separatorRow = lines[1].trim();
      const columns = headerRow.split("|").filter(Boolean).length;

      // Rebuild separator row with proper formatting
      const separatorCells = separatorRow.split("|").filter(Boolean);
      const formattedSeparatorCells = separatorCells.map((cell) => {
        const trimmed = cell.trim();
        if (trimmed.startsWith(":") && trimmed.endsWith(":")) {
          return " :---: "; // Center align
        } else if (trimmed.endsWith(":")) {
          return " ---: "; // Right align
        } else {
          return " --- "; // Left align (default)
        }
      });

      // Ensure we have the right number of separator cells
      while (formattedSeparatorCells.length < columns) {
        formattedSeparatorCells.push(" --- ");
      }

      separatorRow = "|" + formattedSeparatorCells.join("|") + "|";

      // Process data rows
      const dataRows = lines
        .slice(2)
        .map((row) => {
          if (!row.trim()) return "";

          // Split the row into cells
          const cells = row.split("|").filter(Boolean);

          // Ensure each cell has proper spacing
          const formattedCells = cells.map((cell) => ` ${cell.trim()} `);

          // Ensure we have the right number of cells
          while (formattedCells.length < columns) {
            formattedCells.push("  ");
          }

          return "|" + formattedCells.join("|") + "|";
        })
        .filter(Boolean);

      // Rebuild the table
      return [headerRow, separatorRow, ...dataRows].join("\n");
    });
  }

  /**
   * Sanitize HTML content in markdown
   *
   * @param markdown - The markdown content to process
   * @returns Markdown with sanitized HTML
   */
  private sanitizeHTML(markdown: string): string {
    // Remove potentially unsafe HTML tags
    // This is a basic implementation and should be expanded based on security requirements
    const sanitized = markdown.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      "",
    );
    return sanitized;
  }

  /**
   * Ensure code blocks use proper fencing and language tags, while preserving nested lists and math
   *
   * @param markdown - The markdown content to process
   * @returns Markdown with standardized code blocks
   */
  private enforceCodeBlocks(markdown: string): string {
    let result = markdown;
    const lines = result.split("\n");
    let i = 0;
    const newLines: string[] = [];

    while (i < lines.length) {
      const line = lines[i];
      // Match lines that are indented with 4 spaces or a tab, but exclude list items and math
      const indentedCodeBlockMatch = line.match(
        /^(?![ ]{0,3}(?:[-*+]|\d+\.|\$.*\$))([ ]{4}|\t)(.*)$/
      );

      if (indentedCodeBlockMatch) {
        const [, indent, content] = indentedCodeBlockMatch;
        const codeLines: string[] = [content.trim()];
        let j = i + 1;

        // Collect consecutive indented lines, excluding list items and math
        while (j < lines.length) {
          const nextLine = lines[j];
          const nextMatch = nextLine.match(
            /^(?![ ]{0,3}(?:[-*+]|\d+\.|\$.*\$))([ ]{4}|\t)(.*)$/
          );
          if (nextMatch) {
            codeLines.push(nextMatch[2].trim());
            j++;
          } else {
            break;
          }
        }

        // Create a fenced code block
        const codeBlock = "```\n" + codeLines.join("\n") + "\n```";
        newLines.push(codeBlock);
        i = j; // Move the index to the next unprocessed line
      } else {
        newLines.push(line);
        i++;
      }
    }

    result = newLines.join("\n");

    // Standardize fenced code blocks
    // Ensure consistent syntax for code blocks (prefer ``` over ~~~)
    result = result.replace(/^~~~(.*)$/gm, "```$1");

    // Ensure language tag is lowercase if present
    result = result.replace(/^```([A-Z][a-zA-Z]*)$/gm, (match, lang) => {
      return "```" + lang.toLowerCase();
    });

    // Add empty line after code blocks if not present
    result = result.replace(/```\n(?![\r\n])/gm, "```\n\n");

    return result;
  }

  /**
   * Convert standalone bolded lines to ## headings
   *
   * @param markdown - The markdown content to process
   * @returns Markdown with bolded standalone lines converted to headings
   */
  private convertBoldedLinesToHeadings(markdown: string): string {
    // Match lines that are entirely bolded (wrapped in **), standalone (not within paragraphs or lists)
    const boldedLineRegex = /^(\*\*[^\n*]+(?: [^\n*]+)*\*\*)$/gm;

    return markdown.replace(boldedLineRegex, (match, boldedText) => {
      // Remove the bold markers and prepend with ##
      const headingText = boldedText.slice(2, -2).trim();
      return `## ${headingText}`;
    });
  }
} 