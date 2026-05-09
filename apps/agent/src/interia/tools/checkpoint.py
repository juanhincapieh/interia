"""checkpoint: mark the current Room State as user-accepted."""
from __future__ import annotations

from langchain_core.tools import tool

from ..trace import append_trace


@tool
def checkpoint(state: dict) -> dict:
    """Append a user_decision trace event marking this state as accepted.

    Persistence is handled by CopilotKit Intelligence at the thread level —
    no separate database write needed.
    """
    return append_trace(
        state,
        type="user_decision",
        input_summary=f"version={state['version']}",
        output_summary=f"checkpoint saved at v{state['version']}",
    )
