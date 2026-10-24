"""Calls through the Mubit proxy. The key comes from .env and is never printed."""

import os
from pathlib import Path

from anthropic import Anthropic

BASE_URL = "https://api.mubit.ai/anthropic"
ROOT = Path(__file__).resolve().parent.parent


def _load_key():
    if os.environ.get("MUBIT_API_KEY"):
        return os.environ["MUBIT_API_KEY"]
    for line in (ROOT / ".env").read_text().splitlines():
        if line.startswith("MUBIT_API_KEY="):
            return line.split("=", 1)[1].strip().strip("\"'")
    raise RuntimeError("MUBIT_API_KEY not found in the environment or .env")


# Any other Anthropic credential sent alongside the Mubit key gets a 401.
for name in ("ANTHROPIC_API_KEY", "ANTHROPIC_AUTH_TOKEN"):
    os.environ.pop(name, None)

_client = Anthropic(base_url=BASE_URL, api_key=_load_key())


def call(system, user, model, record, session, max_tokens=2000):
    """Send one message. `record` is "full" (may become a kept example) or "metadata" (never kept).

    Returns the reply text, Mubit's request ID and token usage.
    """
    raw = _client.messages.with_raw_response.create(
        model=model,
        system=system,
        messages=[{"role": "user", "content": user}],
        max_tokens=max_tokens,
        metadata={"user_id": session},
        extra_headers={"x-middleware-record": record},
    )
    message = raw.parse()
    text = "".join(block.text for block in message.content if block.type == "text")
    return {
        "text": text,
        "request_id": raw.headers.get("x-middleware-request-id"),
        "input_tokens": message.usage.input_tokens,
        "output_tokens": message.usage.output_tokens,
    }
