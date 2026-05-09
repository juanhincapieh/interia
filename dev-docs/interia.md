# Interia demo — wiring and fallbacks

## Bootstrap from upload → project canvas

1. The upload view (`apps/frontend/src/app/page.tsx`) writes  
   `sessionStorage[`interia:${projectId}`]`  
   as `{ sampleId }` or `{ uploadedUrl }`.
2. On `/project/[id]`, `useInteriaProject` (`apps/frontend/src/lib/interia/use-interia-project.tsx`) reads that key once per tab (guarded by `interia-sent:${projectId}`), pushes a user message with CopilotKit v2 (`agent.addMessage` + `copilotkit.runAgent`), and starts the agent loop.

## Mock mode (`INTERIA_MOCK=1`)

Tools in `apps/agent` short-circuit to canned data when `INTERIA_MOCK=1` is set for the **agent process**. From the repo root:

```bash
INTERIA_MOCK=1 npm run dev
```

The variable is forwarded to every child of `concurrently`, including `langgraph dev`.

**Manual e2e (mock):** Home → choose bedroom sample → `/project/<id>` → expect grid overlay and confirmation UI without live Gemini calls.

## Real Gemini path

Unset `INTERIA_MOCK` (or set it to anything other than `1`). Ensure `GEMINI_API_KEY` is configured per [Setup](setup.md).

**Smoke checklist**

1. Bedroom sample → network shows vision/analysis completing (not instant canned payload).
2. Run through preferences → **Generate preview** → preview image + fidelity card.

If you hit **429 / 5xx / quota**: switch back to `INTERIA_MOCK=1` for the hackathon demo and optionally tighten caching in the vision tool (`apps/agent/src/interia/tools/vision.py`) after profiling latency.

## Related scripts

See [Available scripts](scripts.md): `npm run dev`, `npm run dev:full`.
