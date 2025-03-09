import React from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeminiModelConfig } from "../api/gemini";
import GeminiConfigDialog from "./GeminiConfigDialog";
import { getModelsByProvider, ModelDefinition } from "../lib/models";

/** Props for the ModelSelector component */
interface ModelSelectorProps {
  selectedModel: string;
  isGeminiModel: boolean;
  geminiConfig: GeminiModelConfig;
  onSelectModel: (model: string, isGemini: boolean) => void;
  onGeminiConfigChange: (config: GeminiModelConfig) => void;
}

/**
 * ModelSelector component allows users to select which LLM model to use
 *
 * This component displays a dialog with tabs for different model providers and
 * radio buttons for model selection, using a centralized model registry.
 *
 * @param props - Component props
 * @returns React component for model selection
 */
const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  isGeminiModel,
  geminiConfig,
  onSelectModel,
  onGeminiConfigChange,
}) => {
  // Default tab based on current model type
  const defaultTab = isGeminiModel ? "gemini" : "openrouter";

  // Check if a model is currently selected
  const isSelectedModel = (model: string, checkGemini: boolean) => {
    return selectedModel === model && isGeminiModel === checkGemini;
  };

  // Get models from registry
  const openRouterModels = getModelsByProvider("openrouter");
  const geminiModels = getModelsByProvider("gemini");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-primary">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-[550px] lg:max-w-[650px] w-full">
        <DialogHeader>
          <DialogTitle>Select Model</DialogTitle>
          <DialogDescription>
            Choose a language model from OpenRouter or Google Gemini to generate responses.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="openrouter">OpenRouter</TabsTrigger>
            <TabsTrigger value="gemini">Google Gemini</TabsTrigger>
          </TabsList>

          {/* OpenRouter Models Tab */}
          <TabsContent value="openrouter" className="mt-4">
            <RadioGroup
              value={isGeminiModel ? "" : selectedModel}
              onValueChange={(value) => onSelectModel(value, false)}
            >
              {openRouterModels.map((model) => (
                <div
                  key={model.value}
                  className="flex items-center space-x-2 py-1"
                >
                  <RadioGroupItem
                    value={model.value}
                    id={model.value}
                    className="text-primary"
                    checked={isSelectedModel(model.value, false)}
                  />
                  <Label htmlFor={model.value}>{model.name}</Label>
                </div>
              ))}
            </RadioGroup>
          </TabsContent>

          {/* Gemini Models Tab */}
          <TabsContent value="gemini" className="mt-4">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">
                Gemini models require a Google AI Studio API key. Set
                VITE_GEMINI_API_KEY in your .env file.
              </p>
            </div>

            <RadioGroup
              value={!isGeminiModel ? "" : selectedModel}
              onValueChange={(value) => onSelectModel(value, true)}
            >
              {geminiModels.map((model) => (
                <div
                  key={model.value}
                  className="flex items-center justify-between py-1 group"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={model.value}
                      id={model.value}
                      className="text-primary"
                      checked={isSelectedModel(model.value, true)}
                    />
                    <Label htmlFor={model.value} className="flex flex-col">
                      <span>{model.name}</span>
                      {model.description && (
                        <span className="text-xs text-muted-foreground">
                          {model.description}
                        </span>
                      )}
                    </Label>
                  </div>

                  {/* Show config button only when this model is selected */}
                  {isSelectedModel(model.value, true) && (
                    <GeminiConfigDialog
                      modelConfig={geminiConfig}
                      onConfigChange={onGeminiConfigChange}
                    />
                  )}
                </div>
              ))}
            </RadioGroup>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ModelSelector;