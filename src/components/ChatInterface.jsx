import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import ChatMessage from './ChatMessage';
import { getLLMResponse } from '../api/openRouter';
import ModelSelector from './ModelSelector';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("meta-llama/llama-3-8b-instruct:free");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    if (e.key === 'Enter' && input.trim()) {
      const newUserMessage = { type: "user", content: input.trim() };
      setMessages(prev => [...prev, newUserMessage]);
      setInput("");
      
      try {
        const aiResponse = await getLLMResponse(input.trim(), selectedModel);
        setMessages(prev => [...prev, { type: "ai", content: aiResponse }]);
      } catch (error) {
        console.error("Error fetching AI response:", error);
        // Handle error (e.g., show error message to user)
      }
    }
  };

  const latestUserMessage = messages.filter(msg => msg.type === "user").pop();

  return (
    <div className="w-full max-w-3xl space-y-4">
      <Card className="shadow-m">
        <CardContent className="p-2 flex items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleSend}
            placeholder="What's your next wabbit hole?"
            className="w-full border-none shadow-none"
          />
          <ModelSelector selectedModel={selectedModel} onSelectModel={setSelectedModel} />
        </CardContent>
      </Card>

      <Card className="overflow-hidden flex flex-col" style={{ height: "calc(100vh - 12rem)" }}>
        {latestUserMessage && (
          <div className="bg-gray-100 p-4 border-b">
            <p className="text-center">{latestUserMessage.content}</p>
          </div>
        )}
        <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.filter(msg => msg.type === "ai").map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatInterface;