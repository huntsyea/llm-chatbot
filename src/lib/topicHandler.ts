import { Response, ApiClient, ApiClientOptions } from "../interfaces/core";
import { researchSystemPrompt } from "./prompts";

/** Configuration options for the topic handler */
interface TopicHandlerConfig {
  response: Response;
  setTopicLoading: (isLoading: boolean) => void;
  addResponse: (response: Response) => void;
  apiClient: ApiClient;
  selectedModel: string;
}

/**
 * Creates a topic click handler for generating topic-specific responses
 *
 * @param config - Configuration object containing response context, callbacks, and API client
 * @returns A function that handles topic clicks
 */
export function createTopicClickHandler({
  response,
  setTopicLoading,
  addResponse,
  apiClient,
  selectedModel,
}: TopicHandlerConfig) {
  return async (topic: string) => {
    console.log("Topic click handler called for:", topic, "Current Model:", selectedModel);

    // Set the topic-specific loading state
    setTopicLoading(true);

    try {
      // Use the ApiClient's generateTopicResponse if available, otherwise fall back to generateResponse
      const options: ApiClientOptions = {
        model: selectedModel,
        systemPrompt: researchSystemPrompt,
      };

      let topicResponse: string;
      if (apiClient.generateTopicResponse) {
        topicResponse = await apiClient.generateTopicResponse(
          topic,
          response.query,
          options
        );
      } else {
        const prompt = `Based on the previous query: "${response.query}", provide a detailed response about "${topic}".`;
        topicResponse = await apiClient.generateResponse(prompt, options);
      }
      console.log("Topic response:", topicResponse);

      // Add the new topic response
      const newResponse: Response = {
        query: topic,
        response: topicResponse,
        model: selectedModel,
        timestamp: Date.now(),
        metadata: {
          parentResponseId: response.timestamp,
          isTopic: true,
          topic,
        },
      };
      console.log("Adding new response:", newResponse);
      addResponse(newResponse);
    } catch (error) {
      console.error("Error fetching topic-specific response:", error);
      const errorResponse: Response = {
        query: topic,
        response: `Error: Failed to fetch topic-specific response for "${topic}"`,
        model: selectedModel,
        timestamp: Date.now(),
        metadata: {
          parentResponseId: response.timestamp,
          isTopic: true,
          topic,
          error: String(error),
        },
      };
      addResponse(errorResponse);
    } finally {
      // Reset the topic-specific loading state
      setTopicLoading(false);
      console.log("Topic loading state reset");
    }
  };
}