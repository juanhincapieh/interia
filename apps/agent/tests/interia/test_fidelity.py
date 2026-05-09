from src.interia.schemas import FidelityReport
from src.interia.tools.fidelity import validate_fidelity


def _state_with_locks() -> dict:
    return {
        "version": 2,
        "source": {"imageUrl": "/samples/bedroom.jpg", "sampleId": "bedroom", "uploadedAt": "2026-05-09T10:00:00Z"},
        "shell": {"roomType": "bedroom", "cameraAngle": "corner-left"},
        "grid": {"rows": 4, "cols": 4},
        "objects": [
            {"id": "obj_window_1", "type": "window", "label": "W", "description": "x",
             "gridPosition": "A2", "approximateSize": "medium",
             "confidence": 0.95, "detectedBy": "vision", "confirmedByUser": True},
        ],
        "relations": [],
        "editContract": {"obj_window_1": {"identity": "locked", "position": "locked", "appearance": "locked"}},
        "patches": [],
        "trace": [],
    }


def _preview() -> dict:
    return {
        "id": "prev_abc",
        "imageUrl": "/mock_previews/bedroom.png",
        "promptSummary": "x",
        "generationProvider": "mock",
        "fromVersion": 2,
        "createdAt": "2026-05-09T10:01:00Z",
    }


def test_mock_returns_high_score(monkeypatch) -> None:
    monkeypatch.setenv("INTERIA_MOCK", "1")
    out = validate_fidelity.invoke({"state": _state_with_locks(), "preview": _preview()})
    report = FidelityReport.model_validate(out)
    assert report.systemScore >= 80
    assert report.recommendedAction in {"accept", "regenerate_with_stronger_locks", "ask_user_to_unlock"}
