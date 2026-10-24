"""The fixed task prompt and the user-message builder.

Mubit groups calls into a task by system prompt, model, tools and output format. Changing
SYSTEM_PROMPT or MODEL starts a new task with zero kept examples: do not edit them casually.
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MODEL = "claude-sonnet-5-5"

SYSTEM_PROMPT = (
    "You design icons. The user message gives a concept and may also give a style guide and "
    "example icons in that style. Reply with one SVG icon for the concept. If a style guide or "
    "examples are given, follow them exactly. Output only the SVG markup, with no explanation."
)


def seeds():
    """Example icons in the target style: {name: svg}."""
    return {p.stem: p.read_text().strip() for p in sorted((ROOT / "style" / "seeds").glob("*.svg"))}


def user_message(concept, style=None, examples=None):
    """Build the user message: optional style guide, optional example icons, then the concept."""
    parts = []
    if style:
        parts.append(f"## Style guide\n\n{style.strip()}")
    if examples:
        icons = "\n\n".join(f'<example concept="{name}">\n{svg}\n</example>' for name, svg in examples.items())
        parts.append(f"## Example icons\n\n{icons}")
    parts.append(f"## Concept\n\n{concept}")
    return "\n\n".join(parts)
