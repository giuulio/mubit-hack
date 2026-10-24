"""Extract, validate and render SVG icons against the target style (style/target.md)."""

import io
import re
import xml.etree.ElementTree as ET

import numpy as np
import resvg_py
from PIL import Image

NS = "{http://www.w3.org/2000/svg}"
ROOT_ATTRS = {
    "viewBox": "0 0 24 24",
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "1.5",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
}
STROKE_ATTRS = ("stroke", "stroke-width", "stroke-linecap", "stroke-linejoin")
ALLOWED_TAGS = {"path", "line", "polyline", "polygon", "circle", "rect", "g"}
SAFE_MIN, SAFE_MAX = 3.0, 21.0
MAX_STROKED = 5
NUMBER = re.compile(r"-?\d*\.\d+|-?\d+")


def extract_svg(text):
    """Return the first <svg>…</svg> block in a model reply, or None."""
    match = re.search(r"<svg\b.*?</svg>", text, re.DOTALL)
    return match.group(0) if match else None


def _tag(el):
    return el.tag.removeprefix(NS)


def validate(svg):
    """Return a list of rule violations; an empty list means the icon passes."""
    try:
        root = ET.fromstring(svg)
    except ET.ParseError as e:
        return [f"invalid XML: {e}"]
    if _tag(root) != "svg":
        return ["root is not <svg>"]

    problems = []
    for name, value in ROOT_ATTRS.items():
        if root.get(name) != value:
            problems.append(f"root {name} is {root.get(name)!r}, expected {value!r}")

    accents, stroked = [], 0
    for el in root.iter():
        if el is root:
            continue
        tag = _tag(el)
        if tag not in ALLOWED_TAGS:
            problems.append(f"disallowed element <{tag}>")
            continue
        if tag == "g":
            continue
        if el.get("class") == "accent":
            accents.append(el)
            continue
        stroked += 1
        for name in STROKE_ATTRS:
            if el.get(name) is not None:
                problems.append(f"<{tag}> overrides {name}")
        if el.get("fill") not in (None, "none"):
            problems.append(f"<{tag}> is filled")
        if tag == "path" and re.search(r"[CcSsQqTt]", el.get("d", "")):
            problems.append("path uses Bézier curves")
        for name, value in el.attrib.items():
            if name in ("d", "points", "x", "y", "x1", "y1", "x2", "y2", "cx", "cy", "r", "width", "height", "rx", "ry"):
                if any(len(n.split(".")[1]) > 2 for n in NUMBER.findall(value) if "." in n):
                    problems.append(f"<{tag}> {name} has more than two decimals")
                    break

    if stroked > MAX_STROKED:
        problems.append(f"{stroked} stroked elements, maximum {MAX_STROKED}")
    if len(accents) != 1:
        problems.append(f"{len(accents)} accents, expected exactly 1")
    else:
        a = accents[0]
        if _tag(a) != "circle" or a.get("r") != "1.5" or a.get("fill") != "currentColor" or a.get("stroke") != "none":
            problems.append('accent must be <circle r="1.5" fill="currentColor" stroke="none">')

    if not problems or all("decimals" in p for p in problems):
        bbox = ink_bbox(svg)
        if bbox is None:
            problems.append("renders empty")
        else:
            # Strokes extend 0.75 beyond geometry; allow that plus half a pixel of anti-aliasing.
            lo, hi = SAFE_MIN - 0.75 - 0.25, SAFE_MAX + 0.75 + 0.25
            if min(bbox) < lo or max(bbox) > hi:
                problems.append(f"ink outside safe zone: {tuple(round(v, 1) for v in bbox)}")
    return problems


def render(svg, size=96, color="#000000", accent=None):
    """Render to a greyscale ink array in [0, 1] (1 = ink), size × size."""
    if accent:
        svg = svg.replace('class="accent"', f'class="accent" style="fill:{accent}"', 1)
    svg = svg.replace("currentColor", color)
    png = resvg_py.svg_to_bytes(svg_string=svg, width=size, height=size)
    image = Image.open(io.BytesIO(bytes(png))).convert("RGBA")
    return np.asarray(image, dtype=np.float32)[:, :, 3] / 255.0


def render_png(svg, size=96, color="#111111", accent="#ff5a36"):
    """Render to PNG bytes on a white background, accent coloured, for review sheets."""
    if accent:
        svg = svg.replace('class="accent"', f'class="accent" style="fill:{accent}"', 1)
    svg = svg.replace("currentColor", color)
    return bytes(resvg_py.svg_to_bytes(svg_string=svg, width=size, height=size, background="#ffffff"))


def ink_bbox(svg, size=240):
    """Bounding box of rendered ink in 24-unit coordinates: (x0, y0, x1, y1), or None."""
    ink = render(svg, size=size)
    ys, xs = np.nonzero(ink > 0.5)
    if len(xs) == 0:
        return None
    scale = 24 / size
    return (float(xs.min() * scale), float(ys.min() * scale), float((xs.max() + 1) * scale), float((ys.max() + 1) * scale))
