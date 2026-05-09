import pytest

from src.interia.schemas import Preview
from src.interia.tools.preview import generate_preview


def test_mock_returns_placeholder(monkeypatch) -> None:
    monkeypatch.setenv("INTERIA_MOCK", "1")
    state = {
        "version": 1,
        "source": {"imageUrl": "/samples/bedroom.jpg", "sampleId": "bedroom", "uploadedAt": "2026-05-09T10:00:00Z"},
        "shell": {"roomType": "bedroom", "cameraAngle": "corner-left"},
        "grid": {"rows": 4, "cols": 4},
        "objects": [],
        "relations": [],
        "editContract": {},
        "patches": [],
        "trace": [],
    }
    out = generate_preview.invoke({"state": state})
    p = Preview.model_validate(out)
    assert p.generationProvider == "mock"
    assert p.imageUrl.endswith("bedroom.png")
