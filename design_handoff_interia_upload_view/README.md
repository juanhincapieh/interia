# Handoff: Interia — Upload / New Project View

## Overview

This package describes the **first view** of Interia (Interactive Interior AI): the
Upload / Home / New Project screen where a user starts a new room design project
by uploading a room photo or selecting a sample room.

Out of scope for this view (do **not** build): room analysis screen, design board,
object refinement, preview/fidelity report, product catalog, chat interface,
bounding boxes, grid overlays.

Target stack: **React + CopilotKit**.

## About the Design Files

The files in this bundle are **design references created in HTML** — a working
prototype showing the intended look, layout, and micro-interactions. They are
**not production code to copy directly**. Recreate the design in the target
codebase using its established patterns (React components, your styling
solution — Tailwind, CSS modules, styled-components, etc.) and CopilotKit
primitives where the agent surfaces are wired up.

Notable mapping notes for CopilotKit:
- `AgentWelcomeCard` is the natural anchor for a CopilotKit `useCopilotChat` /
  `useCoAgent` surface once analysis kicks in. For this view it is **static
  presentational only** — no chat input, no message history.
- The "agent online" pill, the typing dots in the agent card, and the
  "preparing workspace" caption are visual hints; back them with the real
  CopilotKit agent state when wiring up.

## Fidelity

**High-fidelity (hifi).** Final colors, typography, spacing, radii, shadows,
and hover states are decided. Recreate pixel-perfectly. Exact tokens are in
the **Design Tokens** section.

## Screens / Views

### Screen: Upload / New Project (single screen in this handoff)

**Purpose:** invite the user to start a project — upload a room photo or
choose a sample room. Communicate that this is an agentic, generative product
without acting like a chatbot.

**Frame:** desktop-first, 1440 × 982 reference. Background `--warm-canvas`
(`#F7F3EC`) with two faint radial tints (terracotta top-right, sage
bottom-left, both ~5% opacity) layered via a `body::before` overlay.

**Layout:** three zones — Sidebar | Main (Hero + Upload + Samples) | Preview.

```
┌──────────┬────────────────────────────┬───────────────────────┐
│ Sidebar  │  Hero / Upload / Samples   │  Hero Room Preview    │
│  248px   │  flex 1, padding 72/56     │  max 720px, justify-end │
└──────────┴────────────────────────────┴───────────────────────┘
```

Main grid: `grid-template-columns: minmax(460px, 520px) 1fr;` with `gap: 56px`.
Main padding: `72px 40px 40px 56px`.

---

#### Components

##### 1. `Sidebar` (`248px` fixed, full height)

- Background: `--soft-cream` (`#FBF8F2`)
- Right border: `1px solid --sand-border` (`#E7DED1`)
- Padding: `26px 18px 22px 18px`
- Vertical layout: logo row → nav → flex spacer → Settings → workspace card

**Logo row** (`InteriaLogo`):
- 22px sage diamond/sparkle SVG mark + wordmark "interia"
- Wordmark: Inter 700, 19px, letter-spacing -0.02em, color `--charcoal`
- A small uppercase "PLACEHOLDER" tag pinned to the right (mono, 9px, dust-gray)
  signals the logo will be replaced later — **remove this tag in production**.
- Bottom: `1px dashed --sand-border`, 22px below

**Nav items** (top to bottom): New Project, Projects, Inspiration, Catalog,
Preferences. Settings sits below the spacer.

- Each item: 44px tall, 12px radius, 14.5px Inter 500, color `--warm-gray`
- Icon: Lucide-style line icon, 18px, `stroke-width: 1.6`, currentColor
- Hover: subtle border + soft cream bg
- **Active** ("New Project"): bg `--mist-sage` (`#E7EFE4`), text/icon `--deep-sage`
  (`#49634D`), font-weight 600, `1px solid rgba(95,127,99,0.18)`, plus a tiny
  `6px` sage dot pushed to the right edge
- Icons: plus / folder / sparkles / grid / sliders / gear

