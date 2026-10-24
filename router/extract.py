"""Extraction stage: turn one feedback signal into lesson records (docs/stages/extraction.md).

A signal is a dict with "signal" (direction, critique, pick or edit), optional "text", and
outputs as {"concept", "content"} dicts under "output", "chosen"/"rejected" or "before"/"after".
A domain supplies a description, the parameters code can set, and deterministic rules.
"""

import json
import time

from . import mubit

SCOPES = ("style", "family", "instance")
EXPRESSIBLE = ("parameter", "validator", "rule", "examples")
RELATIONS = ("new", "duplicate", "refines", "contradicts")

# Fixed prompt: changing it starts a new Mubit task for the extractor.
SYSTEM_PROMPT = """You extract lessons from a user's feedback on a model's outputs. A lesson is one atomic instruction about how future outputs should differ.

The user message describes the domain, the parameters code can set, the current lessons, and one piece of feedback. Reply with JSON only: {"lessons": [...]}. Each lesson has:
- "statement": the lesson in one short sentence.
- "scope": "style" if it should apply to all outputs, "family" if to a group of similar concepts, "instance" if only to the output concerned.
- "expressible_as": "parameter" if code can apply it to any output using one of the listed parameters; "validator" if code could check it but the model must draw it; "rule" if it can be stated in words but not reliably checked; "examples" if it can only be shown through example outputs.
- "parameter": {"name": ..., "value": ...} using a listed parameter name when expressible_as is "parameter", otherwise null.
- "relation": "new", "duplicate", "refines" or "contradicts", compared with the current lessons.
- "related_to": the id of the related current lesson, or null when the relation is "new".
- "evidence": the words or output the lesson comes from.

Approval is feedback too: when the user praises an output or picks it over another, add a lesson with expressible_as "examples" saying that output is a good example, plus any lesson the difference between the outputs makes clear.

Split compound feedback into separate lessons. Return an empty list when the feedback is too vague to act on or gives no reason to change anything."""


def describe_lessons(lessons):
    lines = []
    for lesson in lessons:
        p = lesson.get("parameter")
        tag = f" [{p['name']}={p['value']}]" if p else ""
        lines.append(f"- {lesson['id']} ({lesson['expressible_as']}{tag}): {lesson['statement']}")
    return "\n".join(lines) or "(none)"


def describe_signal(signal):
    def output(label, o):
        return f"{label} (concept: {o['concept']}):\n{o['content']}"

    kind = signal["signal"]
    parts = [f"Type: {kind}"]
    if signal.get("text"):
        parts.append(f"Text: {signal['text']}")
    if kind == "critique" and signal.get("output"):
        parts.append(output("Output concerned", signal["output"]))
    if kind == "pick":
        parts.append("The user chose output A over output B.")
        parts.append(output("A, chosen", signal["chosen"]))
        parts.append(output("B, rejected", signal["rejected"]))
    if kind == "edit":
        parts.append("The user edited an output.")
        parts.append(output("Before", signal["before"]))
        parts.append(output("After", signal["after"]))
    return "\n\n".join(parts)


def parse_json(text):
    """The outermost JSON object in a reply, or None."""
    start, end = text.find("{"), text.rfind("}")
    if start < 0 or end <= start:
        return None
    try:
        return json.loads(text[start:end + 1])
    except json.JSONDecodeError:
        return None


def clean(lesson, lesson_ids):
    """Coerce one lesson to the schema; unknown values become None so scoring counts them wrong."""
    p = lesson.get("parameter")
    return {
        "statement": str(lesson.get("statement", "")).strip(),
        "scope": lesson.get("scope") if lesson.get("scope") in SCOPES else None,
        "expressible_as": lesson.get("expressible_as") if lesson.get("expressible_as") in EXPRESSIBLE else None,
        "parameter": {"name": str(p.get("name")), "value": str(p.get("value"))} if isinstance(p, dict) and p.get("name") else None,
        "relation": lesson.get("relation") if lesson.get("relation") in RELATIONS else None,
        "related_to": lesson.get("related_to") if lesson.get("related_to") in lesson_ids else None,
        "evidence": lesson.get("evidence"),
    }


def extract_llm(signal, lessons, domain, model, session):
    user = "\n\n".join([
        f"## Domain\n\n{domain.description}",
        "## Parameters code can set\n\n" + "\n".join(f"- {k}: {v}" for k, v in domain.parameters.items()),
        f"## Current lessons\n\n{describe_lessons(lessons)}",
        f"## Feedback\n\n{describe_signal(signal)}",
    ])
    started = time.time()
    reply = mubit.call(SYSTEM_PROMPT, user, model=model, record="metadata", session=session)
    data = parse_json(reply["text"]) or {}
    ids = {lesson["id"] for lesson in lessons}
    found = [clean(x, ids) for x in data.get("lessons", []) if isinstance(x, dict)]
    return found, time.time() - started


def extract_rules(signal, lessons, domain):
    started = time.time()
    found = domain.rules(signal, lessons)
    return found, time.time() - started


def extract_hybrid(signal, lessons, domain, llm_found, llm_seconds):
    """Rules own parameter lessons; the LLM supplies everything else."""
    rule_found, rule_seconds = extract_rules(signal, lessons, domain)
    rule_params = [x for x in rule_found if x["parameter"]]
    names = {x["parameter"]["name"] for x in rule_params}
    rest = [x for x in llm_found if not (x["parameter"] and x["parameter"]["name"] in names)]
    return rule_params + rest, rule_seconds + llm_seconds


def relation_to(lessons, name, value):
    """Relation of a parameter lesson to the current lessons: (relation, related id)."""
    for lesson in lessons:
        p = lesson.get("parameter")
        if p and p["name"] == name:
            return ("duplicate" if p["value"] == value else "contradicts"), lesson["id"]
    return "new", None


def parameter_lesson(statement, name, value, scope, lessons, evidence):
    relation, related = relation_to(lessons, name, value)
    return {
        "statement": statement,
        "scope": scope,
        "expressible_as": "parameter",
        "parameter": {"name": name, "value": value},
        "relation": relation,
        "related_to": related,
        "evidence": evidence,
    }
