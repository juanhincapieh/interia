# Interia — Upload View Design Specification for Claude Design

## 0. Instruction to Claude Design

Create **only the first product view** for Interia: the initial upload/home tab where the user starts a new room design project by uploading a room photo.

Do **not** generate the full app flow yet. Do **not** create the room analysis screen, design board, object refinement screen, preview screen, fidelity report screen, or ecommerce-style product catalog. This spec is intentionally limited to the first view.

The output should be a polished, high-fidelity, interactive web app mockup for a hackathon demo.

---

## 1. Product Context

### Product name

**Interia**

### Meaning

Interia = **Interior + Interactive + AI**

### Tagline

**Interactive Interior AI**

### Product concept

Interia is an agentic interface for interior design. The user uploads a room photo, and the AI agent later turns that photo into an editable room state with locked elements, editable zones, design suggestions, and visual previews.

For this first screen, the UI should communicate the beginning of that journey:

> Upload a room photo. Interia will analyze it, understand the space, and generate an interactive design interface for that specific room.

### Core positioning

Interia is **not** a chatbot.
Interia is **not** a generic interior design dashboard.
Interia is **not** an ecommerce marketplace.

Interia is a warm, visual, agent-generated design workspace.

---

## 2. Scope of This Mockup

### Build only this view

**View name:** Upload / Home / New Project

### Primary user goal

The user wants to start a new room design project by uploading a room photo or selecting a sample room.

### This view must include

1. Interia brand area.
2. Left sidebar navigation.
3. Hero message.
4. Room photo upload card.
5. Sample room selector.
6. Large warm room preview image.
7. Small floating agent introduction card.
8. Top-right user/profile control.
9. Subtle hints that the app is agentic and interactive.

### This view must not include

- Room analysis results.
- Bounding boxes.
- Grid overlay.
- Design board.
- Product recommendations.
- Real product names or prices.
- Fidelity report.
- Full chat interface.
- Complex dashboard widgets.

---

## 3. Visual Direction

### Desired feeling

The screen should feel like a premium, warm, modern interior design studio powered by AI.

It should feel:

- calm;
- elegant;
- minimal;
- warm;
- spacious;
- visual;
- intelligent;
- friendly;
- high-end but approachable.

### Avoid

- corporate SaaS dashboard aesthetic;
- heavy blue/purple AI gradients;
- dark mode;
- ecommerce marketplace layout;
- crowded UI;
- chat-first layout;
- generic dashboard cards.

---

## 4. Color System

Use a warm minimal interior-studio palette.

### Base colors

| Token | Usage | HEX |
|---|---|---|
| `warm-canvas` | Main app background | `#F7F3EC` |
| `soft-cream` | Secondary background | `#FBF8F2` |
| `porcelain` | Cards / panels | `#FFFFFF` |
| `sand-border` | Borders / dividers | `#E7DED1` |
| `charcoal` | Primary text | `#1F1F1C` |
| `warm-gray` | Secondary text | `#6F6A61` |
| `dust-gray` | Muted text / captions | `#9A9489` |

### Brand colors

| Token | Usage | HEX |
|---|---|---|
| `sage` | Primary action / brand accent | `#5F7F63` |
| `deep-sage` | Button hover / strong accent | `#49634D` |
| `mist-sage` | Active nav item / soft highlight | `#E7EFE4` |
| `terracotta` | Warm accent | `#C97855` |
| `clay` | Soft decorative accent | `#E9C7B3` |
| `muted-gold` | Small premium accent | `#C9A96A` |

### Recommended usage

- Background: `warm-canvas`.
- Main content cards: `porcelain`.
- Active sidebar item: `mist-sage` with `sage` text/icon.
- Primary button: `sage`, hover `deep-sage`.
- Upload card icon: `charcoal` or `sage`.
- Decorative highlights: `terracotta`, `clay`, or `muted-gold`, used sparingly.

---

## 5. Typography

Use a clean modern sans serif.

Recommended fonts:

- Inter;
- Geist;
- SF Pro;
- Manrope.

### Type scale

| Element | Size | Weight | Color |
|---|---:|---:|---|
| Hero title | 56–64 px | 650–750 | `charcoal` |
| Hero highlighted word | 56–64 px | 650–750 | `sage` |
| Subtitle | 16–18 px | 400 | `warm-gray` |
| Card title | 16–20 px | 600 | `charcoal` |
| Body text | 14–16 px | 400 | `warm-gray` |
| Small labels | 11–13 px | 500 | `dust-gray` |
| Button text | 14–15 px | 600 | white or `charcoal` |

