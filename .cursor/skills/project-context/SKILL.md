# PROJECT CONTEXT — Option 2: Verifiable Room-State Agent

Use this file as the main context prompt for the coding agent system. The goal is to help build the most complete **skeleton** possible before the hackathon, without overbuilding fragile features.

The agent should understand the project, architecture, constraints, event context, planned stack, data processing methods, and the intended MVP workflow. The agent should **not treat this as a greenfield generic interior design app**. It should build toward a specific hackathon prototype: a **stateful, verifiable, generative-UI interior design assistant**.

---

## 1. Project name

Working name: **Room Remix**

Subtitle: **Verifiable Room-State Interior Design Agent**

One-line description:

> Room Remix converts a room photo into a structured editable room state, lets the user steer the design through generative UI, and generates previews from that constrained state while checking whether locked room elements stayed faithful to the original.

---

## 2. Hackathon context

The project is for the **AI Tinkerers — Medellín Generative UI Global Hackathon: Agentic Interfaces**.

Relevant event framing:

- This is a short build-focused hackathon.
- The goal is not to make a normal chatbot.
- The goal is to build an AI agent that can render useful, interactive UI.
- The project should show that the agent can produce or drive interface elements such as forms, dashboards, design boards, selectors, validation panels, previews, and action flows.
- Shipping working code matters more than perfect polish.
- The event stack may include or encourage technologies such as:
  - **A2UI** — protocol for agents to send interactive UI.
  - **AG-UI** — protocol / transport layer for agent-to-frontend communication.
  - **CopilotKit** — React framework for embedding copilots and agentic frontends.
  - **MCP Apps / MCP servers** — tools and interactive model-context applications.
  - **Gemini / Google DeepMind credits or APIs**, if available during the event.
  - Other model providers may be allowed if available.

The app must therefore emphasize **generative UI + agentic workflow**, not only image generation.

---

## 3. Main objectives

There are two project objectives:

1. **Win / compete well in the hackathon.**
2. **Create a CV-friendly project for agent-oriented startups and AI engineering roles.**

The second objective is more important.

The project should demonstrate:

- stateful agent design;
- structured multimodal data extraction;
- schema-governed state;
- human-in-the-loop correction;
- constrained generation;
- tool-style orchestration;
- generative UI components;
- validation / verification loops;
- visible reasoning artifacts such as room state, grid, edit contract, and fidelity report;
- practical product judgment by avoiding over-scoped features like real shopping APIs unless trivial.

The CV story should be:

> Built a verifiable multimodal agent with typed room state, human correction loops, tool orchestration, constrained preview generation, and fidelity validation — not just a chatbot or image-generation wrapper.

---

## 4. Chosen option

Build **Option 2: Verifiable Room-State Agent**.

Do **not** default to Option 3 unless the event tools make it easy.

Option 2 is the best balance between:

- feasible hackathon scope;
- strong agentic architecture;
- impressive UI;
- clear technical story;
- controllable complexity.

---

## 5. Product concept

The user uploads a room photo. The system analyzes it, converts it into a structured room state, maps key objects onto a simple grid, asks the user to confirm or correct important detected elements, lets the user choose design preferences, generates a design board, lets the user optionally refine items, then generates a visual preview from the original image and the constrained room state.

After every generated image, the system checks fidelity and asks the user whether the preview stayed faithful to the original room.

The system should not simply say:

> “Here is a redesigned room.”

It should show:

> “Here is what I detected, here is what is locked, here is what I changed, here is the generated preview, and here is the fidelity report.”

---

## 6. Core workflow

The target workflow is:

