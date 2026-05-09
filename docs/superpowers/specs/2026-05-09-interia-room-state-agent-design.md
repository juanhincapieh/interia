# Interia — Verifiable Room-State Agent (Design Spec)

**Status:** Draft for implementation
**Date:** 2026-05-09
**Hackathon:** AI Tinkerers Medellín — Generative UI Global Hackathon: Agentic Interfaces
**Stack baseline:** This project is built on top of the Generative UI Global Hackathon Starter Kit at the repo root (Next.js + CopilotKit + LangGraph Deep Agent + Gemini + mcp-use). This spec adapts the starter kit; it does not replace it.

---

## 1. Product

**Name:** Interia
**Tagline:** Interactive Interior AI
**One-line:** Interia turns a room photo into a structured, editable Room State, lets the user steer the design through generative UI, generates previews from that constrained state, and verifies that locked room elements stayed faithful to the original.

**Positioning** (carried over verbatim from `design_handoff_interia_upload_view/original_spec.md`):
- Interia is **not** a chatbot.
- Interia is **not** a generic interior design dashboard.
- Interia is **not** an ecommerce marketplace.
- Interia is a warm, visual, agent-generated design workspace.

**Two project objectives, in order:**
1. Compete well in the hackathon.
2. Ship a CV-friendly project for agent-oriented startup / AI engineering roles.

The CV story we are building toward:
> Built a verifiable multimodal agent with typed Room State, sub-agent–driven fidelity validation, LangGraph Deep Agent orchestration on top of LangChain (ChatGoogleGenerativeAI + structured output), three tiers of generative UI (Controlled / A2UI / MCP App), and Gemini multimodal vision + image generation — not a chatbot, not an image-gen wrapper.

**Tooling badges this project earns for the CV:** LangGraph · LangChain · Gemini multimodal · CopilotKit (v2 + Intelligence) · A2UI · MCP (mcp-use) · Next.js 15 / React 19 · Pydantic-typed agent state.

---

## 2. What we keep and what we drop from the prior PROJECT_CONTEXT

The earlier `.claude/skills/project-context/SKILL.md` describes a Next.js solo build with custom Postgres tables. We **only keep the data processing methods** from that document. Everything else is replaced by the starter kit.

**Kept (transferable):**
- The Room State concept as the canonical structured memory.
- 4×4 grid abstraction for object positions (A1..D4).
- Relation graph (`left_of`, `right_of`, `above`, `under`, ...).
- Edit Contract: `{ identity, position, appearance, soft }` lock flags per object.
- Atomic Design Patches as the unit of change.
- The fidelity validation policy (locked-element preservation, camera angle, style application, recommended action).
- The 11-step user-facing workflow (upload → analyze → grid → confirm → preferences → plan → preview → validate → user-confirm → iterate).
- Generic in-house design catalog (no real products).