### Hero title text

Use this exact heading:

```text
Design your space,
interactively.
```

The word **interactively** should be in `sage`.

### Subtitle text

Use this exact subtitle:

```text
Upload a photo of your room and let Interia turn it into an editable design state.
```

---

## 6. Layout Specification

### Canvas

Desktop-first layout.

Recommended frame:

- Width: 1440 px or 1512 px.
- Height: 900 px or 982 px.
- Background: `warm-canvas`.

### Main structure

Use a three-zone layout:

```text
┌────────────────────────────────────────────────────────────┐
│ Left Sidebar │ Main Hero + Upload Area │ Large Room Preview │
└────────────────────────────────────────────────────────────┘
```

### Sidebar

- Width: 230–250 px.
- Full height.
- Background: slightly lighter or same as main background.
- Right border: `1px solid #E7DED1`.
- Padding: 24 px.

### Main content area

- Use a two-column layout.
- Left column: hero text + upload card + sample room selector.
- Right column: large room image preview.
- Max content width should feel spacious.
- Gap between columns: 48–64 px.
- Main content top padding: 56–72 px.

### Suggested proportional layout

```text
Sidebar: 240px
Main left column: 460–520px
Right preview: 560–680px
Outer gap: 32px
```

---

## 7. Sidebar Design

### Logo area

Top-left logo:

```text
✦ interia
```

Style:

- Use a small sparkle/star icon before the wordmark.
- Wordmark lowercase: `interia`.
- Font weight: 650–700.
- Text color: `charcoal`.
- Sparkle color: `sage`.

### Navigation items

Use these exact nav items:

1. New Project
2. Projects
3. Inspiration
4. Catalog
5. Preferences
6. Settings

### Active item

Active item: **New Project**

Style:

- Background: `mist-sage`.
- Text/icon: `sage` or `deep-sage`.
- Border radius: 12–14 px.
- Height: 44–48 px.

### Inactive items

- Text: `warm-gray`.
- Icon: muted line icon.
- Hover state: soft cream / subtle border.

### Suggested icons

Use line icons similar to Lucide:

- New Project: plus.
- Projects: folder.
- Inspiration: sparkles or heart.
- Catalog: grid.
- Preferences: sliders.
- Settings: gear.

---

## 8. Main Hero Section

### Placement

Left column, upper part of the main workspace.

### Title

```text
Design your space,
interactively.
```

Visual treatment:

- Two lines.
- First line in `charcoal`.
- Second line in `sage`.
- Large and confident.
- Do not center; left-align.

### Subtitle

```text
Upload a photo of your room and let Interia turn it into an editable design state.
```

Keep it below the title with 16–20 px spacing.
Max width: 380–440 px.

### Small agentic label

Above or below the subtitle, include a subtle pill:

```text
Agent-generated design workspace
```

Style:

- Background: `soft-cream`.
- Border: `sand-border`.
- Text: `warm-gray`.
- Small sparkle icon in `sage`.

---

## 9. Upload Card

### Component name

`RoomUploadCard`

### Purpose

This is the main call to action of the first view.

### Position

Below the hero text.

### Size

Approximate:

- Width: 400–440 px.
- Height: 190–220 px.

### Style

- Background: `porcelain`.
- Border: `1px solid #E7DED1`.
- Border radius: 24 px.
- Shadow: `0 12px 40px rgba(31,31,28,0.06)`.
- Inner padding: 28–32 px.
- Centered content.

### Content

Icon:

- Cloud upload or image upload icon.
- Size: 32–40 px.
- Color: `charcoal` or `sage`.

Main text:

```text
Upload a room photo
```

Secondary text:

```text
or drag and drop
```

File hint:

```text
JPG, PNG up to 20MB
```

### Button state

The upload card should look clickable.

Optional primary button inside card:

```text
Choose image
```

Button style:

- Background: `sage`.
- Text: white.
- Radius: 14 px.
- Height: 40–44 px.

### Drag state hint

Add a subtle dashed inner border or hover overlay to imply drag-and-drop.

Do not make it visually noisy.

