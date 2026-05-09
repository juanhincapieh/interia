"""Tests for remix_room_from_photo."""
import pytest

from src.interia.schemas import RoomState
from src.interia.tools.pipeline import remix_room_from_photo


def test_remix_mock_full_pipeline(monkeypatch) -> None:
    monkeypatch.setenv("INTERIA_MOCK", "1")
    out = remix_room_from_photo.invoke(
        {
            "image_url": "http://127.0.0.1:3000/samples/bedroom.jpg",
            "sample_id": "bedroom",
        }
    )
    assert "roomState" in out
    assert "headline" in out
    assert out["preview"]["generationProvider"] == "mock"
    assert out["fidelity"]["systemScore"] == 87
    rs = RoomState.model_validate(out["roomState"])
    assert rs.preview is not None
    assert rs.fidelity is not None
    assert rs.designPlan is not None
    assert rs.source.imageUrl == "/samples/bedroom.jpg"


def test_remix_upload_stores_relative_path(monkeypatch) -> None:
    monkeypatch.setenv("INTERIA_MOCK", "1")
    out = remix_room_from_photo.invoke(
        {
            "image_url": "http://127.0.0.1:3000/uploads/interia/abc.jpg",
            "sample_id": None,
        }
    )
    rs = RoomState.model_validate(out["roomState"])
    assert rs.source.imageUrl == "/uploads/interia/abc.jpg"
    assert rs.source.sampleId is None
