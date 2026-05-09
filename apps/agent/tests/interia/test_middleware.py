"""Smoke test for the RoomStateMiddleware."""
from langchain.agents.middleware.types import AgentMiddleware

from src.interia.middleware import RoomStateMiddleware


def test_middleware_advertises_room_state_key() -> None:
    mw = RoomStateMiddleware()
    schema = mw.state_schema_extras()
    assert "roomState" in schema


def test_middleware_implements_agent_middleware_interface() -> None:
    mw = RoomStateMiddleware()
    assert isinstance(mw, AgentMiddleware)
    assert hasattr(mw.__class__, "wrap_tool_call")
