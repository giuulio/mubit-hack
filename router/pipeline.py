"""The lesson router's stages for one project: generate, feedback, confirm and route, train, evaluate, absorb.

Recording rules (ARCHITECTURE.md): previews, probes, judges and evaluation are recorded as metadata
only; training calls under the approved context are recorded in full.
"""

import math
import random
import time
from concurrent.futures import ThreadPoolExecutor

from . import judge, mubit, store
from .extract import extract_llm
from .route import route

RUN_TOKENS = 8000  # Mubit bills per run of up to 8K tokens
PROBES = 3
WORKERS = 4


# Context -------------------------------------------------------------------------------------

def context(project, mode="routed", without=None, extra=None):
    """The context for a call. mode: bare (nothing), routed (what is in context now), full (every lesson ever applied)."""
    ctx = {"rules": [], "examples": [], "notes": {}, "params": {}}
    if mode == "bare":
        return ctx
    for lesson in project["lessons"]:
        if lesson["status"] != "active" or lesson["id"] == without:
            continue
        if lesson["route"] == "note":
            ctx["notes"].setdefault(lesson["concept"], []).append(lesson["statement"])
        elif lesson["expressible_as"] == "parameter" and lesson.get("parameter"):
            ctx["params"][lesson["parameter"]["name"]] = lesson["parameter"]["value"]
        elif lesson["expressible_as"] != "examples" and (mode == "full" or lesson["in_context"]):
            ctx["rules"].append(lesson["statement"])
    for example in project["examples"]:
        lesson_id = example.get("lesson_id")
        lesson = next((x for x in project["lessons"] if x["id"] == lesson_id), None)
        if lesson_id == without or (lesson and lesson["status"] != "active"):
            continue
        if mode == "full" or (lesson is None or lesson["in_context"]):
            ctx["examples"].append({"concept": example["concept"], "content": example["content"]})
    if extra:
        if extra.get("example"):
            ctx["examples"].append(extra["example"])
        elif extra.get("statement"):
            ctx["rules"].append(extra["statement"])
    return ctx


def message(project, concept, ctx):
    return store.domain_of(project).user_message(ctx, concept)


def context_tokens(project, ctx=None):
    d = store.domain_of(project)
    ctx = ctx if ctx is not None else context(project)
    return mubit.count_tokens(d.system_prompt(project["name"]), message(project, "example", ctx), project["model"])


def _track_context(project):
    tokens = context_tokens(project)
    in_context = sum(1 for x in project["lessons"] if x["status"] == "active" and x["in_context"])
    project["context_history"].append({"t": store.now(), "tokens": tokens, "lessons_in_context": in_context})
    return tokens


# Generation ----------------------------------------------------------------------------------

def generate_one(project, concept, ctx, record, session, model=None):
    d = store.domain_of(project)
    started = time.time()
    reply = mubit.call(d.system_prompt(project["name"]), message(project, concept, ctx), model=model or project["model"], record=record, session=session)
    raw = d.parse_output(reply["text"])
    content = d.postprocess(raw, ctx["params"]) if raw else None
    return {
        "id": store.new_id("out"),
        "concept": concept,
        "content": content,
        "problems": d.problems(content),
        "record": record,
        "request_id": reply["request_id"],
        "input_tokens": reply["input_tokens"],
        "output_tokens": reply["output_tokens"],
        "runs": math.ceil((reply["input_tokens"] + reply["output_tokens"]) / RUN_TOKENS),
        "seconds": round(time.time() - started, 2),
        "t": store.now(),
    }


def _many(project, concepts, ctx, record, session_prefix, model=None):
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        return list(pool.map(lambda c: generate_one(project, c, ctx, record, f"{session_prefix}-{c}", model), concepts))


def generate(pid, concepts):
    """Preview outputs under the current context. Never kept."""
    project = store.load(pid)
    outputs = _many(project, concepts, context(project), "metadata", f"{pid}-preview")

    def save(p):
        p["outputs"] = (p["outputs"] + outputs)[-300:]
        store.event(p, "generated", n=len(outputs))
    store.update(pid, save)
    return outputs


