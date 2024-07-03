import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import ChatMessage from './ChatMessage';
import { useChatDispatch } from './ChatContext';
import { getTopicSpecificResponse } from '../api/openRouter';

const ResponseColumn = ({ response, columnIndex }) => {
  const dispatch = useChatDispatch();

  const handleTopicClick = async (topic) => {
    console.log("Clicked topic:", topic);
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const aiResponse = await getTopicSpecificResponse(topic, response.query, response.selectedModel);
      
      if (aiResponse.startsWith('Error:')) {
        throw new Error(aiResponse);
      }

      dispatch({
        type: 'ADD_RESPONSE',
        payload: {
          query: `"${topic}" (related to: ${response.query})`,
          messages: [{ type: "ai", content: aiResponse }]
        }
      });
    } catch (error) {
      console.error("Error fetching topic-specific response:", error);
      dispatch({
        type: 'ADD_RESPONSE',
        payload: {
          query: `"${topic}" (related to: ${response.query})`,
          messages: [{ type: "ai", content: `An error occurred while exploring this topic: ${error.message}. Please try again later or contact support if the issue persists.` }]
        }
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <Card className="w-full h-[calc(100vh-12rem)] min-h-[400px] flex flex-col">
      {response.query && (
        <div className="bg-gray-100 p-4 border-b">
          <p className="text-center">{response.query}</p>
        </div>
      )}
      <CardContent className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {response.messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} onTopicClick={handleTopicClick} />
        ))}
      </CardContent>
    </Card>
  );
};

export default ResponseColumn;