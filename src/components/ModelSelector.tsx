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
import { GeminiModelConfig } from "../interfaces/core";
import GeminiConfigDialog from "./GeminiConfigDialog";
import { getModelsByProvider } from "../lib/models";

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
  const [open, setOpen] = React.useState(false);

  // Default tab based on current model type
  const defaultTab = isGeminiModel ? "gemini" : "openrouter";

  // Check if a model is currently selected
  const isSelectedModel = (model: string, checkGemini: boolean) => {
    return selectedModel === model && isGeminiModel === checkGemini;
  };

  const closeSelector = () => setOpen(false);

  const handleDoneKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    closeSelector();
  };

  // Get models from registry
  const openRouterModels = getModelsByProvider("openrouter");
  const geminiModels = getModelsByProvider("gemini");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-primary"
          aria-label="Select model"
        >
          <Settings className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-hidden flex flex-col sm:max-w-[425px] md:max-w-[550px] lg:max-w-[650px] w-full">
        <DialogHeader className="shrink-0">
          <DialogTitle>Select Model</DialogTitle>
          <DialogDescription>
            Choose a language model from OpenRouter or Google Gemini to generate
            responses.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 overflow-y-auto pr-1">
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
                  Live provider models require a server-side AI Gateway key.
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
                  </div>
                ))}
              </RadioGroup>
              {isGeminiModel && (
                <div className="mt-4">
                  <GeminiConfigDialog
                    modelConfig={geminiConfig}
                    onConfigChange={onGeminiConfigChange}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        <div className="shrink-0 flex justify-end border-t border-slate-200 pt-4 dark:border-slate-800">
          <Button
            type="button"
            onClick={closeSelector}
            onKeyDown={handleDoneKeyDown}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModelSelector;
