import React from "react";
import { Card, CardContent } from "./ui/card"; // Fixed import path
import QueryInput from "./QueryInput";
import ModelControls from "./ModelControls";
import { useChatState } from "../hooks/useChatContext";

/**
 * InputArea component orchestrates query input and model controls
 *
 * @returns React component for input and model selection
 */
const InputArea: React.FC = () => {
  const { isLoading } = useChatState();

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="container-1200">
        <Card className="shadow-md card-full-width">
          <CardContent className="flex p-2">
            <QueryInput disabled={isLoading} />
            <ModelControls />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InputArea;