---

## 10. Sample Room Selector

### Purpose

Allow the user to start quickly without uploading an image.

### Position

Below the upload card.

### Label

```text
or try a sample room
```

### Content

Display 4 small thumbnail cards.

Sample labels may be hidden or very small:

- Bedroom
- Studio
- Living room
- Workspace

### Thumbnail style

- Size: 64–76 px wide.
- Aspect ratio: 4:3 or square.
- Border radius: 12 px.
- Border: `1px solid #E7DED1`.
- Active hover border: `sage`.

### Required behavior visually

The thumbnails should look clickable.

---

## 11. Large Room Preview

### Component name

`HeroRoomPreview`

### Purpose

Show an aspirational warm bedroom image that previews the kind of space Interia can redesign.

### Position

Right column.

### Size

- Width: 560–680 px.
- Height: 620–760 px.
- Border radius: 28–32 px.

### Image style

Use a realistic warm interior photo placeholder:

- cozy bedroom;
- natural window light;
- warm neutral bedding;
- wooden desk or chair;
- small plant;
- soft wall decor;
- calm atmosphere.

### Overlay elements

Add a subtle numbered badge in the top-right corner:

```text
1
```

Style:

- Black or charcoal circle.
- White number.
- Small, 28–34 px.

This suggests this is step 1 without adding a full progress wizard.

### Optional visual annotation

Very subtle label near the image:

```text
Source room
```

But avoid analysis labels or bounding boxes on this first screen.

---

## 12. Floating Agent Card

### Component name

`AgentWelcomeCard`

### Purpose

Introduce Interia as the agent without turning the screen into a chat app.

### Position

Floating over the lower-left or lower-middle area of the large room preview.

### Style

- Background: `porcelain`.
- Border: `1px solid #E7DED1`.
- Radius: 18–22 px.
- Shadow: `0 18px 60px rgba(31,31,28,0.12)`.
- Width: 300–360 px.
- Padding: 18–22 px.

### Include small agent icon

Use a sparkle, wand, or small circular assistant icon.

### Copy

Use this exact text:

```text
Hi, I’m Interia.
I’ll analyze your room, build a design state, and generate controls you can use to refine it visually.
```

### Important

This should look like an assistant message card, but not a chat window.
Do not include a text input or chat history.

---

## 13. Top-Right User Control

### Content

A small user pill:

```text
Hi, Laura
```

with a small circular avatar and chevron.

### Style

- Background: `soft-cream` or transparent.
- Border: optional `sand-border`.
- Radius: 999 px.
- Text: `warm-gray`.

Position it at the top-right of the main content area.

---

## 14. Agentic UI Hints

Even though this is only the first screen, it should hint at the agentic nature of the product.

Include one or two subtle UI labels such as:

```text
Generated workspace starts after upload
```

or

```text
The next interface will be generated from your room state
```

These should be subtle captions, not large marketing copy.

Recommended placement:

- Below upload card.
- Near agent welcome card.
- As a small pill under the hero subtitle.

---

## 15. Component Checklist

The first view should include these components only:

- `AppShell`
- `Sidebar`
- `InteriaLogo`
- `TopUserMenu`
- `HeroIntro`
- `AgenticLabelPill`
- `RoomUploadCard`
- `SampleRoomSelector`
- `HeroRoomPreview`
- `AgentWelcomeCard`

Do not include later-stage components yet.

Do not include:

- `RoomAnalysisPanel`
- `RoomGridOverlay`
- `DetectedObjectsConfirmation`
- `DesignBoard`
- `ElementRefinementPanel`
- `PreviewPanel`
- `FidelityReportCard`
- `RoomStateInspector`
- `AgentTracePanel`

---

## 16. Interaction States to Show

The mockup should feel interactive, even if it is static.

Show these states visually:

1. **New Project** selected in sidebar.
2. Upload card is clickable.
3. Sample room thumbnails are clickable.
4. One thumbnail may show a subtle hover or selected border.
5. The agent welcome card appears as a contextual overlay.
6. The right preview image looks like the current selected sample or future uploaded room.

Optional micro-interaction indicators:

- Slight green glow on upload card.
- Hover border on one sample room.
- Small sparkle icon next to agentic label.

---

## 17. Copy Reference

Use this exact copy unless there is a strong visual reason to shorten it.

### Hero

