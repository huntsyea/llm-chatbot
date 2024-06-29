import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ChatMessage from './ChatMessage';
import { getLLMResponse } from '../api/openRouter';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { type: 'user', content: input }]);

    // Call the actual API
    const aiResponse = await getLLMResponse(input);

    setMessages(prev => [...prev, { type: 'ai', content: aiResponse }]);
    setInput('');
  };

  const handleTopicClick = (topic) => {
    setInput(`Tell me more about ${topic}`);
  };

  return (
    <>
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <ChatMessage 
            key={index} 
            message={msg} 
            onTopicClick={handleTopicClick} 
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-background border-t border-border">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow"
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Send
          </Button>
        </div>
      </div>
    </>
  );
};

export default ChatInterface;