```text
1. User uploads room photo
   → Store original image as the visual source of truth.

2. Vision model analyzes the image
   → Extract room type, objects, lighting, colors, style, visible constraints.

3. Convert analysis into structured Room State
   → JSON-like canonical state:
      - room shell
      - camera angle
      - fixed elements
      - editable elements
      - object descriptions
      - approximate sizes
      - positions
      - confidence scores

4. Convert room into simple grid map
   → Example: 4x4 or 5x5 visual grid.
   → Each object gets a position tag:
      - window: A1-B1
      - bed: B2-C3
      - desk: C4-D4
      - lamp: proposed D3

5. Add relation graph and edit contract
   → Relation graph examples:
      - desk right_of bed
      - window left_of bed
      - wall_art_area above bed
      - rug under/front_of bed

   → Edit contract examples:
      - window identity locked, position locked, appearance locked
      - bed identity locked, position locked, textiles editable
      - desk identity locked, position locked, surrounding lighting editable
      - wall decor area editable
      - floor appearance soft-editable

6. User confirms or corrects detected elements
   → Ask targeted questions, especially for important or uncertain elements:
      - “Keep window?”
      - “Keep bed position?”
      - “Is the desk on the right?”
      - “Can we add decor above the bed?”
   → Update Room State based on user corrections.

7. User selects design preferences
   → Style, budget, goal, constraints.
   → Example values:
      - Style: Minimal, Japandi, Industrial, Bohemian, Warm Modern
      - Budget: Low, Medium, High
      - Goal: More cozy, More productive, More elegant, More spacious
      - Constraints: Keep existing furniture, Rental-friendly, No drilling, Pet-safe

8. Agent generates Design Plan from Room State
   → Color palette
   → Lighting plan
   → Decor suggestions
   → Layout suggestions
   → Step-by-step action plan
   → Atomic design patches against the Room State

9. Optional refinement step
   → User can either:
      A. Accept/select suggested elements directly in the UI.
      B. Open an advanced refinement interface for more options.

   → Refinable categories:
      - lamp
      - rug
      - wall decor
      - plant
      - palette
      - textiles
      - desk area

   → Any selected or edited element updates only that part of the Room State.

10. Generate Preview only when requested
   → Image model receives:
      - original photo
      - room state
      - locked elements
      - grid positions
      - camera angle
      - selected design changes
      - “do not change” rules

11. System validates generated image
   → Vision model compares original vs generated image:
      - same window?
      - same camera angle?
      - bed still in same place?
      - desk still in same place?
      - locked objects preserved?
      - selected style applied?

12. User validates fidelity after every generated image
   → App asks:
      “Does this preview stay faithful to your original room?”

   → User can answer:
      - Yes, it is faithful
      - Mostly, but something changed
      - No, regenerate with stronger constraints
      - Manually mark what changed

13. If fidelity is low
   → System can:
      - regenerate with stronger preservation constraints
      - ask user what changed
      - update the Room State
      - lock additional elements

14. User iterates
   → Each edit updates the Room State, not the whole design from scratch.
   → User can keep refining through simple UI selections or the advanced interface.
```

---

## 7. Main architectural idea

The project should not rely only on prompting.

The system should convert the uploaded photo into structured room memory, then use that state to control the design plan, generated UI, and preview generation.

The important architecture is:

```text
Original image
→ Vision extraction
→ Layered Room State
→ Grid overlay
→ Relation graph
→ Edit contract
→ User correction
→ Design patches
→ Preview generation
→ Fidelity validation
→ User confirmation
→ Iteration
```

---

## 8. Planned web stack

Use the following stack unless the event starter kit strongly suggests otherwise.

### Core app

- **Next.js + React**
- **TypeScript**
- **Tailwind CSS**
- Optional but recommended: **shadcn/ui** for fast polished components

### Generative UI / agentic frontend

Use at least one event-relevant technology if available:

- Prefer **CopilotKit + AG-UI** if the starter kit supports it because the project uses React.
- Consider **A2UI** if the event starter kit provides a clear component protocol.
- Consider **MCP Apps / MCP tools** if the starter kit provides ready-to-use tool wiring.
- Lang chain and lan graph


The frontend should include a component catalog that the agent can fill with structured outputs:

- `RoomUploadCard`
- `RoomAnalysisPanel`
- `RoomGridOverlay`
- `DetectedObjectsConfirmation`
- `DesignPreferencesPanel`
- `DesignBoard`
- `ColorPaletteCard`
- `LightingPlanCard`
- `DecorSuggestionsCard`
- `LayoutSuggestionsCard`
- `ActionPlanCard`
- `ElementRefinementPanel`
- `PreviewPanel`
- `FidelityReportCard`
- `RoomStateInspector`
- `AgentTracePanel`

### Database

- **Local PostgreSQL**
- **pgAdmin** for quick inspection and debugging
- Use a practical ORM or query layer suitable for Next.js speed.
- The database should persist projects, uploaded photos, room states, design preferences, previews, fidelity reports, and interaction events.

### File storage

- Local file storage is acceptable for the hackathon skeleton.
- Store uploaded room images and generated preview images in a predictable local folder.
- Store only file paths / URLs in Postgres.

### AI providers

Prepare adapter boundaries so the provider can be swapped depending on what the event gives.

Expected roles:

- Vision analysis: likely Gemini or another multimodal model.
- Planning / design board generation: Gemini, OpenAI, Anthropic, or available provider.
- Image preview generation/editing: whichever image model/API is available.
- Validation: vision model comparing original and generated image.

Do not hardwire the architecture to a single provider if avoidable. Use provider adapters and mock fallbacks.

### Mock mode

The skeleton must work even if the AI APIs are not connected yet.

Mock mode should include:

- sample room analysis;
- sample room state;
- sample design plan;
- sample preview placeholder;
- sample fidelity report.

This is important because the hackathon tools may be provided during the event and may require last-minute adaptation.

---

## 9. Data model requirements

The skeleton should include persistent entities conceptually similar to these.

Do not overcomplicate, but keep the structure future-ready.

