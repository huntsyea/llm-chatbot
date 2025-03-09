/// <reference types="vite/client" />

/**
 * Extends the ImportMeta interface to include Vite-specific properties This
 * allows TypeScript to recognize the env property on import.meta
 */
interface ImportMeta {
  readonly env: {
    readonly [key: string]: string | undefined;
    readonly VITE_OPENROUTER_API_KEY: string;
    readonly VITE_GEMINI_API_KEY: string;
    readonly MODE: string;
    readonly DEV: boolean;
    readonly PROD: boolean;
  };
}
