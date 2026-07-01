# Wabbit Technical Documentation

## Architecture

Wabbit is a private AI exploration workspace built on Next.js App Router, React, TypeScript, Tailwind CSS, React Flow, and AI SDK.
The app treats exploration as typed product state, then derives the canvas, trail, and inspector views from that state.

## Runtime Boundaries

- `app/page.tsx` renders the workspace shell.
- `app/api/ai/run/route.ts` is the server-only AI execution boundary.
- `src/domain/exploration.ts` owns sessions, nodes, edges, provider state, topic branches, and artifact promotion.
- `src/hooks/useExplorationWorkspace.ts` coordinates UI commands, persistence, and API calls.
- `src/components/canvas/*` adapts product state into React Flow view models.
- `src/server/ai/*` validates model runs, builds provider prompts, executes mock or Gateway routes, and returns safe errors.

Provider credentials are read from server `process.env`.
The browser never reads `AI_GATEWAY_API_KEY`, and live model execution goes through `app/api/ai/run/route.ts`.

## AI Routing

Model routes are defined in `src/lib/models.ts`.
The default route is `mock/wabbit-local`, which returns deterministic responses for local QA and browser verification.
Gateway routes use AI SDK `generateText` with `@ai-sdk/gateway` when `AI_GATEWAY_API_KEY` or Vercel OIDC credentials are available.

The API route validates:

- known route IDs
- prompt and context size limits
- topic payloads for topic runs
- safe provider error responses

## Exploration Model

The session model contains:

- prompt nodes
- response nodes
- artifact nodes
- edges between prompts, responses, topic branches, and promoted artifacts
- provider status by route
- selected node state

Response headings remain clickable through `EnhancedMarkdown`.
Clicking a heading creates a topic prompt node linked to the parent response, then creates the topic response node when the model run succeeds.
Artifact suggestions are extracted from headings, list items, and entity-like text, but they only become artifact nodes after explicit user promotion.

## Persistence

`src/lib/explorationStore.ts` persists the single-user v1 session in browser storage.
The adapter falls back to a fresh session when storage is unavailable, invalid, or corrupted.
Multi-device persistence, auth, team sharing, and billing are outside this v1 rebuild.

## Verification

Run:

```bash
npm run verify:user-stories
npm run lint
npx tsc --noEmit --noUnusedLocals true --noUnusedParameters true
npm run build
```

`npm run verify:user-stories` covers markdown normalization, model route lookup, recommended prompts, prompt-to-response graph creation, topic branching, artifact promotion, route validation, persistence fallback, and graph layout adaptation.

## Known Legacy Surface

Some legacy chat and compatibility modules remain in `src/components`, `src/api`, and `src/services/api` so the migration can preserve compile safety while the new workspace becomes the primary app.
They no longer own the active product route and should be removed in a confirmed cleanup pass after the workspace flow is accepted.