**Workspace card** (bottom of sidebar):
- White card, `1px solid --sand-border`, radius 14, padding `12px 14px`
- Mono uppercase 10px label "WORKSPACE" (dust-gray, 0.1em tracking)
- Name: 14px Inter 600, charcoal — "Laura's Studio"
- Meta row: 6px terracotta dot + "3 active projects" (12px warm-gray)

##### 2. `TopUserMenu` (absolute, top: 24, right: 32)

Two pills side by side:

- **Status pill**: `soft-cream` bg, sand border, 999 radius, 8/14 padding.
  7px sage dot with `box-shadow: 0 0 0 4px rgba(95,127,99,0.15)`.
  Text: "Agent online", 12.5px Inter 500, warm-gray.
- **User pill**: porcelain bg, sand border, 999 radius, 6/14/6/6 padding.
  30px circular avatar (terracotta gradient `linear-gradient(135deg,#E9C7B3,#C97855)`
  with white border + initial "L"), then "Hi, Laura" (14px Inter 600 charcoal),
  then chevron-down icon 16px warm-gray. **Avatar is a placeholder.**

##### 3. `HeroIntro` (max-width 480px)

- **Pill** "Agent-generated design workspace": inline-flex, 6/12 padding,
  `--soft-cream` bg, sand border, 999 radius, 12.5px Inter 500 warm-gray,
  with a 13px sage sparkle icon. Margin-bottom 22px.
- **Title** (`<h1>`): 60px Inter 650, line-height 1.04, letter-spacing -0.035em,
  charcoal. Two lines:
  - line 1: "Design your space," in `--charcoal`
  - line 2: "interactively." in `--sage` (`#5F7F63`)
- **Subtitle**: 17px Inter 400, line-height 1.55, warm-gray, max-width 420px.
  Copy: "Upload a photo of your room and let Interia turn it into an editable
  design state."

##### 4. `RoomUploadCard` (460px wide, below hero with `margin-top: 36`)

- Outer card: porcelain bg, `1px solid --sand-border`, radius 24, padding 10
- Inner dashed area: `1.5px dashed --sand-border-strong (#DAD0C0)`, radius 18,
  padding `28/28/24/28`, centered column flex
- Icon chip: 56px square, 16 radius, soft-cream bg, sand border, 14px below.
  Inside: cloud-upload Lucide icon, 26px, charcoal
- Title "Upload a room photo": 17px Inter 600, charcoal
- Sub "or drag and drop": 14px warm-gray, 18px below
- **Primary button** "Choose image" + arrow-right icon:
  - 42px tall, 18px x-padding, sage bg, white text, 14px Inter 600,
    radius 12, shadow `0 8px 20px rgba(73,99,77,0.25)`
- File hint below button: mono 11px dust-gray "JPG, PNG up to 20MB"
- **Hover state** on the whole card: border becomes `rgba(95,127,99,0.45)`,
  shadow upgrades to `0 18px 50px rgba(95,127,99,0.14), 0 0 0 4px rgba(231,239,228,0.6)`
- Whole card is the click target; CSS transition `all .2s ease`

##### 5. `SampleRoomSelector` (460px, `margin-top: 28`)

- Divider row: hairline + mono uppercase 11px label "or try a sample room"
  (dust-gray, 0.12em tracking) + hairline. 16px below.
- Grid: `repeat(4, 1fr)`, gap 12, square aspect-ratio thumbnails
- Each thumbnail: 14 radius, `1.5px solid --sand-border`, overflow hidden,
  `clay` fallback bg. Cover image fills.
- Bottom-left label inside thumb: 10.5px Inter 600 white with text-shadow
  `0 1px 4px rgba(0,0,0,0.5)`
- **Selected** thumbnail (default: Bedroom): border `--sage`, ring
  `0 0 0 3px rgba(231,239,228,0.9)`, plus 18px white dot at top-right with
  inner 8px sage dot
- Labels: Bedroom · Studio · Living room · Workspace
- Clicking a thumbnail sets it as the selected sample. Tie this to project
  state used by the next view.

##### 6. `HeroRoomPreview` (right column, max-width 720px)

