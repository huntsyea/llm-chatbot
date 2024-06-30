import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatMessage = ({ message }) => {
  return (
    <div className="flex justify-start w-full">
      <div className="bg-secondary justify-start text-secondary-foreground rounded-lg px-4 py-2 max-w-[100%]">
        <ReactMarkdown 
          children={message.content}
          remarkPlugins={[remarkGfm]}
          className="markdown-content"
        />
      </div>
    </div>
  );
};

export default ChatMessage;