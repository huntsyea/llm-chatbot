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
          className="markdown-content text-left text-sm"
          components={{
            p: ({ node, ...props }) => <p className="text-left mb-2 last:mb-0" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 last:mb-0 text-left" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 last:mb-0 text-left" {...props} />,
            h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-2" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-l font-bold mb-2" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-base font-bold mb-2" {...props} />,
            h4: ({ node, ...props }) => <h4 className="text-base font-bold mb-2" {...props} />,
            h5: ({ node, ...props }) => <h5 className="text-sm font-bold mb-2" {...props} />,
            h6: ({ node, ...props }) => <h6 className="text-xs font-bold mb-2" {...props} />,
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