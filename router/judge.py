"""Vision judges routed through Mubit, recorded as metadata only. Each has a fixed prompt (its own Mubit task)."""

import random

from . import mubit
from .extract import parse_json

JUDGE_MODEL = "claude-sonnet-5-5"

EFFECT_PROMPT = """You compare pairs of generated outputs for the same concept and decide which one follows a given lesson better. Reply with JSON only: {"pairs": [{"pair": 1, "better": "X" | "Y" | "same"}]}."""

COMPLIANCE_PROMPT = """You check whether each generated output follows a given lesson. Reply with JSON only: {"outputs": [{"output": 1, "follows": true | false}]}."""

QUALITY_PROMPT = """You rate candidate icons for one concept. "style" (1-5) is how well a candidate matches the reference icons and style rules; "recognisable" (1-5) is how clearly it depicts the concept. Rate every candidate independently. Reply with JSON only: {"candidates": {"A": {"style": 1, "recognisable": 1}}}."""


def _ask(system, blocks, session):
    reply = mubit.call(system, blocks, model=JUDGE_MODEL, record="metadata", session=session, max_tokens=1500)
    return parse_json(reply["text"]) or {}


def effect(lesson, pairs, render, session):
    """pairs: [(concept, with_lesson, without_lesson)]. Returns (share where the lesson's output is better, details)."""
    blocks = [{"type": "text", "text": f"Lesson: {lesson}"}]
    order = []
    for i, (concept, with_, without) in enumerate(pairs, start=1):
        flip = random.random() < 0.5
        x, y = (without, with_) if flip else (with_, without)
        order.append("Y" if flip else "X")
        blocks.append({"type": "text", "text": f"Pair {i}, concept: {concept}. X:"})
        blocks.append(mubit.image_block(render(x)))
        blocks.append({"type": "text", "text": "Y:"})
        blocks.append(mubit.image_block(render(y)))
    verdicts = {int(p.get("pair", 0)): p.get("better") for p in _ask(EFFECT_PROMPT, blocks, session).get("pairs", [])}
    wins = sum(verdicts.get(i) == order[i - 1] for i in range(1, len(pairs) + 1))
    return wins / len(pairs), [{"pair": i, "lesson_side": order[i - 1], "verdict": verdicts.get(i)} for i in range(1, len(pairs) + 1)]


def compliance(lesson, outputs, render, session):
    """outputs: [(concept, content)]. Returns the share that follows the lesson."""
    blocks = [{"type": "text", "text": f"Lesson: {lesson}"}]
    for i, (concept, content) in enumerate(outputs, start=1):
        blocks.append({"type": "text", "text": f"Output {i}, concept: {concept}"})
        blocks.append(mubit.image_block(render(content)))
    found = {int(o.get("output", 0)): bool(o.get("follows")) for o in _ask(COMPLIANCE_PROMPT, blocks, session).get("outputs", [])}
    return sum(found.get(i, False) for i in range(1, len(outputs) + 1)) / len(outputs)


def quality(concept, candidates, references, rules, render, session):
    """candidates: {config: content}. Returns {config: {"style", "recognisable"}} with blind, shuffled labels."""
    configs = list(candidates)
    random.shuffle(configs)
    labels = {chr(65 + i): c for i, c in enumerate(configs)}
    blocks = [{"type": "text", "text": "Style rules:\n" + ("\n".join(f"- {r}" for r in rules) or "(none)")}]
    if references:
        blocks.append({"type": "text", "text": "Reference icons in the target style:"})
        blocks += [mubit.image_block(render(r)) for r in references[:6]]
    blocks.append({"type": "text", "text": f"Concept: {concept}. Candidates:"})
    for label, config in labels.items():
        blocks.append({"type": "text", "text": f"{label}:"})
        blocks.append(mubit.image_block(render(candidates[config])))
    scores = _ask(QUALITY_PROMPT, blocks, session).get("candidates", {})
    return {labels[k]: v for k, v in scores.items() if k in labels and isinstance(v, dict)}
