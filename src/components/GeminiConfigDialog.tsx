import React, { useState } from "react";
import { Cog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { GeminiModelConfig } from "../interfaces/core";
import {
  getDefaultGeminiConfig,
  normalizeGeminiConfigValue,
} from "../lib/geminiConfig";

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
  const [open, setOpen] = useState(false);
  const { maxOutputTokens, temperature, topK, topP } = modelConfig;
  const defaultConfig = React.useMemo(
    () => getDefaultGeminiConfig({ maxOutputTokens, temperature, topK, topP }),
    [maxOutputTokens, temperature, topK, topP],
  );

  // Local state for current configuration values
  const [config, setConfig] = useState<Required<GeminiModelConfig>>(
    () => defaultConfig,
  );

  React.useEffect(() => {
    setConfig(defaultConfig);
  }, [defaultConfig]);

  // Update local state when a parameter changes
  const handleParamChange = (
    param: keyof Required<GeminiModelConfig>,
    value: number | string,
  ) => {
    setConfig((prev) => ({
      ...prev,
      [param]: normalizeGeminiConfigValue(param, value, prev[param]),
    }));
  };

  // Apply configuration changes
  const handleApplyConfig = () => {
    onConfigChange(config);
    setOpen(false);
  };

  const handleApplyKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    handleApplyConfig();
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          aria-label="Configure Gemini model"
          aria-controls="gemini-model-configuration"
          aria-expanded={open}
          type="button"
          onClick={() => setOpen((isOpen) => !isOpen)}
        >
          <Cog className="h-4 w-4" />
          Configure
        </Button>
      </div>

      {open && (
        <section
          id="gemini-model-configuration"
          role="region"
          aria-label="Gemini model configuration"
          className="rounded-md border border-slate-200 bg-white p-4 text-left shadow-sm dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="space-y-1.5">
            <h3 className="text-base font-semibold leading-none tracking-tight">
              Gemini Model Configuration
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Adjust settings for the Gemini model, including temperature,
              top-k, top-p, and max output tokens.
            </p>
          </div>

          <div className="grid gap-4 py-4">
            {/* Temperature parameter */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="temperature">
                  Temperature: {config.temperature}
                </Label>
                <span className="text-xs text-muted-foreground">
                  (0.0 - 1.0)
                </span>
              </div>
              <Slider
                id="temperature"
                min={0}
                max={1}
                step={0.1}
                value={[config.temperature]}
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
                value={[config.topK]}
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
                <span className="text-xs text-muted-foreground">
                  (0.0 - 1.0)
                </span>
              </div>
              <Slider
                id="topP"
                min={0}
                max={1}
                step={0.1}
                value={[config.topP]}
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

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleApplyConfig}
              onKeyDown={handleApplyKeyDown}
            >
              Apply Configuration
            </Button>
          </div>
        </section>
      )}
    </div>
  );
};

export default GeminiConfigDialog;
