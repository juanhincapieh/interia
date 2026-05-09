# Demo prompts

Drop these into the Interia chat to exercise the room-state workflow:

**Start from the sample room**
- "Start a new project for the bedroom sample."

**Set design preferences**
- "I'd like a Japandi style, medium budget, cozy goal, pet-safe."

**Generate a constrained preview**
- "Generate a preview."

**Tighten preservation rules**
- "Mark the desk as fully locked and regenerate."

## Demo path

1. Start the app with mock mode when live AI APIs are unavailable: `INTERIA_MOCK=1 npm run dev`.
2. Open the bedroom sample and wait for the project canvas to load.
3. Confirm the detected window, bed, and desk.
4. Send the preference prompt.
5. Generate a preview and review the fidelity report.
6. Lock the desk and regenerate to show that Interia patches the room state instead of starting over.
