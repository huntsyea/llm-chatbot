import React from "react";
import { Response } from "../interfaces/core";
import EnhancedMarkdown from "./markdown/EnhancedMarkdown";
import { useChatState } from "../hooks/useChatContext";
import { createTopicClickHandler } from "../lib/topicHandler";
import { ApiClientRegistryImpl } from "../services/api/ApiClientRegistry";
import { getModelByValue } from "../lib/models";

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

  /** Handler for topic clicks */
  onTopicClick: (topic: string) => Promise<void>;
}

/**
 * MarkdownMessage component renders markdown content with clickable headings
 *
 * This component displays a chat message with rich markdown formatting and
 * makes headings clickable to drill down into specific topics using a provider-agnostic API client.
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
  const { selectedModel } = useChatState();

  // Fetch the API client for the selected model's provider from the registry
  const apiClientRegistry = new ApiClientRegistryImpl();
  const modelDef = getModelByValue(selectedModel);
  const provider = modelDef ? modelDef.provider : "unknown";
  const apiKey =
    provider === "openrouter"
      ? import.meta.env.VITE_OPENROUTER_API_KEY
      : import.meta.env.VITE_GEMINI_API_KEY;
  const apiClient = apiClientRegistry.get(provider, apiKey || "");

  if (!apiClient) {
    console.error(`No API client found for provider: ${provider} (model: ${selectedModel})`);
  }

  // Handle element click events from the markdown
  const handleElementClick = (element: string, text: string) => {
    console.log("Element clicked:", element, "Text:", text);
    if (element === "heading" && apiClient) {
      // Create topic handler with captured state and API client
      const handleTopicClick = createTopicClickHandler({
        response,
        setTopicLoading,
        addResponse,
        apiClient,
        selectedModel,
      });

      console.log("Triggering onTopicClick for:", text);
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