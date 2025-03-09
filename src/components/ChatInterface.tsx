import React from "react";
import { ChatProvider } from "./ChatContextProvider";
import InputArea from "./InputArea";
import ResponseList from "./ResponseList";

/**
 * ChatInterface component manages the main chat interface structure
 *
 * This component provides the chat context to its children and renders the
 * input area and response list within a container.
 *
 * @returns React component with chat interface
 */
const ChatInterface: React.FC = () => {
  return (
    <ChatProvider>
      {/* Container with proper spacing and max width of 1200px */}
      <div className="container-1200 space-y-6 py-4">
        <InputArea />
        <ResponseList />
      </div>
    </ChatProvider>
  );
};

export default ChatInterface;
