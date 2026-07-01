# Wabbit AI Exploration Workspace

Wabbit is a Next.js and React workspace for exploring AI responses as a graph.
Prompts, model responses, heading follow-ups, and promoted artifacts are stored as typed session nodes so the user can inspect both the readable answer and the exploration structure.

## Current Stack

- Next.js App Router
- React 19 and TypeScript
- Tailwind CSS
- React Flow through `@xyflow/react`
- AI SDK with Vercel AI Gateway for live model routes
- Deterministic mock runtime for local QA

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Keep `WABBIT_USE_MOCK_AI=true` for deterministic local development.
4. Add `AI_GATEWAY_API_KEY` when testing live Gateway routes.
5. Start development with `npm run dev`.

Provider credentials are server-only. Do not add provider keys as `NEXT_PUBLIC_*` variables.

## Verification

- `npm run verify:user-stories`
- `npm run lint`
- `npx tsc --noEmit --noUnusedLocals true --noUnusedParameters true`
- `npm run build`

Current overhaul notes, feature inventory, test status, and known defects are tracked in `outputs/2026-06-21-feature-audit/llm-chatbot-feature-status.xlsx`.
The rebuild execution plan is `docs/plans/2026-07-01-001-feat-ai-exploration-workspace-rebuild-plan.md`.