- Frame: aspect-ratio `0.92 / 1`, max-height 720, radius 30, overflow hidden,
  shadow `0 20px 50px rgba(31,31,28,0.10), inset 0 0 0 1px rgba(255,255,255,0.4)`,
  fallback bg `--clay`
- Full-bleed `<img>` cover (sample bedroom)
- **Step badge** top-right: 34px charcoal circle, white "1" inside, 14px Inter
  600, `2px solid rgba(255,255,255,0.85)` ring, shadow `0 4px 14px rgba(0,0,0,0.25)`
- **Source label** top-left: blurred dark pill (`rgba(31,31,28,0.55)` +
  `backdrop-filter: blur(8px)`), 999 radius, 6/12 padding, mono 12px white,
  "Source room · sample" with a small green dot
- **Decorative L-shaped tick marks** in each corner (16px, white, opacity 0.65)
- **Below the frame**: small mono uppercase caption "The next interface will
  be generated from your room state" (11.5px dust-gray, 0.04em tracking, with
  a 5px terracotta bullet)

##### 7. `AgentWelcomeCard` (floats inside the bottom of `HeroRoomPreview`)

- Position: absolute, `left/right/bottom: 26`, max-width 420px
- Porcelain bg, sand border, radius 22, shadow `0 18px 60px rgba(31,31,28,0.12)`,
  padding `18/20/16/20`
- Header row:
  - 36px circular avatar with `--mist-sage` bg + `1px solid rgba(95,127,99,0.25)`,
    centering the sage logo mark
  - Name "Interia" (13.5px Inter 600 charcoal) + a small mono "AGENT" tag in
    mist-sage with deep-sage text, uppercase, 0.08em tracking
  - Below name: three 4px sage typing dots (`@keyframes interiaTyping`,
    1.4s ease-in-out infinite, staggered 0/.2/.4s) + mono caption
    "preparing workspace"
- Body: greeting `Hi, I'm Interia.` (14px Inter 600 charcoal) and
  `I'll analyze your room, build a design state, and generate controls
  you can use to refine it visually.` (13.5px warm-gray, line-height 1.5)
- Footer: 1px dashed top border, three mono 10.5px tags
  `· room analysis  · editable zones  · suggestions`
- **Important:** no input field, no message history. This is a presentational
  intro, not a chat surface.

##### 8. Bottom hint (anchored to viewport)

Absolute, `left: 56, bottom: 24` inside the main pane:
- Pill: soft-cream bg, sand border, 999 radius
- Left mark: 22px mist-sage chip with 11px sparkle
- Text "Generated workspace starts after upload" (12px warm-gray)
- Trailing `↵` keycap chip (mono 11px dust-gray, sand border, porcelain bg)

## Interactions & Behavior

- **New Project** is the active sidebar item; other nav items are passive in
  this view.
- **Upload card**: clickable surface (whole card). On hover, sage-tinted
  ring + lifted shadow as described. Clicking opens a file picker.
  Drag-and-drop accepts `image/jpeg`, `image/png` up to 20 MB.
- **Sample rooms**: clicking selects the thumbnail (single-select). Update
  the selection ring and persist the choice into the project state for the
  next view.
- **Choose image button**: same handler as the upload card.
- **Top-right user pill / chevron**: opens an account menu (out of scope here).
- **Agent typing dots**: pure CSS animation, looping. Replace with real agent
  status when wiring CopilotKit.
- **Transitions**: card hover `all .2s ease`; nav items `all .15s ease`.

## State Management

Minimal state for this view:
- `selectedSampleId: 'bedroom' | 'studio' | 'living' | 'workspace' | null`
  (default `'bedroom'` so the preview is populated on first load)
- `uploadedFile: File | null`
- `isDragging: boolean` (for visual hover/drop highlight)
- `agentStatus: 'idle' | 'preparing' | 'analyzing'` — drive the typing dots
  and status pill from this. For now `'preparing'` looks correct.

When the user submits a photo (uploaded or sample), transition to the next
view (out of scope). The selected sample / uploaded file must be available
to that next view.

## Design Tokens

