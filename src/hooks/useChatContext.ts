import { useContext } from "react";
import { Dispatch } from "react";
import {
  ChatContext,
  ChatState,
  ChatAction,
} from "../components/ChatContextProvider";

/**
 * Hook for accessing chat state
 *
 * @returns Current chat state
 * @throws Error if used outside ChatProvider
 */
export function useChatState(): ChatState {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatState must be used within a ChatProvider");
  }
  return context.state;
}

/**
 * Hook for accessing chat dispatch function
 *
 * @returns Chat dispatch function
 * @throws Error if used outside ChatProvider
 */
export function useChatDispatch(): Dispatch<ChatAction> {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatDispatch must be used within a ChatProvider");
  }
  return context.dispatch;
}
