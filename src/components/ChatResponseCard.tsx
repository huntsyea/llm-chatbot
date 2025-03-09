import React from "react";
import MarkdownMessage from "./MarkdownMessage";
import { Response } from "../interfaces/core";
import { useChatState, useChatDispatch } from "../hooks/useChatContext";
import { createTopicClickHandler } from "../lib/topicHandler";
import { ApiClientRegistryImpl } from "../services/api/ApiClientRegistry";
import { getModelByValue } from "../lib/models";

/** Props for the ChatResponseCard component */
interface ChatResponseCardProps {
  /** The response to display */
  response: Response;
  /** Handler for initiating drag from this card */
  onDragStart?: (clientX: number) => void;
  /** Index of this card in the carousel */
  cardIndex?: number;
}

/**
 * ChatResponseCard component displays a single response card
 *
 * This component shows the user query and AI response and handles topic click
 * interactions via the MarkdownMessage component.
 */
const ChatResponseCard: React.FC<ChatResponseCardProps> = ({ response, onDragStart, cardIndex }) => {
  const { isGeminiModel, selectedModel } = useChatState();
  const dispatch = useChatDispatch();

  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const lastDragPosition = React.useRef(0);
  const dragStartTime = React.useRef(0);
  const headerRef = React.useRef<HTMLDivElement>(null);

  const DRAG_THRESHOLD = 50; // px
  const VELOCITY_THRESHOLD = 0.5; // px/ms

  const setTopicLoading = (isLoading: boolean) => {
    console.log("Setting topic loading:", isLoading);
    dispatch({ type: "SET_TOPIC_LOADING", payload: isLoading });
  };

  const addResponse = (newResponse: Response) => {
    console.log("Adding new response:", newResponse);
    dispatch({ type: "ADD_RESPONSE", payload: newResponse });
  };

  const apiClientRegistry = new ApiClientRegistryImpl();
  const modelDef = getModelByValue(selectedModel);
  const provider = modelDef ? modelDef.provider : "unknown";
  const apiKey =
    provider === "openrouter"
      ? import.meta.env.VITE_OPENROUTER_API_KEY
      : import.meta.env.VITE_GEMINI_API_KEY;
  const apiClient = apiClientRegistry.get(provider, apiKey || "");

  const handleTopicClick = createTopicClickHandler({
    response,
    setTopicLoading,
    addResponse,
    apiClient: apiClient!,
    selectedModel,
  });

  const startDrag = React.useCallback((e: React.PointerEvent) => {
    if (e.button !== 0 || cardIndex === undefined || !onDragStart) return;
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.clientX);
    lastDragPosition.current = e.clientX;
    dragStartTime.current = Date.now();
    if (headerRef.current) {
      headerRef.current.setPointerCapture(e.pointerId);
    }
  }, [cardIndex, onDragStart]);

  const duringDrag = React.useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    lastDragPosition.current = e.clientX;
  }, [isDragging]);

  const endDrag = React.useCallback((e: React.PointerEvent) => {
    if (!isDragging || cardIndex === undefined || !onDragStart) return;
    const endTime = Date.now();
    const dragDuration = endTime - dragStartTime.current;
    const distance = lastDragPosition.current - startX;
    const velocity = Math.abs(distance) / dragDuration;

    setIsDragging(false);

    if (Math.abs(distance) > DRAG_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
      onDragStart(lastDragPosition.current);
    }

    if (headerRef.current) {
      headerRef.current.releasePointerCapture(e.pointerId);
    }
  }, [isDragging, startX, cardIndex, onDragStart]);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 overflow-hidden">
      {response.query && (
        <header
          ref={headerRef}
          className="border-b border-gray-200 dark:border-gray-700 cursor-grab"
          onPointerDown={startDrag}
          onPointerMove={duringDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {response.metadata?.isTopic ? "Wabbit Trail" : "Query"}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(response.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <h2 className="text-center text-sm sm:text-base break-words font-medium">
              {response.metadata?.isTopic ? `${response.metadata.topic}` : response.query}
            </h2>
          </div>
        </header>
      )}
      <div className="px-3 py-1 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
          <span className="flex-shrink-0">Model:</span>
          <span className="ml-1 truncate">{response.model}</span>
        </p>
      </div>
      <div className="flex-grow overflow-y-auto p-3 sm:p-4 space-y-4 scrollbar-thin">
        <MarkdownMessage
          message={response.response}
          response={response}
          setTopicLoading={setTopicLoading}
          addResponse={addResponse}
          onTopicClick={handleTopicClick}
        />
      </div>
    </div>
  );
};

export default ChatResponseCard; 