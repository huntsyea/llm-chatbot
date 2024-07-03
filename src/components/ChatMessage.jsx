import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatMessage = ({ message, onTopicClick }) => {
  const createHeadingComponent = (level) => {
    return ({ node, ...props }) => {
      const HeadingTag = `h${level}`;
      return (
        <HeadingTag 
          className={`text-${level === 1 ? 'xl' : level === 2 ? 'lg' : 'base'} font-bold mb-2 cursor-pointer hover:text-primary`} 
          onClick={() => onTopicClick(node.children[0].value)}
          {...props} 
        />
      );
    };
  };

  const createBoldComponent = ({ node, ...props }) => {
    return (
      <strong
        className="cursor-pointer hover:text-primary"
        onClick={() => onTopicClick(node.children[0].value)}
        {...props}
      />
    );
  };

  return (
    <div className="flex justify-start w-full">
      <div className="bg-secondary justify-start text-secondary-foreground rounded-lg px-4 py-2 max-w-[100%]">
        <ReactMarkdown 
          children={message.content}
          remarkPlugins={[remarkGfm]}
          className="markdown-content text-left text-sm"
          components={{
            p: ({ node, ...props }) => <p className="text-left mb-2 last:mb-0" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 last:mb-0 text-left" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 last:mb-0 text-left" {...props} />,
            h1: createHeadingComponent(1),
            h2: createHeadingComponent(2),
            h3: createHeadingComponent(3),
            h4: createHeadingComponent(4),
            h5: createHeadingComponent(5),
            h6: createHeadingComponent(6),
            strong: createBoldComponent,
            a: ({ node, ...props }) => <a className="text-blue-500 hover:underline" {...props} />,
            code: ({ node, inline, ...props }) => 
              inline 
                ? <code className="bg-gray-200 rounded px-1 py-0.5" {...props} />
                : <code className="block bg-gray-200 rounded p-2 my-2 overflow-x-auto" {...props} />,
          }}
        />
      </div>
    </div>
  );
};

export default ChatMessage;