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

    return normalizedMarkdown;
  }

  /**
   * Standardize heading format in markdown
   *
   * @param markdown - The markdown content to process
   * @returns Markdown with standardized headings
   */
  private standardizeHeadings(markdown: string): string {
    // Convert underlined headings to # syntax
    // Example: Convert "Heading\n=======" to "# Heading"
    let result = markdown.replace(/^(.+)\n=+$/gm, "# $1");

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
    const unorderedListItem = /^(\s*)([*+-])\s*(\S.*)$/;
    const orderedListItem = /^(\s*)(\d+\.)\s*(\S.*)$/;

    return markdown
      .split("\n")
      .map((line) => {
        const unorderedMatch = unorderedListItem.exec(line);
        if (unorderedMatch) {
          const [, indent, marker, content] = unorderedMatch;
          const markerRun = `${marker}${content.trim()}`;

          if (/^[-*_]{3,}$/.test(markerRun)) {
            return line;
          }

          return `${indent}- ${content}`;
        }

        const orderedMatch = orderedListItem.exec(line);
        if (orderedMatch) {
          const [, indent, marker, content] = orderedMatch;
          return `${indent}${marker} ${content}`;
        }

        return line;
      })
      .join("\n");
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

      // Preserve block separation so following fenced code or headings do not
      // get parsed as part of the table block.
      return [headerRow, separatorRow, ...dataRows].join("\n") + "\n";
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
   * Ensure code blocks use proper fencing and language tags
   *
   * @param markdown - The markdown content to process
   * @returns Markdown with standardized code blocks
   */
  private enforceCodeBlocks(markdown: string): string {
    let result = markdown;

    // Convert indented code blocks to fenced code blocks
    // Find blocks that are indented with 4 spaces or a tab
    const indentedCodeBlockRegex = /(?:^(?:[ ]{4}|\t).*[\r\n]+)+/gm;

    result = result.replace(indentedCodeBlockRegex, (match) => {
      // Remove the indentation from each line
      const code = match.replace(/^(?:[ ]{4}|\t)/gm, "");
      // Wrap in fenced code block
      return "```\n" + code.trim() + "\n```\n";
    });

    // Standardize fenced code blocks
    // Ensure consistent syntax for code blocks (prefer ``` over ~~~)
    result = result.replace(/^~~~(.*)$/gm, "```$1");

    // Ensure language tag is lowercase if present
    result = result.replace(/^```([A-Z][a-zA-Z]*)$/gm, (_match, lang) => {
      return "```" + lang.toLowerCase();
    });

    return result;
  }
}
