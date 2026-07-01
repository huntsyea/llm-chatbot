import React from "react";
import ModelSelector from "./ModelSelector";
import { useChatState, useChatDispatch } from "../hooks/useChatContext";
import { GeminiModelConfig } from "../interfaces/core";

/**
 * ModelControls component manages model selection UI
 *
 * @returns React component for model controls
 */
const ModelControls: React.FC = () => {
  const { selectedModel, isGeminiModel, geminiConfig } = useChatState();
  const dispatch = useChatDispatch();

  const handleModelSelect = (model: string, isGemini: boolean): void => {
    dispatch({ type: "SET_MODEL", payload: { model, isGemini } });
  };

  const handleGeminiConfigChange = (config: GeminiModelConfig): void => {
    dispatch({ type: "SET_GEMINI_CONFIG", payload: config });
  };

  return (
    <ModelSelector
      selectedModel={selectedModel}
      isGeminiModel={isGeminiModel}
      geminiConfig={geminiConfig}
      onSelectModel={handleModelSelect}
      onGeminiConfigChange={handleGeminiConfigChange}
    />
  );
};

export default ModelControls;
