from src.interia.tools.design import get_catalog_options


def test_filters_by_style_and_category() -> None:
    items = get_catalog_options.invoke({"category": "lamps", "style": "japandi", "budget": "low"})
    assert items
    assert all("japandi" in i["compatibleStyles"] for i in items)
    assert all(i["priceTier"] == "low" for i in items)
