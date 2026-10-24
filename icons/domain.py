"""The icon domain for the lesson router: description, settable parameters and deterministic rules."""

import re
import xml.etree.ElementTree as ET

from router.extract import parameter_lesson

description = (
    "One SVG icon per concept on a 24 × 24 canvas, drawn with strokes. The user is a developer "
    "growing a bespoke icon style for their product from directions, critiques, picks and edits."
)

parameters = {
    "stroke-width": "stroke width in px on the root element, for example 1.5",
    "stroke-linecap": "round, square or butt",
    "stroke-linejoin": "round, miter or bevel",
    "fill": "fill of non-accent shapes: none or a colour",
    "accent": "whether icons carry the accent dot: one or none",
    "accent-color": "CSS colour applied to the accent, for example #7C3AED",
}

THIN = re.compile(r"\b(thin|thinner|lighter|finer|hairline|delicate)\b")
THICK = re.compile(r"\b(thick|thicker|bold|bolder|heavier|heavy|chunky)\b")
ROUND = re.compile(r"\b(round|rounded|rounder)\b")
SQUARE = re.compile(r"\b(square|squared|sharp|angular)\b")
DOT = re.compile(r"\b(dot|dots|accent)\b")
NEGATIVE = re.compile(r"\b(rid|remove|drop|no|without|lose|distracting|kill)\b")
HEX = re.compile(r"#[0-9a-f]{6}\b")


def _current(lessons, name, default):
    for lesson in lessons:
        p = lesson.get("parameter")
        if p and p["name"] == name:
            return p["value"]
    return default


def _root(svg):
    return ET.fromstring(svg)


def _count(svg):
    return sum(1 for el in _root(svg).iter()) - 1


def rules(signal, lessons):
    """Keyword and diff rules. Returns lesson records; picks yield nothing."""
    found = []
    scope = "style" if signal["signal"] == "direction" else "instance"
    text = (signal.get("text") or "").lower()

    if text:
        width = float(_current(lessons, "stroke-width", "1.5"))
        if THIN.search(text):
            value = f"{width - 0.25:g}"
            found.append(parameter_lesson(f"Strokes are {value} px wide.", "stroke-width", value, scope, lessons, text))
        elif THICK.search(text):
            value = f"{width + 0.25:g}"
            found.append(parameter_lesson(f"Strokes are {value} px wide.", "stroke-width", value, scope, lessons, text))
        if ROUND.search(text):
            found.append(parameter_lesson("Line caps are round.", "stroke-linecap", "round", scope, lessons, text))
            found.append(parameter_lesson("Line joins are round.", "stroke-linejoin", "round", scope, lessons, text))
        if SQUARE.search(text):
            found.append(parameter_lesson("Line caps are square.", "stroke-linecap", "square", scope, lessons, text))
            found.append(parameter_lesson("Line joins are mitred.", "stroke-linejoin", "miter", scope, lessons, text))
        if DOT.search(text) and NEGATIVE.search(text):
            found.append(parameter_lesson("Icons have no accent dot.", "accent", "none", scope, lessons, text))
        match = HEX.search(text)
        if match:
            found.append(parameter_lesson(f"The accent colour is {match.group(0)}.", "accent-color", match.group(0), scope, lessons, text))

    if signal["signal"] == "edit":
        before, after = signal["before"]["content"], signal["after"]["content"]
        rb, ra = _root(before), _root(after)
        for name in ("stroke-width", "stroke-linecap", "stroke-linejoin", "fill"):
            if rb.get(name) != ra.get(name) and ra.get(name) is not None:
                value = ra.get(name)
                found.append(parameter_lesson(f"Root {name} is {value}.", name, value, "style", lessons, "edit"))
        if 'class="accent"' in before and 'class="accent"' not in after:
            found.append(parameter_lesson("Icons have no accent dot.", "accent", "none", "style", lessons, "edit"))
        if _count(after) < _count(before):
            found.append({
                "statement": f"The {signal['before']['concept']} icon is simpler with fewer elements.",
                "scope": "instance",
                "expressible_as": "examples",
                "parameter": None,
                "relation": "new",
                "related_to": None,
                "evidence": "edit removed elements",
            })
    return found
