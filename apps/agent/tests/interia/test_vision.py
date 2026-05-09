"""Tests for analyze_room."""
from __future__ import annotations

from src.interia.tools.vision import analyze_room


def test_mock_returns_canned_bedroom(monkeypatch) -> None:
    monkeypatch.setenv("INTERIA_MOCK", "1")
    result = analyze_room.invoke({"image_url": "/samples/bedroom.jpg", "sample_id": "bedroom"})
    assert result["roomType"] == "bedroom"
    assert any(o["type"] == "window" for o in result["objects"])


def test_mock_falls_back_to_bedroom_for_unknown(monkeypatch) -> None:
    monkeypatch.setenv("INTERIA_MOCK", "1")
    result = analyze_room.invoke({"image_url": "/uploads/x.jpg"})
    assert result["roomType"] in {"bedroom", "studio", "living", "workspace"}
