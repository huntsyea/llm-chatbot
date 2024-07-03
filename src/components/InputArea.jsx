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
    <div className='max-w-4xl items-center'>
    <Card className="shadow-m">
      <CardContent className="p-2 flex">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleSend}
          placeholder="What's your next wabbit hole?"
          className="w-full border-none shadow-none mr-2"
          disabled={isLoading}
        />
        <ModelSelector className="ml-5"
          selectedModel={selectedModel}
          onSelectModel={(model) => dispatch({ type: 'SET_MODEL', payload: model })}
        />
      </CardContent>
    </Card>
    </div>
  );
};

export default InputArea;