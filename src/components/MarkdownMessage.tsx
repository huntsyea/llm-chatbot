import React from "react";
import { Response } from "../interfaces/core";
import EnhancedMarkdown from "./markdown/EnhancedMarkdown";
import { createTopicClickHandler } from "../lib/topicHandler";
import { apiClientRegistry } from "../services/api/ApiClientRegistry";
import { getModelByValue } from "../lib/models";
import { getProviderApiKey } from "../lib/providerConfig";

/** Props for the MarkdownMessage component */
interface MarkdownMessageProps {
  /** The markdown message content to display */
  message: string;

  /** The response context for generating topic-specific responses */
  response: Response;

  /** Function to set topic loading state */
  setTopicLoading: (isLoading: boolean) => void;

  /** Function to add a new response */
  addResponse: (response: Response) => void;
}

/**
 * MarkdownMessage component renders markdown content with clickable headings
 *
 * This component displays a chat message with rich markdown formatting and
 * makes headings clickable to drill down into specific topics using a
 * provider-agnostic API client.
 *
 * @param props - Component props
 * @returns React component for displaying chat messages
 */
const MarkdownMessage: React.FC<MarkdownMessageProps> = ({
  message,
  response,
  setTopicLoading,
  addResponse,
}) => {
  // Fetch the API client for the response model's provider from the registry
  const modelDef = getModelByValue(response.model);
  const provider = modelDef?.provider;
  const apiKey = provider ? getProviderApiKey(provider) : undefined;

  const apiClient =
    provider && apiKey ? apiClientRegistry.get(provider, apiKey) : undefined;

  // Handle element click events from the markdown
  const handleElementClick = (element: string, text: string) => {
    if (element === "heading" && apiClient) {
      // Create topic handler with captured state and API client
      const handleTopicClick = createTopicClickHandler({
        response,
        setTopicLoading,
        addResponse,
        apiClient,
        selectedModel: response.model,
      });

      handleTopicClick(text);
    }
  };

  return (
    <div className="prose dark:prose-invert max-w-none">
      <EnhancedMarkdown
        content={message}
        onElementClick={handleElementClick}
        normalize={true}
        normalizationOptions={{
          standardizeHeadings: true,
          enforceListFormatting: true,
          standardizeTables: true,
          sanitizeHTML: true,
          enforceCodeBlocks: true,
        }}
        enableCodeCopy={true}
      />
    </div>
  );
};

export default MarkdownMessage;
