"""Resolve image URLs so Gemini can read dev-server and relative paths."""
from __future__ import annotations

import base64
import os
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen


def resolve_image_for_gemini(image_url: str) -> str:
    """Return a value suitable for LangChain `image_url` blocks.

    - `data:` URIs pass through.
    - ``/generated/*`` files are read from the agent ``data/generated`` tree
      (preview tool writes there; LangGraph does not always HTTP-serve them).
    - Other relative paths are fetched using ``INTERIA_PUBLIC_IMAGE_BASE``
      (default ``http://127.0.0.1:3000``) so the agent can inline bytes —
      Google's API cannot fetch arbitrary ``localhost`` URLs on its own.
    - Public ``https`` URLs pass through when the host is not obviously local.
    """
    u = (image_url or "").strip()
    if not u:
        raise ValueError("empty image_url")
    if u.startswith("data:"):
        return u
    if u.startswith("/generated/"):
        return _local_generated_as_data_url(u)

    fetch_url = u
    if u.startswith("/"):
        base = os.getenv("INTERIA_PUBLIC_IMAGE_BASE", "http://127.0.0.1:3000").rstrip("/")
        fetch_url = f"{base}{u}"

    if _must_inline(fetch_url):
        return _fetch_as_data_url(fetch_url)
    return fetch_url


def _local_generated_as_data_url(url_path: str) -> str:
    rel = url_path.removeprefix("/generated/").lstrip("/")
    if not rel or ".." in Path(rel).parts:
        raise ValueError(f"invalid generated path: {url_path!r}")
    # Must match `preview._extract_image_url` (writes under apps/data/generated).
    root = Path(__file__).resolve().parents[4] / "data" / "generated"
    fp = (root / rel).resolve()
    if root not in fp.parents and fp != root:
        raise ValueError(f"invalid generated path: {url_path!r}")
    if not fp.is_file():
        raise RuntimeError(f"generated image not found: {fp}")
    data = fp.read_bytes()
    b64 = base64.b64encode(data).decode("ascii")
    return f"data:image/png;base64,{b64}"


def _must_inline(url: str) -> bool:
    try:
        parsed = urlparse(url)
        scheme = (parsed.scheme or "").lower()
        host = (parsed.hostname or "").lower()
        if scheme == "file":
            return True
        if host in ("localhost", "127.0.0.1"):
            return True
        if host.startswith("192.168.") or host.startswith("10."):
            return True
        if scheme == "http":
            return True
        return False
    except Exception:
        return True


def _fetch_as_data_url(url: str) -> str:
    req = Request(url, headers={"User-Agent": "InteriaAgent/1.0"})
    try:
        with urlopen(req, timeout=120) as resp:
            data = resp.read()
            ct = resp.headers.get_content_type() or "image/jpeg"
    except (HTTPError, URLError, TimeoutError, OSError) as e:
        raise RuntimeError(f"failed to fetch image from {url!r}: {e}") from e
    b64 = base64.b64encode(data).decode("ascii")
    return f"data:{ct};base64,{b64}"
