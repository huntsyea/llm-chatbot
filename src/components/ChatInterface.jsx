import React from 'react';
import { ChatProvider } from './ChatContext';
import InputArea from './InputArea';
import ResponseList from './ResponseList';

const ChatInterface = () => {
  return (
    <ChatProvider>
      <div className="space-y-4">
        <InputArea />
        <ResponseList />
      </div>
    </ChatProvider>
  );
};

export default ChatInterface;