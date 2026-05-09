# Interia demo — wiring and fallbacks

## Bootstrap from upload → project canvas

1. The upload view (`apps/frontend/src/app/page.tsx`) writes JSON under the session key `interia:<projectId>` with `{ sampleId }` or `{ imageUrl }` (server path under `/uploads/interia/…` after `POST /api/interia/upload`).
2. On `/project/[id]`, `useInteriaProject` (`apps/frontend/src/lib/interia/use-interia-project.tsx`) reads that key once per tab (guarded by `interia-sent:${projectId}`), pushes a user message with CopilotKit v2 (`agent.addMessage` + `copilotkit.runAgent`), and starts the agent loop.

## Mock mode (`INTERIA_MOCK=1`)

Tools in `apps/agent` short-circuit to canned data when `INTERIA_MOCK=1` is set for the **agent process**. **Uploads in mock mode still run canned vision** (defaults to the bedroom sample JSON when `sample_id` is absent), so every custom photo looks the same until you turn mock off.

From the repo root:

```bash
INTERIA_MOCK=1 npm run dev
```

The variable is forwarded to every child of `concurrently`, including `langgraph dev`.

**Manual e2e (mock):** Home → choose bedroom sample → `/project/<id>` → expect grid overlay and confirmation UI without live Gemini calls.

## Real Gemini path

Set `INTERIA_MOCK=0` (or unset it) in **`apps/agent/.env`** — `langgraph dev` loads that file, not only the repo root `.env`. Set a real `GEMINI_API_KEY` there (see [Setup](setup.md)). Set `INTERIA_PUBLIC_IMAGE_BASE` to your Next.js origin (e.g. `http://127.0.0.1:3000`) so the agent can fetch `/samples/…` and `/uploads/…` for multimodal calls.

**Smoke checklist**

1. Bedroom sample → network shows vision/analysis completing (not instant canned payload).
2. Run through preferences → **Generate preview** → preview image + fidelity card.

If you hit **429 / 5xx / quota**: switch back to `INTERIA_MOCK=1` for the hackathon demo and optionally tighten caching in the vision tool (`apps/agent/src/interia/tools/vision.py`) after profiling latency.

## Related scripts

See [Available scripts](scripts.md): `npm run dev`, `npm run dev:full`.