### Project

Represents one user room-design project.

Important fields:

- id
- title
- created_at
- updated_at
- status
- active_room_state_id
- active_preview_id

### RoomPhoto

Represents the original source image.

Important fields:

- id
- project_id
- original_image_url
- width
- height
- uploaded_at
- is_source_of_truth

### RoomState

Represents the canonical structured state of the room.

Important fields:

- id
- project_id
- version
- room_shell
- camera
- grid
- objects
- relations
- edit_contract
- preferences
- design_plan
- patches
- source
- created_at

### RoomObject

Can be embedded in RoomState JSON or stored relationally. Skeleton can start simple.

Important fields:

- id
- type
- label
- description
- grid_position
- approximate_size
- color
- material
- confidence
- locked_status
- confirmation_status
- evidence_crop_url optional
- bbox optional

### RoomRelation

Important fields:

- subject_object_id
- relation_type
- target_object_id
- confidence

Relation examples:

- left_of
- right_of
- in_front_of
- behind
- above
- under
- attached_to_wall
- centered_under
- adjacent_to

### EditContract

Controls what can change.

Important dimensions:

- identity lock
- position lock
- appearance lock
- soft lock
- editable
- user confirmed
- AI detected
- validator confirmed

### DesignPreference

Important fields:

- style
- budget
- goal
- constraints
- freeform_notes

### DesignPlan

Important fields:

- palette
- lighting_plan
- furniture_or_decor_suggestions
- layout_suggestions
- step_by_step_action_plan
- rationale
- design_patches

### DesignPatch

Represents an atomic intended change.

Examples:

- add rug to B2-C3
- add floor lamp to D3
- modify bedding material to linen
- add wall art above bed
- preserve window unchanged

Important fields:

- operation
- target_object_or_area
- target_grid_position
- reason
- status

### Preview

Important fields:

- id
- project_id
- room_state_id
- generated_image_url
- prompt_summary
- generation_provider
- created_at
- user_fidelity_status

### FidelityReport

Important fields:

- preview_id
- system_score
- window_preserved
- camera_angle_preserved
- bed_position_preserved
- desk_position_preserved
- locked_objects_preserved
- style_applied
- unexpected_changes
- recommended_action
- user_feedback

### InteractionEvent

For agent trace and demo value.

Important fields:

- id
- project_id
- type
- input_summary
- output_summary
- created_at

---

## 10. Tool-style orchestration surface

Think of the agent as a single orchestrator with deterministic tools, not as a chaotic set of autonomous agents.

The skeleton should expose or simulate tool-like functions with clear responsibilities:

```text
room.capture
→ store uploaded image and create project

room.analyze
→ extract visual facts from image

room.build_state
→ normalize raw analysis into Room State

room.generate_grid
→ assign objects to grid zones

room.patch_state
→ apply user corrections and design patches

design.generate_plan
→ produce design board and action plan from Room State + preferences

catalog.get_generic_options
→ retrieve generic item archetypes, not real products

preview.generate
→ generate image preview from original image + Room State

preview.validate_fidelity
→ compare generated preview against original and locked elements

project.checkpoint
→ save accepted state/preview version
```

The tool names do not need to be exactly implemented this way, but the skeleton should preserve these boundaries.

---

## 11. Design catalog policy

Do **not** use real products for the hackathon skeleton.

Use a generic internal catalog of design archetypes.

Examples:

```text
Lamps:
- Paper Floor Lamp
- Black Arc Lamp
- Rattan Floor Lamp
- Wooden Table Lamp

Rugs:
- Jute Neutral Rug
- Soft Wool Rug
- Geometric Low-Pile Rug
- Warm Terracotta Rug

Wall decor:
- Framed Abstract Art
- Round Mirror
- Floating Shelf
- Textile Wall Hanging

Plants:
- Tall Floor Plant
- Small Desk Plant
- Hanging Plant
- Low Maintenance Plant

Textiles:
- Linen Bedding
- Warm Throw Blanket
- Neutral Cushions
- Textured Curtains
```

Each item should include:

- name
- category
- compatible styles
- price tier
- materials
- visual effect
- placement suggestions
- constraints compatibility

The catalog should support filtering by:

- style
- budget
- goal
- constraints
- room object compatibility

Avoid e-commerce complexity unless the event explicitly provides an easy product/search API.

---

## 12. UI requirements

The app should feel like a generative UI product, not a form-only app.

The main screen should show:

1. Uploaded room photo.
2. Room analysis summary.
3. Grid overlay or simplified position map.
4. Detected fixed/editable elements.
5. User confirmation controls.
6. Design preferences controls.
7. Generated design board.
8. Optional refinement panel.
9. Preview panel.
10. Fidelity report.
11. User fidelity confirmation after every preview.
12. Room State inspector or agent trace panel for demo value.

