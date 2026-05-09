from src.interia.trace import append_trace


def test_append_trace_returns_new_state() -> None:
    s = {"trace": []}
    s2 = append_trace(s, type="tool_result", input_summary="analyze_room()", output_summary="ok")
    assert len(s2["trace"]) == 1
    assert s2["trace"][0]["type"] == "tool_result"
    assert s["trace"] == []   # original untouched
