"""Middleware that advertises the `roomState` key on the agent's shared state."""
from __future__ import annotations

from typing import Any

from langgraph.types import Command


class RoomStateMiddleware:
    def state_schema_extras(self) -> dict[str, Any]:
        return {"roomState": dict}

    def __call__(self, state: dict, *, config: Any | None = None) -> Command | None:
        return None
