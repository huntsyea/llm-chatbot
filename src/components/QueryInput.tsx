import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useChatState, useChatDispatch } from "../hooks/useChatContext";
import { apiClientRegistry } from "../services/api/ApiClientRegistry";
import { Response } from "../interfaces/core";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChevronDown, Send } from "lucide-react";
import { getModelByValue } from "../lib/models";
import { getProviderApiKey } from "../lib/providerConfig";

interface QueryInputProps {
  disabled: boolean;
}

const QueryInput: React.FC<QueryInputProps> = ({ disabled }) => {
  const [query, setQuery] = useState("");
  const [recommendationsOpen, setRecommendationsOpen] = useState(false);
  const { selectedModel, geminiConfig } = useChatState();
  const dispatch = useChatDispatch();

  // Sample recommended queries
  const recommendedQueries = [
    "What's your next wabbit hole?",
    "Explain quantum computing",
    "What is the history of the internet?",
  ];

  const submitQuery = async (
    rawQuery: string,
    clearInputOnSuccess: boolean,
  ) => {
    const finalQuery = rawQuery.trim();
    if (!finalQuery.trim() || disabled) return;

    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_CURRENT_QUERY", payload: finalQuery });

    try {
      // Get the provider name from the selected model
      const modelDef = getModelByValue(selectedModel);
      if (!modelDef) {
        throw new Error(`No model definition found for: ${selectedModel}`);
      }
      const provider = modelDef.provider;

      const apiKey = getProviderApiKey(provider);
      if (!apiKey) {
        throw new Error(`No API key found for provider: ${provider}`);
      }
      const apiClient = apiClientRegistry.get(provider, apiKey);
      if (!apiClient) {
        throw new Error(`No API client found for provider: ${provider}`);
      }

      const responseText = await apiClient.generateResponse(finalQuery, {
        ...(provider === "gemini" ? geminiConfig : {}),
        model: selectedModel,
      });

      const newResponse: Response = {
        query: finalQuery,
        response: responseText,
        model: selectedModel,
        timestamp: Date.now(),
      };

      dispatch({ type: "ADD_RESPONSE", payload: newResponse });
      if (clearInputOnSuccess) setQuery("");
    } catch (error) {
      const errorResponse: Response = {
        query: finalQuery,
        response: `Error: Failed to generate response - ${String(error)}`,
        model: selectedModel,
        timestamp: Date.now(),
      };
      dispatch({ type: "ADD_RESPONSE", payload: errorResponse });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submitQuery(query, true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      e.preventDefault();
      void submitQuery(query, true);
    }
  };

  const handleDropdownSelect = (selectedQuery: string) => {
    setRecommendationsOpen(false);
    void submitQuery(selectedQuery, false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center space-x-2"
    >
      <DropdownMenu
        open={recommendationsOpen}
        onOpenChange={setRecommendationsOpen}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={disabled}
            className="text-muted-foreground hover:text-primary"
            aria-label="Open recommended queries"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          {recommendedQueries.map((recQuery, index) => (
            <DropdownMenuItem
              key={index}
              onSelect={() => handleDropdownSelect(recQuery)}
              className="cursor-pointer"
            >
              {recQuery}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What's your next wabbit hole?"
        disabled={disabled}
        className="flex-grow border-none shadow-none mr-2"
      />
      {query.trim() && (
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          disabled={disabled}
          className="text-primary hover:text-primary/80"
          aria-label="Send query"
        >
          <Send className="h-4 w-4" />
        </Button>
      )}
    </form>
  );
};

export default QueryInput;
