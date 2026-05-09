import pytest

from src.interia.schemas import DesignPlan
from src.interia.tools.design import generate_design_plan


@pytest.fixture
def state_dict() -> dict:
    return {
        "version": 1,
        "source": {"imageUrl": "/x.jpg", "uploadedAt": "2026-05-09T10:00:00Z"},
        "shell": {"roomType": "bedroom", "cameraAngle": "corner-left"},
        "grid": {"rows": 4, "cols": 4},
        "objects": [],
        "relations": [],
        "editContract": {},
        "patches": [],
        "trace": [],
    }


def test_mock_returns_japandi_plan(monkeypatch, state_dict) -> None:
    monkeypatch.setenv("INTERIA_MOCK", "1")
    result = generate_design_plan.invoke({
        "state": state_dict,
        "preferences": {
            "style": "japandi",
            "budget": "medium",
            "goal": "cozy",
            "constraints": ["pet-safe"],
        },
    })
    plan = DesignPlan.model_validate(result)
    assert plan.palette.swatches
    assert plan.actionPlan
