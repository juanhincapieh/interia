from src.interia.prompts import build_system_prompt


def test_prompt_includes_workflow_contract() -> None:
    prompt = build_system_prompt(integration_status="ok")
    for marker in [
        "1.", "2.", "3.", "4.", "5.", "6.", "7.", "8.", "9.", "10.", "11.",
        "Room State",
        "Edit Contract",
        "DO NOT generate previews",
        "fidelity",
    ]:
        assert marker in prompt, f"missing marker: {marker}"