The UI should make the architecture visible:

- show locked elements;
- show editable elements;
- show confidence;
- show grid positions;
- show design patches;
- show validation results.

This matters because judges and recruiters should see that the system is not a simple prompt wrapper.

---

## 13. AI behavior rules

The agent must follow these rules:

1. Treat the original image as the visual source of truth.
2. Never silently remove locked architectural elements.
3. Preserve locked objects unless the user explicitly unlocks them.
4. Use the Room State as the canonical source, not chat history alone.
5. Use grid and relation data to place suggestions.
6. Ask for confirmation only when useful.
7. Prefer targeted corrections over long questionnaires.
8. Generate previews only when requested.
9. After every preview, produce a fidelity report.
10. Always ask the user whether the generated image is faithful.
11. For refinements, patch the current Room State instead of regenerating the entire design from scratch.
12. If an image model or API is unavailable, keep the workflow working with placeholders and structured plans.
13. Do not invent real product availability or prices.
14. Keep the architecture simple enough to ship.

---

## 14. Preview generation policy

The preview generator should receive a controlled prompt built from Room State.

It should include:

- original photo reference;
- locked elements;
- camera angle preservation;
- room layout preservation;
- grid positions;
- selected design changes;
- style and palette;
- do-not-change rules.

Prompt structure concept:

```text
Use the uploaded room photo as the base image.

Preserve:
- same camera angle
- same room layout
- window on left wall
- bed in same position
- desk and chair on right side
- wall and floor structure

Apply:
- selected style
- selected color palette
- selected lamp/rug/decor/textile changes
- exact proposed grid placements where relevant

Do not:
- remove the window
- move the bed
- remove the desk
- change room shape
- change camera angle
- invent large architectural changes
```

---

## 15. Fidelity validation policy

The validator should compare the original and generated preview.

It should produce structured output such as:

```text
- camera angle similarity
- locked object preservation
- window preservation
- bed position preservation
- desk position preservation
- architectural drift
- style application
- unexpected changes
- recommended action
```

After the validator runs, the app must ask the user:

> Does this preview stay faithful to your original room?

User options:

- Yes, it is faithful.
- Mostly, but something changed.
- No, regenerate with stronger constraints.
- I want to manually mark what changed.

---

## 16. Hackathon scope levels

### Must-have skeleton

This should be ready before or early in the hackathon:

- Next.js app shell.
- Local Postgres connection.
- pgAdmin-compatible database.
- Project creation.
- Image upload UI.
- Mock room analysis.
- Room State model.
- Grid visualization.
- Fixed/editable element confirmation.
- Design preferences panel.
- Design board UI.
- Generic catalog.
- Optional refinement panel.
- Preview placeholder.
- Fidelity report placeholder.
- User fidelity confirmation.
- Basic persistence.
- Demo data.

### Strong hackathon version

Add when APIs are available:

- Real vision model analysis.
- Real design plan generation.
- Real preview generation/editing.
- Real vision-based fidelity validation.
- Agent trace panel.
- Component-based generative UI via CopilotKit / AG-UI / A2UI if practical.

### Stretch features

Only if base is stable:

- Object crop cards from bounding boxes.
- Simple version history / rollback.
- Localized edit mode for one category, such as wall decor or lamp.
- Better advanced refinement interface.
- Room State inspector with object nodes, relation edges, confidence, and lock type.

Do not attempt all stretch features if they threaten the working demo.

---

## 17. Main risks and constraints

### Risk: exact image fidelity is not guaranteed

Mitigation:

- Use original image as source.
- Use explicit locked elements.
- Use grid positions.
- Use relation graph.
- Use edit contract.
- Validate with model.
- Ask user after every generation.

### Risk: APIs/tools are not available until event

Mitigation:

- Use provider adapters.
- Use mock mode.
- Keep the workflow runnable without APIs.

### Risk: real product search distracts from core demo

Mitigation:

- Use generic design catalog.
- Do not use real product prices or availability.

### Risk: overbuilding multi-agent architecture

Mitigation:

- Use one orchestrator.
- Use tool-style functions.
- Add specialized roles only if truly needed.

### Risk: too many user questions

Mitigation:

- Ask targeted confirmation questions only.
- Focus on high-impact and uncertain elements.

---

## 18. Demo narrative

The demo should show:

1. Upload a room photo.
2. The system extracts a structured Room State.
3. The UI shows fixed and editable elements.
4. The user corrects or confirms key facts.
5. The user selects style, budget, goal, and constraints.
6. The agent generates a design board.
7. The user optionally refines one item.
8. The user requests a preview.
9. The system validates fidelity.
10. The user confirms whether it stayed faithful.
11. The state updates instead of starting from scratch.

The important message:

> This is not a one-shot room image generator. It is a verifiable multimodal design agent with structured state, generative UI, and fidelity checks.

---