```text
Design your space,
interactively.
```

### Subtitle

```text
Upload a photo of your room and let Interia turn it into an editable design state.
```

### Agentic pill

```text
Agent-generated design workspace
```

### Upload card

```text
Upload a room photo
or drag and drop
JPG, PNG up to 20MB
```

### Sample label

```text
or try a sample room
```

### Agent card

```text
Hi, I’m Interia.
I’ll analyze your room, build a design state, and generate controls you can use to refine it visually.
```

### Subtle hint

```text
The next interface will be generated from your room state.
```

---

## 18. Design Quality Bar

The first view should be strong enough to use as the opening slide of a hackathon demo.

It should immediately communicate:

- this is an AI interior design product;
- it is visual and interactive;
- it starts from a room photo;
- it is warm and polished;
- it is not a chatbot wrapper;
- it is not a product marketplace;
- it has agentic UI potential.

---

## 19. Final Prompt for Claude Design

Use the following as the direct build instruction:

```text
Create a high-fidelity interactive web mockup for the first view of “Interia” — Interactive Interior AI.

Build only the Upload / Home / New Project screen. Do not create the rest of the app yet.

Interia is an agentic interior design interface. The user uploads a room photo, and later the AI agent turns it into an editable room state with generated controls. This first view should invite the user to upload a room photo and visually communicate that the next interface will be generated from the room state.

The screen must not look like a chatbot, a generic dashboard, or an ecommerce app. It should feel like a warm, premium, minimal interior design studio powered by AI.

Use this palette:
- Background: #F7F3EC
- Secondary background: #FBF8F2
- Cards: #FFFFFF
- Borders: #E7DED1
- Main text: #1F1F1C
- Secondary text: #6F6A61
- Muted text: #9A9489
- Primary sage: #5F7F63
- Deep sage: #49634D
- Soft sage: #E7EFE4
- Terracotta accent: #C97855
- Clay accent: #E9C7B3
- Muted gold: #C9A96A

Use a modern sans serif font such as Inter, Geist, SF Pro, or Manrope.
Use large elegant typography, rounded cards, soft shadows, warm spacing, and realistic warm interior imagery.

Desktop layout:
- Left sidebar, around 240px wide.
- Main content with hero text and upload card.
- Large room preview image on the right.
- Top-right user menu.

Sidebar:
Logo: “✦ interia” with sage sparkle and charcoal wordmark.
Nav items: New Project, Projects, Inspiration, Catalog, Preferences, Settings.
Active item: New Project, with soft sage background.

Hero section:
Title: “Design your space, interactively.”
Make “interactively” sage green.
Subtitle: “Upload a photo of your room and let Interia turn it into an editable design state.”
Small pill: “Agent-generated design workspace”.

Upload card:
Create a centered card with cloud upload icon.
Text:
“Upload a room photo”
“or drag and drop”
“JPG, PNG up to 20MB”
Make it clearly clickable. Use white card, sand border, 24px radius, and soft shadow.
Optional button: “Choose image”.

Sample rooms:
Below the upload card, show text: “or try a sample room”.
Show 4 small warm room thumbnails: Bedroom, Studio, Living room, Workspace.
Make thumbnails clickable with rounded corners.

Right preview:
Show a large warm bedroom image with natural light, neutral bedding, wood, plant, and soft wall decor. Use a large rounded rectangle with 28–32px radius.
Add a small circular badge with number “1” in the top-right corner of the image.

Floating agent card:
Place it over the lower area of the room preview.
Text:
“Hi, I’m Interia.
I’ll analyze your room, build a design state, and generate controls you can use to refine it visually.”
It should look like an assistant card, but not a chat window. Do not add chat input.

Top-right user control:
Small pill with avatar and text “Hi, Laura”.

Subtle agentic hint:
Include a small caption somewhere near the upload area:
“The next interface will be generated from your room state.”

Only include these components:
AppShell, Sidebar, InteriaLogo, TopUserMenu, HeroIntro, AgenticLabelPill, RoomUploadCard, SampleRoomSelector, HeroRoomPreview, AgentWelcomeCard.

Do not include analysis panels, grids, bounding boxes, design boards, product cards, previews, fidelity reports, room state inspectors, or agent traces in this first view.

The final result should be polished, spacious, warm, and demo-ready for a generative UI hackathon.
```
