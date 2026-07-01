"use client";

import { SendHorizontal } from "lucide-react";
import { useState, type FormEvent, type ReactElement } from "react";
import type { ModelRoute } from "../domain/exploration";
import { recommendedPrompts } from "../lib/prompts";

interface CommandBarProps {
  routes: ModelRoute[];
  routeId: string;
  isRunning: boolean;
  onRouteChange: (routeId: string) => void;
  onSubmit: (prompt: string) => Promise<void>;
}

export function CommandBar({
  routes,
  routeId,
  isRunning,
  onRouteChange,
  onSubmit,
}: CommandBarProps): ReactElement {
  const [prompt, setPrompt] = useState("");

  const submitValue = async (value: string) => {
    const trimmedValue = value.trim();

    if (!trimmedValue || isRunning) {
      return;
    }

    await onSubmit(trimmedValue);
    setPrompt("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitValue(prompt);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-md border border-border bg-card p-3"
    >
      <div className="flex flex-wrap gap-2">
        {recommendedPrompts.map((recommendedPrompt) => (
          <button
            key={recommendedPrompt}
            type="button"
            disabled={isRunning}
            onClick={() => submitValue(recommendedPrompt)}
            className="rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground transition hover:border-primary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {recommendedPrompt}
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]">
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={2}
          placeholder="Ask a question, explore a source, or compare options..."
          className="min-h-[56px] resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
        />
        <select
          value={routeId}
          onChange={(event) => onRouteChange(event.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-primary"
          aria-label="Model route"
        >
          {routes.map((route) => (
            <option key={route.id} value={route.id}>
              {route.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isRunning || !prompt.trim()}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SendHorizontal className="h-4 w-4" />
          Run
        </button>
      </div>
    </form>
  );
}
