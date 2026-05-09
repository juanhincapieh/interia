# Interia

Interia is a verifiable room-state interior design agent for the AI Tinkerers Medellin Generative UI Global Hackathon. It turns a room photo into structured state, lets the user correct and steer that state through generative UI, then produces constrained previews with fidelity checks.

The project is intentionally mock-first: the full demo should work with canned room analysis, design plans, previews, and validation while live AI providers are wired in during the hackathon.

## Architecture

Interia is organized around four visible phases of the agent workflow:

1. **Capture and analyze**: the user starts from a sample or uploaded room photo, and the agent extracts room type, fixed objects, editable areas, grid positions, confidence, and relations.
2. **Confirm and constrain**: the UI exposes detected objects, lock status, preferences, and edit contracts so the user can confirm facts before generation.
3. **Plan and preview**: the agent creates a design board from the canonical room state, proposes atomic design patches, and generates a preview only when requested.
4. **Validate and iterate**: the system compares preview output against locked room elements, shows a fidelity report, asks for user confirmation, and patches the room state for the next iteration.

This keeps the product from becoming a one-shot image prompt wrapper. The source of truth is the room state, not the chat transcript.

## Apps

- `apps/frontend`: Next.js UI for upload, project canvas, generative UI cards, preview, and fidelity review.
- `apps/bff`: backend-for-frontend that connects the web app to the CopilotKit runtime.
- `apps/agent`: LangGraph / CopilotKit agent with Interia room-state tools and mock fallbacks.
- `apps/mcp`: `interia-mcp` surface for exposing saved room state to MCP-capable clients.

## Quickstart

Install dependencies:

```bash
npm install
```

Run the mock-first local demo:

```bash
INTERIA_MOCK=1 npm run dev
```

Run the full stack including the MCP app:

```bash
INTERIA_MOCK=1 npm run dev:full
```

Then open the frontend, choose the bedroom sample, confirm detected objects, set preferences, generate a preview, and review the fidelity report.

## Demo Prompts

Use the prompts in [`dev-docs/demo-prompts.md`](dev-docs/demo-prompts.md) for the expected judging path:

- "Start a new project for the bedroom sample."
- "I'd like a Japandi style, medium budget, cozy goal, pet-safe."
- "Generate a preview."
- "Mark the desk as fully locked and regenerate."

## Spec and Docs

- [`docs/superpowers/plans/2026-05-09-interia-room-state-agent.md`](docs/superpowers/plans/2026-05-09-interia-room-state-agent.md): implementation plan and hackathon acceptance checklist.
- [`dev-docs/interia.md`](dev-docs/interia.md): Interia-specific wiring notes, mock mode, and smoke checks.
- [`dev-docs/README.md`](dev-docs/README.md): deeper development references.
