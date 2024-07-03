import React, { createContext, useContext, useReducer } from 'react';

const ChatContext = createContext();

const initialState = {
  responses: [],
  currentQuery: '',
  isLoading: false,
  selectedModel: "meta-llama/llama-3-8b-instruct:free",
};

function chatReducer(state, action) {
  switch (action.type) {
    case 'SET_RESPONSES':
      return { ...state, responses: action.payload };
    case 'ADD_RESPONSE':
      return { ...state, responses: [...state.responses, action.payload] };
    case 'SET_CURRENT_QUERY':
      return { ...state, currentQuery: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_MODEL':
      return { ...state, selectedModel: action.payload };
    default:
      return state;
  }
}

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatState() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatState must be used within a ChatProvider');
  }
  return context.state;
}

export function useChatDispatch() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatDispatch must be used within a ChatProvider');
  }
  return context.dispatch;
}