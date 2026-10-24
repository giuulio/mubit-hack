"""Experiments and training calls. Run as `python -m icons.run <command>`.

Commands:
  compare  Generate concepts under several context configurations (never kept) and write a review sheet.
  repeat   Send one identical call twice to check replay determinism (never kept).
  train    Generate training concepts under an approved context with full recording (may become kept examples).
"""

import argparse
import base64
import html
import json
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from . import mubit
from .prompt import MODEL, SYSTEM_PROMPT, seeds, user_message
from .slop import lucide_index, nearest
from .svg import extract_svg, render_png, validate

ROOT = Path(__file__).resolve().parent.parent
RUNS = ROOT / "runs"
STYLE = (ROOT / "style" / "target.md").read_text()

# Context configurations: (style guide, example icons).
CONFIGS = {
    "bare": (None, None),
    "style": (STYLE, None),
    "style+seeds": (STYLE, "seeds"),
}


def concepts(split):
    return json.loads((ROOT / "data" / "concepts.json").read_text())[split]


def build(concept, config):
    style, examples = CONFIGS[config]
    return user_message(concept, style=style, examples=seeds() if examples == "seeds" else None)


def generate(concept, config, record, session, model=MODEL):
    started = time.time()
    reply = mubit.call(SYSTEM_PROMPT, build(concept, config), model=model, record=record, session=session)
    svg = extract_svg(reply["text"])
    return {
        "concept": concept,
        "config": config,
        "model": model,
        "record": record,
        "session": session,
        "svg": svg,
        "problems": validate(svg) if svg else ["no SVG in reply"],
        "request_id": reply["request_id"],
        "input_tokens": reply["input_tokens"],
        "output_tokens": reply["output_tokens"],
        "seconds": round(time.time() - started, 2),
        "reply": None if svg else reply["text"],
    }


def slug(text):
    return "".join(c if c.isalnum() else "-" for c in text.lower()).strip("-")


def write_sheet(results, path, title):
    """A static HTML review sheet: one row per configuration, one tile per icon."""
    rows = {}
    for r in results:
        rows.setdefault(r["config"], []).append(r)
    parts = [
        f"<!doctype html><meta charset=utf-8><title>{html.escape(title)}</title>",
        "<style>body{font:13px system-ui;margin:24px;background:#fafafa}"
        ".row{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:28px}"
        ".tile{width:150px;background:#fff;border:1px solid #ddd;border-radius:8px;padding:8px}"
        ".tile img{width:96px;height:96px;display:block;margin:4px auto}"
        ".ok{color:#18794e}.bad{color:#c4320a}small{display:block;color:#666;word-break:break-word}</style>",
        f"<h1>{html.escape(title)}</h1>",
    ]
    for config, items in rows.items():
        passed = sum(not r["problems"] for r in items)
        slop = [r["slop"] for r in items if r.get("slop") is not None]
        mean = sum(slop) / len(slop) if slop else float("nan")
        parts.append(f"<h2>{config}: {passed}/{len(items)} pass validators, mean slop {mean:.2f}</h2><div class=row>")
        for r in items:
            img = ""
            if r["svg"]:
                try:
                    img = base64.b64encode(render_png(r["svg"], size=192)).decode()
                except Exception:  # unrenderable SVG: show the tile without an image
                    img = ""
            status = "<span class=ok>pass</span>" if not r["problems"] else "<span class=bad>" + html.escape("; ".join(r["problems"])) + "</span>"
            slop_text = f"slop {r['slop']:.2f} ({html.escape(r['nearest'])})" if r.get("slop") is not None else ""
            parts.append(
                f"<div class=tile><b>{html.escape(r['concept'])}</b>"
                + (f"<img src='data:image/png;base64,{img}'>" if img else "<p>no image</p>")
                + f"{status}<small>{slop_text}</small><small>{r['input_tokens']} in / {r['output_tokens']} out tokens</small></div>"
            )
        parts.append("</div>")
    path.write_text("\n".join(parts))


def score(results):
    index = lucide_index()
    for r in results:
        if r["svg"]:
            try:
                r["slop"], r["nearest"] = nearest(r["svg"], index)
            except Exception:
                r["slop"], r["nearest"] = None, ""


def batch(args, configs, record, session):
    """Generate every concept in the split under each configuration, then score and save the run."""
    out = RUNS / args.name
    out.mkdir(parents=True, exist_ok=True)
    items = concepts(args.split)[: args.limit]
    jobs = [(c, cfg) for cfg in configs for c in items]
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        results = list(pool.map(lambda job: generate(job[0], job[1], record, session(*job), args.model), jobs))
    score(results)
    with (out / "results.jsonl").open("w") as f:
        for r in results:
            f.write(json.dumps(r) + "\n")
            if r["svg"]:
                (out / r["config"]).mkdir(exist_ok=True)
                (out / r["config"] / f"{slug(r['concept'])}.svg").write_text(r["svg"])
    write_sheet(results, out / "index.html", f"{args.name}: {args.model}, {args.split}, record {record}")
    for cfg in configs:
        rs = [r for r in results if r["config"] == cfg]
        passed = sum(not r["problems"] for r in rs)
        slop = [r["slop"] for r in rs if r.get("slop") is not None]
        tokens = sum(r["input_tokens"] for r in rs) / len(rs)
        print(f"{cfg:12} pass {passed}/{len(rs)}  mean slop {sum(slop) / max(len(slop), 1):.2f}  mean input tokens {tokens:.0f}")
    print(f"sheet: {out / 'index.html'}")


def compare(args):
    batch(args, args.configs, "metadata", lambda concept, config: f"{args.name}-{config}-{slug(concept)}")


def train(args):
    """One session per concept, so Mubit's held-out test cases are whole concepts."""
    batch(args, [args.config], "full", lambda concept, config: f"train-{slug(concept)}")


def repeat(args):
    a = generate(args.concept, args.config, "metadata", f"repeat-{slug(args.concept)}")
    b = generate(args.concept, args.config, "metadata", f"repeat-{slug(args.concept)}")
    print("identical" if a["svg"] == b["svg"] else "different")
    if a["svg"] != b["svg"]:
        print(a["svg"], "\n---\n", b["svg"], sep="")


def main():
    parser = argparse.ArgumentParser(prog="python -m icons.run")
    sub = parser.add_subparsers(required=True)
    p = sub.add_parser("compare")
    p.add_argument("name")
    p.add_argument("--split", default="heldout", choices=["train", "heldout"])
    p.add_argument("--configs", nargs="+", default=list(CONFIGS), choices=list(CONFIGS))
    p.add_argument("--model", default=MODEL)
    p.add_argument("--limit", type=int, default=None)
    p.add_argument("--workers", type=int, default=4)
    p.set_defaults(func=compare)
    p = sub.add_parser("repeat")
    p.add_argument("concept")
    p.add_argument("--config", default="style+seeds", choices=list(CONFIGS))
    p.set_defaults(func=repeat)
    p = sub.add_parser("train")
    p.add_argument("name")
    p.add_argument("--split", default="train", choices=["train"])
    p.add_argument("--config", default="style+seeds", choices=list(CONFIGS))
    p.add_argument("--model", default=MODEL)
    p.add_argument("--limit", type=int, default=None)
    p.add_argument("--workers", type=int, default=4)
    p.set_defaults(func=train)
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
