import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import ModelSelector from './ModelSelector';
import { useChatState, useChatDispatch } from './ChatContext';
import { getLLMResponse } from '../api/openRouter';

const InputArea = () => {
  const [input, setInput] = useState("");
  const { isLoading, selectedModel } = useChatState();
  const dispatch = useChatDispatch();

  const handleSend = async (e) => {
    if (e.key === 'Enter' && input.trim()) {
      const newUserMessage = input.trim();
      setInput("");
      dispatch({ type: 'SET_CURRENT_QUERY', payload: newUserMessage });
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        const aiResponse = await getLLMResponse(newUserMessage, selectedModel);
        dispatch({
          type: 'SET_RESPONSES',
          payload: [{
            query: newUserMessage,
            messages: [{ type: "ai", content: aiResponse }]
          }]
        });
      } catch (error) {
        console.error("Error fetching AI response:", error);
        dispatch({
          type: 'SET_RESPONSES',
          payload: [{
            query: newUserMessage,
            messages: [{ type: "ai", content: "Sorry, an error occurred while processing your request." }]
          }]
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  };

  return (
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-md">
            <CardContent className="flex p-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleSend}
            placeholder="What's your next wabbit hole?"
            className="flex-grow border-none shadow-none mr-2"
            disabled={isLoading}
          />
          <ModelSelector
            selectedModel={selectedModel}
            onSelectModel={(model) => dispatch({ type: 'SET_MODEL', payload: model })}
          />
        </CardContent>
      </Card>
    </div>
    </div>
  );
};

export default InputArea;