# Feedback and extraction ---------------------------------------------------------------------

def _output(project, oid):
    return next(o for o in project["outputs"] if o["id"] == oid)


def feedback(pid, payload):
    """payload: signal (direction|critique|pick|edit), text, output_id, chosen_id, rejected_id, after."""
    project = store.load(pid)
    d = store.domain_of(project)
    kind = payload["signal"]
    signal = {"signal": kind, "text": payload.get("text")}
    sources = []
    if kind == "critique":
        o = _output(project, payload["output_id"])
        signal["output"] = {"concept": o["concept"], "content": o["content"]}
        sources = [o["id"]]
    if kind == "pick":
        a, b = _output(project, payload["chosen_id"]), _output(project, payload["rejected_id"])
        signal["chosen"] = {"concept": a["concept"], "content": a["content"]}
        signal["rejected"] = {"concept": b["concept"], "content": b["content"]}
        sources = [a["id"]]
    if kind == "edit":
        o = _output(project, payload["output_id"])
        signal["before"] = {"concept": o["concept"], "content": o["content"]}
        signal["after"] = {"concept": o["concept"], "content": d.parse_output(payload["after"])}
        sources = [o["id"]]
    current = [
        {"id": x["id"], "statement": x["statement"], "expressible_as": x["expressible_as"], "parameter": x.get("parameter")}
        for x in project["lessons"] if x["status"] == "active"
    ]
    found, seconds = extract_llm(signal, current, d, project["model"], f"{pid}-extract")
    pending = []
    for lesson in found:
        lesson.update({
            "id": store.new_id("les"),
            "status": "pending",
            "signal": kind,
            "feedback": payload.get("text"),
            "sources": sources,
            "concept": signal.get("output", signal.get("chosen", signal.get("before", {}))).get("concept"),
            "route": None,
            "reason": None,
            "in_context": False,
            "signals": {},
            "created": store.now(),
        })
        if kind == "edit" and lesson["expressible_as"] == "examples":
            lesson["edited_content"] = signal["after"]["content"]
        pending.append(lesson)

    def save(p):
        p["lessons"] += pending
        store.event(p, "feedback", signal=kind, lessons=len(pending), seconds=round(seconds, 2))
    store.update(pid, save)
    return pending


# Confirmation and routing --------------------------------------------------------------------

def _effect_test(project, lesson):
    """Probe concepts generated with and without the lesson in context, judged pairwise."""
    d = store.domain_of(project)
    rng = random.Random(lesson["id"])
    probes = rng.sample(d.concepts("train"), PROBES)
    base = context(project)
    with_lesson = context(project, extra={"statement": lesson["statement"]})
    a = _many(project, probes, with_lesson, "metadata", f"{project['id']}-probe-with")
    b = _many(project, probes, base, "metadata", f"{project['id']}-probe-without")
    pairs = [(c, x["content"], y["content"]) for c, x, y in zip(probes, a, b) if x["content"] and y["content"]]
    if not pairs:
        return None, {}
    share, details = judge.effect(lesson["statement"], pairs, d.render, f"{project['id']}-effect")
    return share, {"probes": probes, "verdicts": details, "with": [x["content"] for x in a], "without": [y["content"] for y in b]}