**Dropped:**
- Custom Postgres schema for Project / RoomPhoto / RoomState / Preview / FidelityReport tables. Replaced by per-thread LangGraph state + CopilotKit Intelligence's existing thread persistence in Postgres.
- Standalone Next.js shell. We use the kit's `apps/frontend` at port 3010.
- Standalone provider adapter layer. We use LangChain's `ChatGoogleGenerativeAI` and the kit's `_gemini_llm` runtime selector.
- Notion plumbing (the kit's Leads demo). Removed entirely from `apps/agent`.

---

## 3. Architecture overview

We retain the kit's four-app topology unchanged:

```
Browser (Canvas + Chat, Next.js + React 19)
   ↓
Next.js :3010 (proxies /api/copilotkit → BFF)
   ↓
BFF :4010 (Hono + CopilotRuntime v2)
   ↓
LangGraph Deep Agent :8133 (Python, Gemini)
   +
mcp-use Manufact MCP :3011 (interia-mcp)
```

The **Deep Agent** orchestrates a single planning loop with backend Python tools and one specialized sub-agent for fidelity validation. Frontend tools (CopilotKit `useFrontendTool`) declare UI mutators on the React side; the runtime forwards their schemas to the agent at run time.

Three generative UI tiers map to specific surfaces:

| Tier | Use |
|---|---|
| Controlled (`renderTool` / `useComponent`) | Structural views: RoomGridOverlay, DetectedObjectsConfirmation, EditContractPanel, FidelityReportCard, RoomStateInspector, AgentTracePanel |
| Declarative (A2UI) | DesignBoard sub-cards: ColorPaletteCard, LightingPlanCard, DecorSuggestionsCard, LayoutSuggestionsCard |
| Open-ended (MCP App) | `interia-mcp` read-only Room State Inspector usable from Claude / ChatGPT |

---

## 4. Repository changes

```
apps/
├── agent/                        Python LangGraph Deep Agent
│   ├── main.py                   keep wiring; remove Notion sections
│   ├── src/
│   │   ├── runtime.py            keep — Gemini Flash-Lite default; switchable
│   │   ├── prompts.py            REWRITE for Interia (room agent persona, 11-step contract)
│   │   ├── canvas.py             REWRITE: RoomState replaces Lead/CanvasState
│   │   ├── interia/              NEW
│   │   │   ├── schemas.py        Pydantic: RoomState, RoomObject, RoomRelation, EditContract,
│   │   │   │                     DesignPreference, DesignPlan, DesignPatch, Preview,
│   │   │   │                     FidelityReport, AgentTraceEvent
│   │   │   ├── reducer.py        apply_patch(state, patches) → state'  (pure function)
│   │   │   ├── catalog.json      generic design archetypes (lamps, rugs, decor, plants, textiles)
│   │   │   ├── prompts/          per-tool prompt templates
│   │   │   └── tools/
│   │   │       ├── vision.py     analyze_room (Gemini multimodal)
│   │   │       ├── state.py      build_room_state, generate_grid, apply_patch_tool
│   │   │       ├── design.py     generate_design_plan, get_catalog_options
│   │   │       ├── preview.py    generate_preview (Gemini image / mock)
│   │   │       └── fidelity.py   validate_fidelity (sub-agent dispatch)
│   │   ├── notion_*.py           DELETE
│   │   ├── lead_*.py             DELETE
│   │   └── intelligence_cleanup.py keep
│   ├── data/sample_rooms/        NEW: bundled bedroom/studio/living/workspace samples, pre-analyzed
│   └── pyproject.toml            add: pydantic, pillow, google-generativeai (already via langchain-google-genai)
├── bff/                          KEEP unchanged
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── page.tsx          REWRITE: Upload view per design handoff (pixel-perfect)
│       │   ├── project/[id]/page.tsx   NEW: Room State Canvas
│       │   ├── leads/            DELETE
│       │   └── showcase/         DELETE (kit demo)
│       ├── components/
│       │   ├── interia/          NEW: RoomGridOverlay, DetectedObjectsConfirmation,
│       │   │                     EditContractPanel, PreferencesCard, DesignBoard,
│       │   │                     ColorPaletteCard, LightingPlanCard, PreviewPanel,
│       │   │                     FidelityReportCard, AgentTracePanel, RoomStateInspector,
│       │   │                     AgentWelcomeCard, RoomUploadCard, SampleRoomSelector
│       │   ├── ui/               keep (shadcn primitives)
│       │   ├── threads-drawer/   keep
│       │   └── leads/            DELETE
│       └── lib/interia/          NEW
│           ├── types.ts          mirror of agent schemas (codegen target)
│           ├── design-tokens.ts  Japandi tokens from design handoff
│           └── frontend-tools.ts useFrontendTool registrations
└── mcp/                          RESKIN as interia-mcp
    └── src/
        ├── tools/getRoomState.ts        read latest RoomState from agent state
        ├── tools/getDesignPlan.ts       (post-MVP: strong version)
        └── tools/getFidelityReport.ts   (post-MVP: strong version)
```

---

## 5. Room State data model

Single source of truth. Pydantic models in Python (`apps/agent/src/interia/schemas.py`); mirrored as TypeScript types in `apps/frontend/src/lib/interia/types.ts`. The same JSON travels through CopilotKit shared state every turn.

```ts
type RoomState = {
  version: number                          // monotonic; bumps on every patch
  source: { imageUrl: string; sampleId?: SampleId; uploadedAt: string }
  shell: {
    roomType: 'bedroom' | 'studio' | 'living' | 'workspace' | 'other'
    dimensionsHint?: 'compact' | 'medium' | 'large'
    cameraAngle: 'front' | 'corner-left' | 'corner-right'
  }
  grid: { rows: 4; cols: 4 }               // fixed for MVP
  objects: RoomObject[]
  relations: RoomRelation[]
  editContract: Record<ObjectId, LockSet>
  preferences?: DesignPreference
  designPlan?: DesignPlan
  patches: DesignPatch[]                   // append-only audit log
  preview?: Preview
  fidelity?: FidelityReport
  trace: AgentTraceEvent[]
}

type RoomObject = {
  id: string
  type: 'window' | 'bed' | 'desk' | 'chair' | 'lamp' | 'rug' | 'plant' | 'decor' | 'textile' | 'other'
  label: string
  description: string
  gridPosition: GridCell                   // 'A1' | 'A2' | ... | 'D4'
  approximateSize: 'small' | 'medium' | 'large'
  color?: string
  material?: string
  confidence: number                       // 0..1 from vision model
  detectedBy: 'vision' | 'user'
  confirmedByUser: boolean
  evidenceCropUrl?: string
  bbox?: { x: number; y: number; w: number; h: number } // normalized 0..1
}

type LockSet = {
  identity: 'locked' | 'soft' | 'editable'
  position: 'locked' | 'soft' | 'editable'
  appearance: 'locked' | 'soft' | 'editable'
}

type RoomRelation = {
  subjectId: string
  relation: 'left_of' | 'right_of' | 'in_front_of' | 'behind'
            | 'above' | 'under' | 'attached_to_wall' | 'centered_under' | 'adjacent_to'
  targetId: string
  confidence: number
}

type DesignPreference = {
  style: 'minimal' | 'japandi' | 'industrial' | 'bohemian' | 'warm-modern'
  budget: 'low' | 'medium' | 'high'
  goal: 'cozy' | 'productive' | 'elegant' | 'spacious'
  constraints: Array<'keep-furniture' | 'rental-friendly' | 'no-drilling' | 'pet-safe'>
  freeformNotes?: string
}

type DesignPlan = {
  palette: { name: string; swatches: HexColor[] }
  lightingPlan: string
  decorSuggestions: CatalogItem[]
  layoutSuggestions: string[]
  actionPlan: string[]
  rationale: string
  proposedPatches: DesignPatch[]
}

type DesignPatch =
  | { op: 'add_object', target: Partial<RoomObject> & { gridPosition: GridCell }, reason: string }
  | { op: 'modify_object', id: ObjectId, patch: Partial<RoomObject>, reason: string }
  | { op: 'remove_object', id: ObjectId, reason: string }
  | { op: 'set_lock', id: ObjectId, locks: Partial<LockSet>, reason: string }
  | { op: 'preserve', id: ObjectId, reason: string }

type Preview = {
  id: string
  imageUrl: string
  promptSummary: string
  generationProvider: 'gemini-3-image-preview' | 'mock'
  fromVersion: number
  createdAt: string
  userFidelityStatus?: 'faithful' | 'mostly' | 'regenerate' | 'manual-mark'
}

type FidelityReport = {
  previewId: string
  systemScore: number                      // 0..100
  cameraAnglePreserved: boolean
  perObject: Array<{
    objectId: ObjectId
    label: string
    preserved: boolean
    confidence: number
    note?: string
  }>
  styleApplied: { selected: string; applied: string; match: 'strong' | 'partial' | 'weak' }
  unexpectedChanges: string[]
  recommendedAction: 'accept' | 'regenerate_with_stronger_locks' | 'ask_user_to_unlock'
  evidenceCrops?: Array<{ objectId: ObjectId; beforeUrl: string; afterUrl: string }>
}

type AgentTraceEvent = {
  id: string
  type: 'plan' | 'tool_call' | 'tool_result' | 'patch_applied' | 'validation' | 'user_decision'
  inputSummary: string
  outputSummary: string
  createdAt: string
}
```

**Per-turn data flow:**
1. User action in the UI → React calls `agent.setState(patch)` or invokes a frontend tool.
2. CopilotKit serializes the new state on the next turn.
3. Deep Agent reads `state["roomState"]`, plans, calls a Python tool.
4. Tool returns a typed result + a `DesignPatch[]`.
5. `apply_patch(state, patches)` produces `RoomState v+1`.
6. CopilotKit streams the snapshot back; React re-renders the canvas.

**Schema sync rule:** Pydantic is canonical. A small `scripts/codegen-types.ts` script generates `lib/interia/types.ts` from Pydantic JSON schema so both sides cannot drift.

---

## 6. Tool surface

### Backend Python tools (registered to the Deep Agent)

| Tool | Input | Output | Provider | Mock fallback |
|---|---|---|---|---|
| `analyze_room` | `imageUrl` | raw vision facts JSON | Gemini Pro multimodal | canned bedroom analysis |
| `build_room_state` | raw vision facts | `RoomState v1` | none (deterministic) | identity |
| `generate_grid` | `RoomState` | `RoomState` w/ `gridPosition` per object | none (deterministic mapping from bbox → 4×4) | identity |
| `apply_patch` | `RoomState`, `DesignPatch[]` | `RoomState v+1` | none (pure reducer) | n/a |
| `generate_design_plan` | `RoomState`, `DesignPreference` | `DesignPlan` + proposed patches | Gemini Flash-Lite, structured output | canned japandi plan |
| `get_catalog_options` | `category, style, budget` | `CatalogItem[]` | none (reads `catalog.json`) | n/a |
| `generate_preview` | `RoomState` | `Preview` | Gemini 3 Image Preview | placeholder PNG with overlay text |
| `validate_fidelity` | `RoomState`, `Preview` | `FidelityReport` | Gemini Pro multimodal (sub-agent) | canned report scoring 87 |
| `checkpoint` | `RoomState` | thread metadata | CopilotKit Intelligence | n/a |

The `INTERIA_MOCK=1` environment variable forces the mock path on every tool. The demo always works.

### Frontend tools (CopilotKit `useFrontendTool`, declared in `app/project/[id]/page.tsx`)

| Tool | Purpose |
|---|---|
| `setRoomState` | replace state (rare; the agent does this via patches) |
| `applyDesignPatches` | apply a DesignPatch[] from the React side (e.g., user accepts a plan suggestion) |
| `setLockState(objectId, lockSet)` | flip locks from the EditContractPanel |
| `confirmObject(objectId, confirmed)` | DetectedObjectsConfirmation card click handler |
| `setPreferences(preferences)` | PreferencesCard submit |
| `requestPreview()` | user clicks "Generate preview" |
| `submitFidelityDecision(status)` | "Faithful / Mostly / Regenerate / Manual" |
| `markChangedObject(objectId)` | "manual mark what changed" loop |
| `openConfirmationCard`, `openDesignBoard`, `openPreviewPanel`, `openFidelityCard` | panel toggles |
| `renderRoomGridOverlay`, `renderColorPalette`, `renderDecorSuggestion` | controlled gen-UI for the chat stream |

Per the kit's pattern (`apps/agent/src/canvas.py` module docstring), Python stubs of the frontend tools live as documentation only and are **not** registered with the agent — that would cause Gemini to reject the request with a duplicate-declaration error.

---

## 7. Workflow contract (the 11 steps)

Hard-coded into the system prompt and enforced by the agent's plan structure. Each numbered step corresponds to a tool call or a user gate.

1. **Capture** — User uploads or selects sample. Frontend calls `setRoomState({ source: { imageUrl, sampleId } })`. Agent acknowledges.
2. **Analyze** — Agent calls `analyze_room` → raw facts.
3. **Build state** — Agent calls `build_room_state` → `RoomState v1`.
4. **Grid** — Agent calls `generate_grid` → `RoomState v2` with positions.
5. **Confirm** — Agent triggers `openConfirmationCard` for the highest-uncertainty objects (window, bed, desk; confidence < 0.85). User clicks confirm/correct → frontend tool `confirmObject` patches state.
6. **Preferences** — Agent triggers `setPreferences` flow via the PreferencesCard.
7. **Design plan** — Agent calls `generate_design_plan` → DesignBoard renders palette + lighting + decor + layout cards via A2UI.
8. **Preview (on request only)** — Agent calls `generate_preview`. Hard rule: never preview without an explicit user request (`requestPreview` frontend tool fires).
9. **Validate** — `validate_fidelity` runs automatically after every successful preview; FidelityReportCard renders.
10. **User decision** — User answers Faithful / Mostly / Regenerate / Manual. Frontend tool `submitFidelityDecision` writes to state.
11. **Iterate** — On regenerate, agent tightens the edit contract and re-runs steps 8–10. On accept, agent calls `checkpoint`.

**Non-negotiable agent rules** (system prompt):
- The original image is the visual source of truth.
- Never silently remove locked architectural elements.
- Use the Room State as the canonical source, not chat history.
- Generate previews only when the user explicitly requests one.
- After every preview, run `validate_fidelity` and ask the user.
- For refinements, emit `DesignPatch[]` against the current Room State; never regenerate the whole design from scratch.
- If an image API is unavailable, fall through to the mock path; do not hang.
- Use only the in-house catalog. Never invent real product names or prices.

---

## 8. Generative UI mapping

| Component | Tier | Why |
|---|---|---|
| RoomUploadCard | Static React | First-impression component; pixel-perfect per design handoff |
| SampleRoomSelector | Static React | Same |
| AgentWelcomeCard | Static React on upload view; live narration on canvas | Backed by real agent state on canvas |
| RoomGridOverlay | Controlled (`renderTool`) | Deterministic 4×4 layout; must look identical every time |
| DetectedObjectsConfirmation | Controlled | Structured confirmation flow |
| EditContractPanel | Controlled | Lock toggles must be predictable |
| PreferencesCard | Controlled | Form-like; constrained inputs |
| DesignBoard (container) | Controlled | Layout container |
| ColorPaletteCard | A2UI declarative | Generative variation per plan |
| LightingPlanCard | A2UI declarative | Same |
| DecorSuggestionsCard | A2UI declarative | Same |
| LayoutSuggestionsCard | A2UI declarative | Same |
| PreviewPanel | Controlled | Single image + caption; consistent framing |
| FidelityReportCard | Controlled | Scored verification view; must be legible |
| AgentTracePanel | Controlled | Timeline of plan/tool/patch/validation |
| RoomStateInspector | Controlled | Debug-grade JSON viewer with pretty rendering |
| `interia-mcp` getRoomState surface | Open-ended (MCP App) | Runs in someone else's chat (Claude/ChatGPT); sandboxed HTML is correct |

Demo line: *"the layout is constrained, the design language is generative, and the verification panel is structured."*

---

## 9. Fidelity validation loop

**Trigger:** every successful `generate_preview` call automatically dispatches `validate_fidelity` as the next planned step. The user does not have to ask.

**Implementation:** `validate_fidelity` is a separate Gemini call (a sub-agent dispatched from the Deep Agent), not the main planner. It receives:
- `source.imageUrl` (original)
- `preview.imageUrl` (newly generated)
- The current `RoomState` (so it knows what was supposed to be locked)

Output is `FidelityReport`, validated via `with_structured_output(FidelityReport)` so we get a Pydantic-typed result or a hard validation error.

**Two-stage user gate:**
1. Validator publishes the report → FidelityReportCard renders inline.
2. App asks: *"Does this preview stay faithful to your original room?"* User picks one of:
   - Faithful → agent calls `checkpoint`.
   - Mostly → state stays; user can iterate freely.
   - Regenerate with stronger constraints → agent flips every soft/editable lock to `locked` for matching object ids, injects literal "DO NOT CHANGE" lines per object into the next prompt, and re-runs `generate_preview`.
   - Manual mark → user clicks objects in the grid; each click flips `confirmedByUser=true` and `appearance.locked=true`. Next preview uses the tightened state.

**Trace:** every step (`analyze_room`, `validate_fidelity`, etc.) appends an `AgentTraceEvent`. The AgentTracePanel renders: *Plan → Tool → Result → Patch → Validation → User Decision*. This is the demo money shot for "verifiable agent."

---

## 10. Visual direction (beyond the upload view)

We extend the Japandi palette from `design_handoff_interia_upload_view/` into the rest of the app. Same tokens, same Inter + JetBrains Mono pairing, same warm-canvas / sage / terracotta accent. No new design system.

**Project canvas (`/project/[id]`)** — three columns:

```
┌──────────┬───────────────────────────────────┬─────────────────────────┐
│ Sidebar  │  Source room + 4×4 grid overlay   │  Canvas: Confirmation,  │
│  248px   │  (sticky; original + lock badges) │  Preferences, Design    │
│          │                                   │  Board, Preview,        │
│          │                                   │  Fidelity, Trace        │
└──────────┴───────────────────────────────────┴─────────────────────────┘
```

- Left third anchored to the source image with the 4×4 grid overlay and lock badges — visible at all times so the user always sees the ground truth.
- Right two-thirds is a vertical card stack in workflow order: ConfirmationCard → PreferencesCard → DesignBoard → PreviewPanel → FidelityReportCard → AgentTracePanel.
- AgentWelcomeCard floats over the source preview on the left (same visual component as upload view), but its body becomes live agent narration instead of static copy.
- All cards use the radii (14/18/22/24), shadows, and hover states from the handoff.

The `frontend-design` skill is invoked during implementation to spike the canvas layout before final build.

---

## 11. MVP cut list

**Must-ship (in priority order):**
1. Upload view — pixel-perfect per design handoff.
2. Deep Agent rewired for Interia (Notion plumbing removed).
3. `analyze_room` + `build_room_state` + `generate_grid` working with mock data.
4. RoomGridOverlay + DetectedObjectsConfirmation + EditContractPanel.
5. PreferencesCard + `generate_design_plan`.
6. DesignBoard with at least 2 A2UI sub-cards (palette, lighting).
7. `generate_preview` with mock placeholder.
8. `validate_fidelity` + FidelityReportCard.
9. AgentTracePanel.
10. `interia-mcp` minimal MCP App with `getRoomState` only.

**Strong (if time permits):** real Gemini image generation, full A2UI design board (palette + lighting + decor + layout), evidence crops in the fidelity report, the manual-mark interaction, MCP `getDesignPlan` and `getFidelityReport`.

**Stretch:** object crop cards from bounding boxes, simple version history scrubber, Daytona sandbox for running generated catalog code.

---

## 12. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Gemini image API quota or unavailability | `INTERIA_MOCK=1` env flag forces placeholder previews end-to-end; demo always works |
| LangGraph state shape drift between agent and React | Pydantic is canonical; `scripts/codegen-types.ts` generates TS types — both ends import the same shape |
| Vision call too slow for live demo | Cache `analyze_room` results keyed by image SHA-256; sample rooms ship pre-analyzed in `apps/agent/data/sample_rooms/` |
| Deep agent over-plans the simple flow | Tight system prompt with the 11-step contract baked in; first user message bypasses planning when a sample is preselected |
| Fidelity validator hallucinates structure | `with_structured_output(FidelityReport)` enforces typed output |
| $25 Gemini credit budget burn | Image gen gated behind explicit `requestPreview`; vision analysis cached; default chat model is Flash-Lite (cheap) |
| Demo machine offline | Pre-recorded fallback video referenced from `dev-docs/demo-prompts.md` — not a code mitigation, but a demo-day insurance policy |

---

## 13. Demo narrative

1. Open Interia. Upload view per design handoff.
2. Click the Bedroom sample.
3. Agent analyzes → Room State materializes → grid overlay paints with detected objects.
4. ConfirmationCard pops: "Window on left wall, bed center, desk right — confirm?"
5. Confirm. EditContractPanel auto-locks window/bed/desk identity + position.
6. PreferencesCard: pick Japandi / medium / cozy / pet-safe.
7. Agent generates design plan. DesignBoard renders palette + lighting via A2UI.
8. User clicks "Generate preview." Preview appears.
9. Validator runs. FidelityReportCard: score 87, window preserved, bed preserved, style match strong.
10. User answers "Faithful." Checkpoint saves.
11. Open Claude Web with the `interia-mcp` connector. Call `getRoomState`. The Room State Inspector renders inside Claude.

The story we tell:
> This is not a one-shot room generator. It's a verifiable multimodal agent with a typed Room State, structured generative UI, sub-agent–driven fidelity checks, and three deployment surfaces — web canvas, chat panel, and Claude/ChatGPT via MCP.

---

## 14. Out of scope for this spec

- Real e-commerce / product purchase flow.
- Multi-user / auth flows beyond the kit's existing user model.
- Mobile-specific layouts (desktop-first only).
- Internationalization.
- Persistence of multiple Room State versions per project (we keep the latest plus an append-only `patches` log).
- Notion or any other external CRM integration.

---

## 15. Implementation hand-off

Next step in this brainstorming flow: invoke the `superpowers:writing-plans` skill to produce a step-by-step implementation plan from this spec. The plan should be sequenced so the upload view is shippable on its own, then the agent rewire, then the canvas and tools, then the MCP app.
