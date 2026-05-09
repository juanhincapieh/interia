"""Interia tool registry."""
from __future__ import annotations

from .vision import analyze_room


def all_tools() -> list:
    return [analyze_room]