def confirm(pid, lid, stability="permanent", statement=None):
    project = store.load(pid)
    lesson = next(x for x in project["lessons"] if x["id"] == lid)
    if statement:
        lesson["statement"] = statement
    related = next((x for x in project["lessons"] if x["id"] == lesson.get("related_to") and x["status"] == "active"), None)

    if lesson["relation"] == "duplicate" and related:
        def dup(p):
            x = next(y for y in p["lessons"] if y["id"] == lid)
            x.update(status="duplicate", reason=f"already covered by {related['id']}")
            store.event(p, "lesson_duplicate", lesson=lid, of=related["id"])
            return x
        return store.update(pid, dup)

    example = None
    if lesson["expressible_as"] == "examples" and lesson.get("sources"):
        source = _output(project, lesson["sources"][0])
        example = {"concept": source["concept"], "content": lesson.get("edited_content") or source["content"]}

    extra = {"example": example} if example else {"statement": lesson["statement"]}
    base_tokens = context_tokens(project)
    tokens = 0 if lesson["expressible_as"] == "parameter" else max(context_tokens(project, context(project, extra=extra)) - base_tokens, 0)
    signals = {"tokens": tokens, "stability": stability, "effect": None}
    probe = {}
    if lesson["scope"] != "instance" and lesson["expressible_as"] in ("rule", "validator") and stability == "permanent":
        signals["effect"], probe = _effect_test(project, lesson)
    chosen, reason = route(lesson, signals, project["calls_per_day"])

    def apply(p):
        x = next(y for y in p["lessons"] if y["id"] == lid)
        x.update(statement=lesson["statement"], route=chosen, reason=reason, signals=signals, probe=probe, confirmed=store.now())
        x["status"] = "active" if chosen != "rephrase" else "needs_rephrase"
        x["in_context"] = chosen in ("A∧B", "B", "note") or (chosen == "A" and x["expressible_as"] != "parameter")
        if example and chosen != "rephrase":
            p["examples"].append({"id": store.new_id("ex"), "lesson_id": lid, **example})
        if related and lesson["relation"] == "contradicts" and x["status"] == "active":
            r = next(y for y in p["lessons"] if y["id"] == related["id"])
            r.update(status="superseded", superseded_by=lid)
        store.event(p, "lesson_routed", lesson=lid, route=chosen, tokens=tokens, effect=signals["effect"])
        _track_context(p)
        return x
    routed = store.update(pid, apply)

    if chosen == "note" and lesson.get("concept"):
        generate(pid, [lesson["concept"]])
    return routed


def reject(pid, lid):
    def apply(p):
        x = next(y for y in p["lessons"] if y["id"] == lid)
        x["status"] = "rejected"
        store.event(p, "lesson_rejected", lesson=lid)
        return x
    return store.update(pid, apply)


# Training ------------------------------------------------------------------------------------

def train(pid, count=40):
    """Training calls under the approved context, recorded in full: these may become kept examples."""
    project = store.load(pid)
    d = store.domain_of(project)
    concepts = d.concepts("train")[:count]
    batch = len(project["training"]) + 1
    ctx = context(project)
    outputs = _many(project, concepts, ctx, "full", f"{pid}-train{batch}")
    summary = {
        "batch": batch,
        "t": store.now(),
        "calls": len(outputs),
        "valid": sum(not o["problems"] for o in outputs),
        "context_tokens": context_tokens(project, ctx),
        "lessons_in_context": [x["id"] for x in project["lessons"] if x["status"] == "active" and x["in_context"]],
        "outputs": [{"concept": o["concept"], "content": o["content"], "request_id": o["request_id"]} for o in outputs],
    }

    def save(p):
        p["training"].append(summary)
        store.event(p, "training_batch", batch=batch, calls=len(outputs))
    store.update(pid, save)
    return summary


def record_adapter(pid, version, status, note=""):
    def apply(p):
        entry = {"version": version, "status": status, "note": note, "t": store.now()}
        p["adapters"].append(entry)
        store.event(p, "adapter", **entry)
        return entry
    return store.update(pid, apply)


# Adapter outputs from Try models -------------------------------------------------------------

def try_message(pid, concept, mode="bare", without=None):
    """The exact message to paste into Try models (which adds the task's instructions itself)."""
    project = store.load(pid)
    return message(project, concept, context(project, mode=mode, without=without))


def import_outputs(pid, config, items):
    """items: [{concept, content}] pasted from Try models for the adapter; scored at the next evaluation."""
    project = store.load(pid)
    d = store.domain_of(project)
    cleaned = [{"concept": i["concept"], "content": d.parse_output(i["content"])} for i in items]

    def apply(p):
        p["imports"][config] = cleaned
        store.event(p, "imported", config=config, n=len(cleaned))
    store.update(pid, apply)
    return cleaned


