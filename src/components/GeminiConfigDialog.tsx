import React, { useState } from "react";
import { Cog } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { GeminiModelConfig } from "../api/gemini";

/** Props for the GeminiConfigDialog component */
interface GeminiConfigDialogProps {
  modelConfig: GeminiModelConfig;
  onConfigChange: (config: GeminiModelConfig) => void;
}

/**
 * GeminiConfigDialog component provides a UI for configuring Gemini model
 * parameters
 *
 * This component renders a dialog with sliders and inputs for adjusting model
 * settings such as temperature, top-k, top-p, and max output tokens.
 *
 * @param props - Component props
 * @returns React component for configuring Gemini models
 */
const GeminiConfigDialog: React.FC<GeminiConfigDialogProps> = ({
  modelConfig,
  onConfigChange,
}) => {
  // Local state for current configuration values
  const [config, setConfig] = useState<GeminiModelConfig>({
    temperature: modelConfig.temperature ?? 0.7,
    topK: modelConfig.topK ?? 40,
    topP: modelConfig.topP ?? 0.9,
    maxOutputTokens: modelConfig.maxOutputTokens ?? 3900,
  });

  // Update local state when a parameter changes
  const handleParamChange = (
    param: keyof GeminiModelConfig,
    value: number | string | string[],
  ) => {
    // Convert string values to numbers where appropriate
    const numValue = typeof value === "string" ? parseFloat(value) : value;

    setConfig((prev: GeminiModelConfig) => ({
      ...prev,
      [param]: numValue,
    }));
  };

  // Apply configuration changes
  const handleApplyConfig = () => {
    onConfigChange(config);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="ml-2">
          <Cog className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-[550px] lg:max-w-[650px] w-full">
        <DialogHeader>
          <DialogTitle>Gemini Model Configuration</DialogTitle>
          <DialogDescription>
            Adjust settings for the Gemini model, including temperature, top-k, top-p, and max output tokens.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Temperature parameter */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="temperature">
                Temperature: {config.temperature}
              </Label>
              <span className="text-xs text-muted-foreground">(0.0 - 1.0)</span>
            </div>
            <Slider
              id="temperature"
              min={0}
              max={1}
              step={0.1}
              value={[config.temperature as number]}
              onValueChange={(value) =>
                handleParamChange("temperature", value[0])
              }
            />
            <p className="text-xs text-muted-foreground">
              Controls randomness: Lower values are more deterministic, higher
              values are more creative.
            </p>
          </div>

          {/* Top-K parameter */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="topK">Top-K: {config.topK}</Label>
              <span className="text-xs text-muted-foreground">(1 - 100)</span>
            </div>
            <Slider
              id="topK"
              min={1}
              max={100}
              step={1}
              value={[config.topK as number]}
              onValueChange={(value) => handleParamChange("topK", value[0])}
            />
            <p className="text-xs text-muted-foreground">
              Limits token selection to the top K most likely tokens.
            </p>
          </div>

          {/* Top-P parameter */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="topP">Top-P: {config.topP}</Label>
              <span className="text-xs text-muted-foreground">(0.0 - 1.0)</span>
            </div>
            <Slider
              id="topP"
              min={0}
              max={1}
              step={0.1}
              value={[config.topP as number]}
              onValueChange={(value) => handleParamChange("topP", value[0])}
            />
            <p className="text-xs text-muted-foreground">
              Nucleus sampling: Only considers tokens with cumulative
              probability {">="} top-p.
            </p>
          </div>

          {/* Max Output Tokens parameter */}
          <div className="grid gap-2">
            <Label htmlFor="maxOutputTokens">Max Output Tokens</Label>
            <Input
              id="maxOutputTokens"
              type="number"
              min={1}
              max={8192}
              value={config.maxOutputTokens}
              onChange={(e) =>
                handleParamChange("maxOutputTokens", e.target.value)
              }
            />
            <p className="text-xs text-muted-foreground">
              Maximum number of tokens to generate in the response.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleApplyConfig}>Apply Configuration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GeminiConfigDialog;