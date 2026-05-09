"""LangGraph entry point for `langgraph dev --port 8133`.

Wires the Interia agent: switchable runtime (Gemini Flash-Lite by default),
Room State middleware, and the Interia tool list. Frontend tools come through
the React side via useFrontendTool — they MUST NOT be passed in here.
"""
from __future__ import annotations

import os

from dotenv import load_dotenv

from src.intelligence_cleanup import wipe_orphan_threads
from src.interia.prompts import build_system_prompt
from src.interia.tools import all_tools
from src.runtime import build_graph


load_dotenv()
wipe_orphan_threads()

_AGENT_RUNTIME = os.getenv("AGENT_RUNTIME", "gemini-flash-deep")
print(f"[runtime] AGENT_RUNTIME={_AGENT_RUNTIME}", flush=True)

_gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""
if _AGENT_RUNTIME.startswith("gemini-") and (
    not _gemini_key or _gemini_key.startswith("stub")
):
    print(
        "\n  GEMINI_API_KEY is unset or a stub.\n"
        "   The agent will boot but chat will fail on the first turn.\n"
        "   Set GEMINI_API_KEY in agent/.env (and/or .env at repo root).\n",
        flush=True,
    )


_use_noop = (
    _AGENT_RUNTIME.startswith("gemini-")
    and (not _gemini_key or _gemini_key.startswith("stub"))
)
if _use_noop:
    print(
        "\n[runtime] GEMINI_API_KEY missing or stub — using noop fallback graph.\n",
        flush=True,
    )

_integration_status = (
    "mock mode active (INTERIA_MOCK=1)"
    if os.getenv("INTERIA_MOCK") == "1"
    else "live tools active"
)

graph = build_graph(
    "noop" if _use_noop else _AGENT_RUNTIME,
    tools=all_tools(),
    system_prompt=build_system_prompt(_integration_status),
)


def main() -> None:
    import subprocess

    subprocess.run(["langgraph", "dev", "--port", "8133"], check=True)


if __name__ == "__main__":
    main()
