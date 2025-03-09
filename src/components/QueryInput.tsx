import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useChatState, useChatDispatch } from "../hooks/useChatContext";
import { ApiClientRegistryImpl, apiClientRegistry } from "../services/api/ApiClientRegistry";
import { Response } from "../interfaces/core";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChevronDown, Send } from "lucide-react";
import { getModelByValue } from "../lib/models";

interface QueryInputProps {
  disabled: boolean;
}

const QueryInput: React.FC<QueryInputProps> = ({ disabled }) => {
  const [query, setQuery] = useState("");
  const { selectedModel } = useChatState();
  const dispatch = useChatDispatch();

  // Sample recommended queries
  const recommendedQueries = [
    "What's your next wabbit hole?",
    "Explain quantum computing",
    "What is the history of the internet?",
  ];

  const handleSubmit = async (e: React.FormEvent | React.KeyboardEvent, overrideQuery?: string) => {
    e.preventDefault();
    const finalQuery = overrideQuery || query;
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

      // Use provider-specific API key
      const apiKey =
        provider === "openrouter"
          ? import.meta.env.VITE_OPENROUTER_API_KEY
          : import.meta.env.VITE_GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error(`No API key found for provider: ${provider}`);
      }
      
      console.log(`Using ${provider} API key (first 5 chars): ${apiKey.substring(0, 5)}...`);

      const apiClient = apiClientRegistry.get(provider, apiKey);
      if (!apiClient) {
        throw new Error(`No API client found for provider: ${provider}`);
      }

      const responseText = await apiClient.generateResponse(finalQuery, {
        model: selectedModel,
      });

      const newResponse: Response = {
        query: finalQuery,
        response: responseText,
        model: selectedModel,
        timestamp: Date.now(),
      };

      dispatch({ type: "ADD_RESPONSE", payload: newResponse });
      if (!overrideQuery) setQuery("");
    } catch (error) {
      console.error("Error generating response:", error);
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      handleSubmit(e);
    }
  };

  const handleDropdownSelect = (selectedQuery: string) => {
    handleSubmit({ preventDefault: () => {} } as React.FormEvent, selectedQuery);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center space-x-2"
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={disabled}
            className="text-muted-foreground hover:text-primary"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          {recommendedQueries.map((recQuery, index) => (
            <DropdownMenuItem
              key={index}
              onClick={() => handleDropdownSelect(recQuery)}
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
        onKeyPress={handleKeyPress}
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
        >
          <Send className="h-4 w-4" />
        </Button>
      )}
    </form>
  );
};

export default QueryInput;