import React from 'react';
import { Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const models = [
  { name: "Llama 3 8B", value: "meta-llama/llama-3-8b-instruct:free" },
  { name: "Mistral 7B", value: "mistralai/mistral-7b-instruct:free" },
  { name: "Phi-3 Medium 128K", value: "microsoft/phi-3-medium-128k-instruct:free" },
  { name: "Phi-3 Mini 128K", value: "microsoft/phi-3-mini-128k-instruct:free"},
  { name: "Gemma 2 9B", value: "google/gemma-2-9b-it:free" },
  { name: "Zephyr 7B", value: "huggingfaceh4/zephyr-7b-beta:free" },
  { name: "Toppy M 7B", value: "undi95/toppy-m-7b:free" },
  { name: "Nous Capybara 7B", value: "nousresearch/nous-capybara-7b:free" },
  { name: "OpenChat 3.5 7B", value: "openchat/openchat-7b:free"},
  // Add more models here
];

const ModelSelector = ({ selectedModel, onSelectModel }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-primary">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Model</DialogTitle>
        </DialogHeader>
        <RadioGroup value={selectedModel} onValueChange={onSelectModel}>
          {models.map((model) => (
            <div key={model.value} className="flex items-center space-x-2">
              <RadioGroupItem value={model.value} id={model.value} className="text-primary" />
              <Label htmlFor={model.value}>{model.name}</Label>
            </div>
          ))}
        </RadioGroup>
      </DialogContent>
    </Dialog>
  );
};

export default ModelSelector;