import * as React from "react";
import { createContext, useReducer, Dispatch } from "react";
import { Response } from "../interfaces/core";
import { GeminiModelConfig, GeminiApiOptions } from "../api/gemini";
/** Type definition for the chat state */
export interface ChatState {
  responses: Response[];
  currentQuery: string;
  isLoading: boolean;
  selectedModel: string;
  isGeminiModel: boolean;
  geminiConfig: GeminiApiOptions;
  isLoadingTopic: boolean;
  activeIndex: number;
  [key: string]: unknown; // Extension point
}

/** Type definition for chat actions */
export type ChatAction =
  | { type: "SET_RESPONSES"; payload: Response[] }
  | { type: "ADD_RESPONSE"; payload: Response }
  | { type: "SET_CURRENT_QUERY"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_TOPIC_LOADING"; payload: boolean }
  | { type: "SET_MODEL"; payload: { model: string; isGemini: boolean } }
  | { type: "SET_GEMINI_CONFIG"; payload: GeminiApiOptions }
  | { type: "SET_ACTIVE_INDEX"; payload: number }
  | { type: "SET_ACTIVE_INDEX"; payload: number }
  | { type: string; payload: unknown }; // Extension point

/** Default Gemini configuration */
export const defaultGeminiConfig: GeminiModelConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.9,
  maxOutputTokens: 2048,
};

/** Initial state for the chat context */
const initialState: ChatState = {
  responses: [],
  currentQuery: "",
  isLoading: false,
  selectedModel: "meta-llama/llama-3.3-70b-instruct:free",
  isGeminiModel: false,
  geminiConfig: defaultGeminiConfig,
  isLoadingTopic: false,
  activeIndex: 0,
};

/** Reducer for response-related state */
const responseReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case "SET_RESPONSES":
      return { ...state, responses: action.payload as Response[] };
    case "ADD_RESPONSE":
      return { ...state, responses: [...state.responses, action.payload as Response] };
    default:
      return state;
  }
};

/** Reducer for model-related state */
const modelReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case "SET_MODEL":
      return {
        ...state,
        selectedModel: (action.payload as { model: string; isGemini: boolean }).model,
        isGeminiModel: (action.payload as { model: string; isGemini: boolean }).isGemini,
      };
    case "SET_GEMINI_CONFIG":
      return { ...state, geminiConfig: action.payload as GeminiApiOptions };
    default:
      return state;
  }
};

/** Reducer for loading and query state */
const uiReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case "SET_CURRENT_QUERY":
      return { ...state, currentQuery: action.payload as string };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload as boolean };
    case "SET_TOPIC_LOADING":
      return { ...state, isLoadingTopic: action.payload as boolean };
    case "SET_ACTIVE_INDEX":
      return { ...state, activeIndex: action.payload as number };
    default:
      return state;
  }
};

/** Combined reducer for extensibility */
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  const reducers = [responseReducer, modelReducer, uiReducer];
  return reducers.reduce((currentState, reducer) => reducer(currentState, action), state);
}

/** Chat context */
export const ChatContext = createContext<{ state: ChatState; dispatch: Dispatch<ChatAction> } | undefined>(undefined);

/**
 * Chat provider component
 * @param children - Child components to wrap with context
 */
export function ChatProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
}

export type { Response } from "../interfaces/core";