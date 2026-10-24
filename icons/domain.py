"""The icon domain for the lesson router: prompts, context assembly, parameters, checks and rules."""

import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

from router.extract import parameter_lesson

from .prompt import SYSTEM_PROMPT, user_message as build_message
from .svg import basic_problems, extract_svg, render_png, sanitize

ROOT = Path(__file__).resolve().parent.parent
name = "icons"
output_kind = "svg"

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


def concepts(split):
    return json.loads((ROOT / "data" / "concepts.json").read_text())[split]


def system_prompt(project_name):
    """One fixed system prompt per project, so each project is its own Mubit task."""
    return f"{SYSTEM_PROMPT} Project: {project_name}."


def user_message(context, concept):
    """context: {"rules": [str], "examples": [{"concept", "content", "only"}], "notes": {concept: [str]}}."""
    lines = [f"- {r}" for r in context.get("rules", [])]
    lines += [f"- For this concept: {n}" for n in context.get("notes", {}).get(concept, [])]
    style = "\n".join(lines) or None
    examples = {e["concept"]: e["content"] for e in context.get("examples", []) if not e.get("only") or e["concept"] == concept} or None
    return build_message(concept, style=style, examples=examples)


def parse_output(text):
    svg = extract_svg(text)
    return sanitize(svg) if svg else None


def postprocess(svg, params):
    """Apply parameter lessons in code: root attributes, accent removal and accent colour."""
    if not svg:
        return svg
    root = ET.fromstring(svg)
    for key in ("stroke-width", "stroke-linecap", "stroke-linejoin", "fill"):
        if key in params:
            root.set(key, params[key])
    accents = [el for el in root.iter() if el.get("class") == "accent"]
    if params.get("accent") == "none":
        for parent in root.iter():
            for child in list(parent):
                if child in accents:
                    parent.remove(child)
    elif params.get("accent-color"):
        for el in accents:
            el.set("fill", params["accent-color"])
    ET.register_namespace("", "http://www.w3.org/2000/svg")
    return ET.tostring(root, encoding="unicode")


def problems(svg):
    return basic_problems(svg) if svg else ["no SVG in reply"]


def render(svg, size=160):
    return render_png(svg, size=size, accent=None)


# Deterministic extraction rules, kept for the extraction comparison (docs/stages/extraction.md).
THIN = re.compile(r"\b(thin|thinner|lighter|finer|hairline|delicate)\b")
THICK = re.compile(r"\b(thick|thicker|bold|bolder|heavier|heavy|chunky)\b")
ROUND = re.compile(r"\b(round|rounded|rounder)\b")
SQUARE = re.compile(r"\b(square|squared|sharp|angular)\b")
DOT = re.compile(r"\b(dot|dots|accent)\b")
NEGATIVE = re.compile(r"\b(rid|remove|drop|no|without|lose|distracting|kill)\b")
HEX = re.compile(r"#[0-9a-f]{6}\b")


def _current(lessons, key, default):
    for lesson in lessons:
        p = lesson.get("parameter")
        if p and p["name"] == key:
            return p["value"]
    return default


def _count(svg):
    return sum(1 for _ in ET.fromstring(svg).iter()) - 1


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
        rb, ra = ET.fromstring(before), ET.fromstring(after)
        for key in ("stroke-width", "stroke-linecap", "stroke-linejoin", "fill"):
            if rb.get(key) != ra.get(key) and ra.get(key) is not None:
                value = ra.get(key)
                found.append(parameter_lesson(f"Root {key} is {value}.", key, value, "style", lessons, "edit"))
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
