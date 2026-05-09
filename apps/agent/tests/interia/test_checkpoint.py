from src.interia.tools.checkpoint import checkpoint


def test_checkpoint_appends_trace_and_marks_state() -> None:
    state = {
        "version": 3, "trace": [],
        "source": {"imageUrl": "/x.jpg", "uploadedAt": "2026-05-09T10:00:00Z"},
        "shell": {"roomType": "bedroom", "cameraAngle": "corner-left"},
        "grid": {"rows": 4, "cols": 4},
        "objects": [], "relations": [], "editContract": {}, "patches": [],
    }
    out = checkpoint.invoke({"state": state})
    assert out["trace"][-1]["type"] == "user_decision"
    assert out["trace"][-1]["outputSummary"].startswith("checkpoint saved")