### Colors
| Token | Hex | Usage |
|---|---|---|
| `--warm-canvas` | `#F7F3EC` | App background |
| `--soft-cream` | `#FBF8F2` | Sidebar bg, secondary surfaces, pills |
| `--porcelain` | `#FFFFFF` | Cards |
| `--sand-border` | `#E7DED1` | Borders, dividers |
| `--sand-border-strong` | `#DAD0C0` | Dashed inner border on upload card |
| `--charcoal` | `#1F1F1C` | Primary text |
| `--warm-gray` | `#6F6A61` | Secondary text |
| `--dust-gray` | `#9A9489` | Captions, mono labels |
| `--sage` | `#5F7F63` | Brand accent, primary button |
| `--deep-sage` | `#49634D` | Active text, hover for sage |
| `--mist-sage` | `#E7EFE4` | Active nav bg, agent avatar bg |
| `--terracotta` | `#C97855` | Warm accent (avatar, dots) |
| `--clay` | `#E9C7B3` | Decorative warm tint, image fallback |
| `--muted-gold` | `#C9A96A` | Reserved (not used in this view) |

### Typography
- Family (UI): `Inter`, fallback system-ui. Weights used: 400, 500, 600, 650, 700.
- Family (mono captions): `JetBrains Mono`, fallback `ui-monospace, monospace`.
- Size scale (px) used in this view: 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5,
  14, 14.5, 15, 17, 19, 60.
- Hero title: 60 / 1.04 / weight 650 / letter-spacing -0.035em.

### Spacing
Frame paddings: 72 (top), 56 (left), 40 (right/bottom). Sidebar: 26/18.
Main column gap: 56. Card paddings: 28 (upload inner), 18-22 (agent card).

### Radii
- 12 — buttons, nav items
- 14 — workspace card, sample thumbnails
- 16 — upload icon chip
- 18 — dashed inner upload area
- 22 — agent welcome card
- 24 — upload outer card
- 30 — hero preview frame
- 999 — pills, dots

### Shadows
- Card: `0 12px 40px rgba(31,31,28,0.06)`
- Card hover (sage-tinted): `0 18px 50px rgba(95,127,99,0.14), 0 0 0 4px rgba(231,239,228,0.6)`
- Floating agent card: `0 18px 60px rgba(31,31,28,0.12)`
- Hero preview: `0 20px 50px rgba(31,31,28,0.10), inset 0 0 0 1px rgba(255,255,255,0.4)`
- Sage button: `0 8px 20px rgba(73,99,77,0.25)`

## Assets

**All visual logos and avatars in the prototype are placeholders.** The user
will swap in real brand assets manually:
- `InteriaLogo` mark — currently a small sage SVG diamond. Replace with the
  final brand mark.
- "PLACEHOLDER" tag in the sidebar — remove entirely in production.
- Top-right avatar — currently an "L" on a terracotta gradient. Replace with
  the real user avatar.

Room photography in the prototype is loaded from Unsplash for demo purposes:
- `images.unsplash.com/photo-1616594039964-ae9021a400a0` — main hero preview
- `photo-1505693416388-ac5ce068fe85` — Bedroom thumbnail
- `photo-1567016432779-094069958ea5` — Studio thumbnail
- `photo-1586023492125-27b2c045efd7` — Living room thumbnail
- `photo-1518455027359-f3f8164ba6bd` — Workspace thumbnail

Replace with project-controlled imagery before shipping.

Icons are hand-rolled inline SVGs in the Lucide style (1.6 stroke). Recommend
using the official `lucide-react` package in the React implementation —
icon names map directly: `Plus`, `Folder`, `Sparkles`, `LayoutGrid`,
`SlidersHorizontal`, `Settings`, `UploadCloud`, `ChevronDown`, `ArrowRight`.

## Files

- `Interia Upload.html` — full single-file React + Babel prototype with all
  components inlined. Use as the visual source of truth.
- `original_spec.md` — the original product/design spec the prototype was
  built from. Useful for non-visual context (positioning, copy, scope).
- `reference_mockup.png` — the original reference image provided by the
  product owner.
