"""Smoke test for the RoomStateMiddleware."""
from src.interia.middleware import RoomStateMiddleware


def test_middleware_advertises_room_state_key() -> None:
    mw = RoomStateMiddleware()
    schema = mw.state_schema_extras()
    assert "roomState" in schema
