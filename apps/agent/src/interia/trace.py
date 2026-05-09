"""Helper for appending AgentTraceEvent entries onto a Room State dict."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4


def append_trace(
    state: dict[str, Any],
    *,
    type: str,
    input_summary: str,
    output_summary: str,
) -> dict[str, Any]:
    event = {
        "id": f"trace_{uuid4().hex[:8]}",
        "type": type,
        "inputSummary": input_summary,
        "outputSummary": output_summary,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    return {**state, "trace": [*state.get("trace", []), event]}
