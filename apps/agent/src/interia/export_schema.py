"""Emit a single JSON file with the JSON Schema of every public model.

Used by `scripts/codegen-types.mjs` to generate the TS mirror.
"""
from __future__ import annotations

import json
import sys

from src.interia import schemas as s


def main() -> None:
    payload = {
        "RoomState": s.RoomState.model_json_schema(),
        "RoomObject": s.RoomObject.model_json_schema(),
        "RoomRelation": s.RoomRelation.model_json_schema(),
        "LockSet": s.LockSet.model_json_schema(),
        "DesignPreference": s.DesignPreference.model_json_schema(),
        "DesignPlan": s.DesignPlan.model_json_schema(),
        "DesignPatch": s.DesignPatch.model_json_schema(),
        "Preview": s.Preview.model_json_schema(),
        "FidelityReport": s.FidelityReport.model_json_schema(),
        "AgentTraceEvent": s.AgentTraceEvent.model_json_schema(),
        "CatalogItem": s.CatalogItem.model_json_schema(),
    }
    json.dump(payload, sys.stdout, indent=2)


if __name__ == "__main__":
    main()