def absorption(pid, lid, items):
    """Adapter outputs without the lesson in context; retire the lesson from context if it still holds."""
    project = store.load(pid)
    d = store.domain_of(project)
    lesson = next(x for x in project["lessons"] if x["id"] == lid)
    outputs = [(i["concept"], d.parse_output(i["content"])) for i in items]
    outputs = [(c, o) for c, o in outputs if o]
    share = judge.compliance(lesson["statement"], outputs, d.render, f"{pid}-absorb") if outputs else 0.0
    absorbed = share >= 2 / 3

    def apply(p):
        x = next(y for y in p["lessons"] if y["id"] == lid)
        x["absorption"] = {"share": share, "n": len(outputs), "t": store.now()}
        if absorbed and x["route"] == "B":
            x["in_context"] = False
            x["retired"] = store.now()
        store.event(p, "absorption", lesson=lid, share=share, retired=absorbed and x["route"] == "B")
        _track_context(p)
        return x
    return store.update(pid, apply)


# Evaluation ----------------------------------------------------------------------------------

def evaluate(pid, n=12, frontier="claude-opus-5-5"):
    """Held-out concepts under each configuration, judged blind against the project's examples and rules."""
    project = store.load(pid)
    d = store.domain_of(project)
    concepts = d.concepts("heldout")[:n]
    configs = {
        "frontier": (frontier, context(project, mode="bare")),
        "frontier + full context": (frontier, context(project, mode="full")),
        "provider + routed context": (project["model"], context(project)),
    }
    results = {name: _many(project, concepts, ctx, "metadata", f"{pid}-eval-{name}", model) for name, (model, ctx) in configs.items()}
    for name, items in project["imports"].items():
        by_concept = {i["concept"]: i["content"] for i in items}
        mode = "routed" if "context" in name else "bare"
        tokens = context_tokens(project, context(project, mode=mode))
        results[name] = [
            {"concept": c, "content": by_concept.get(c), "problems": d.problems(by_concept.get(c)), "input_tokens": tokens, "output_tokens": None, "runs": None, "seconds": None}
            for c in concepts if c in by_concept
        ]

    references = [e["content"] for e in project["examples"]]
    rules = context(project, mode="full")["rules"]

    def score(concept):
        candidates = {name: r["content"] for name, rs in results.items() for r in rs if r["concept"] == concept and r["content"]}
        return concept, judge.quality(concept, candidates, references, rules, d.render, f"{pid}-quality") if candidates else {}

    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        scores = dict(pool.map(score, concepts))

    rows = []
    for name, rs in results.items():
        judged = [scores[r["concept"]].get(name) for r in rs if scores.get(r["concept"], {}).get(name)]
        known = [r for r in rs if r["output_tokens"] is not None]
        rows.append({
            "config": name,
            "n": len(rs),
            "valid": sum(not r["problems"] for r in rs),
            "style": round(sum(j.get("style", 0) for j in judged) / len(judged), 2) if judged else None,
            "recognisable": round(sum(j.get("recognisable", 0) for j in judged) / len(judged), 2) if judged else None,
            "input_tokens": round(sum(r["input_tokens"] for r in rs) / len(rs)) if rs else None,
            "runs_per_call": round(sum(r["runs"] for r in known) / len(known), 2) if known else None,
            "seconds": round(sum(r["seconds"] for r in known) / len(known), 2) if known else None,
        })
    entry = {
        "id": store.new_id("eval"),
        "t": store.now(),
        "concepts": concepts,
        "rows": rows,
        "outputs": {name: [{"concept": r["concept"], "content": r["content"]} for r in rs] for name, rs in results.items()},
    }

    def save(p):
        p["evals"].append(entry)
        store.event(p, "evaluation", id=entry["id"])
    store.update(pid, save)
    return entry
