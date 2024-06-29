import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatMessage = ({ message, onTopicClick }) => {
  const isUser = message.type === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`rounded-lg px-4 py-2 max-w-[80%] ${
        isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
      }`}>
        <ReactMarkdown 
          children={message.content} 
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ href, children }) => (
              <a 
                href={href} 
                className="underline hover:text-accent-foreground" 
                onClick={(e) => {
                  e.preventDefault();
                  onTopicClick(href);
                }}
              >
                {children}
              </a>
            ),
            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />
          }}
        />
      </div>
    </div>
  );
};

export default ChatMessage;