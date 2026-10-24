"""The lesson router's stages for one model: generate, feedback, confirm and route, train, evaluate, absorb.

A model has one fixed system prompt (one Mubit task) and several contexts; each stage runs in one context, whose rules
and examples go in the user message. Kept calls and adapter versions belong to the model, so every context shares them.
`cid` names the context; None means the model's first context.

Recording rules (ARCHITECTURE.md): previews, probes, judges and evaluation are recorded as metadata
only; training calls under the approved context are recorded in full.
"""

import math
import random
import time
from concurrent.futures import ThreadPoolExecutor

from . import judge, mubit, serve, store
from .extract import extract_llm
from .route import route

RUN_TOKENS = 8000  # Mubit bills per run of up to 8K tokens
# Pixel icons drawn cell by cell ran past 2,000 output tokens and came back cut off; prompt and reply still fit one run.
OUTPUT_TOKENS = 6000
PROBES = 3
WORKERS = 4
FRONTIER = "claude-opus-5-5"


def _cid(project, cid):
    return store.context_of(project, cid)["id"]


def _lesson(project, lid):
    return next(x for x in project["lessons"] if x["id"] == lid)


# Context -------------------------------------------------------------------------------------

def context(project, cid=None, mode="routed", without=None, extra=None):
    """The context for a call in one context of the model: its own lessons plus the model-wide ones.

    mode: bare (nothing), routed (what is in context now), full (every lesson ever applied)."""
    cid = _cid(project, cid)
    ctx = {"rules": [], "examples": [], "notes": {}, "params": {}}
    if mode == "bare":
        return ctx
    for lesson in project["lessons"]:
        if lesson["status"] != "active" or lesson["id"] == without or not store.applies(lesson, cid):
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
        if not (store.applies(lesson, cid) if lesson else example.get("context") == cid):
            continue
        if mode == "full" or (lesson is None or lesson["in_context"]):
            # A note's example (an approved or redrawn icon) is shown only when that same concept is generated.
            only = bool(lesson and lesson["route"] == "note")
            ctx["examples"].append({"concept": example["concept"], "content": example["content"], "only": only})
    if extra:
        if extra.get("example"):
            ctx["examples"].append(extra["example"])
        elif extra.get("statement"):
            ctx["rules"].append(extra["statement"])
    return ctx


def message(project, concept, ctx):
    return store.domain_of(project).user_message(ctx, concept)


def context_tokens(project, cid=None, ctx=None):
    d = store.domain_of(project)
    ctx = ctx if ctx is not None else context(project, cid)
    return mubit.count_tokens(d.system_prompt(project["name"]), message(project, "example", ctx), project["model"])


def _track_context(project, cids=None):
    """Record tokens per call for the given contexts (all of them by default), after the context changed."""
    for cid in cids or [c["id"] for c in project["contexts"]]:
        in_context = sum(1 for x in project["lessons"] if x["status"] == "active" and x["in_context"] and store.applies(x, cid))
        project["context_history"].append({"t": store.now(), "tokens": context_tokens(project, cid), "lessons_in_context": in_context, "context": cid})


def _reached(project, lesson):
    """The contexts a lesson's change touches: every context for a model-wide lesson, otherwise its own."""
    return None if lesson.get("reach") == "model" else [lesson["context"]]


# Generation ----------------------------------------------------------------------------------

def generate_one(project, concept, ctx, record, session, model=None):
    d = store.domain_of(project)
    started = time.time()
    reply = mubit.call(d.system_prompt(project["name"]), message(project, concept, ctx), model=model or project["model"], record=record, session=session, max_tokens=OUTPUT_TOKENS)
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


def generate(pid, concepts, cid=None):
    """Preview outputs under one context's current context. Never kept."""
    project = store.load(pid)
    cid = _cid(project, cid)
    outputs = [{**o, "context": cid} for o in _many(project, concepts, context(project, cid), "metadata", f"{pid}-{cid}-preview")]

    def save(p):
        p["outputs"] = (p["outputs"] + outputs)[-300:]
        store.event(p, "generated", n=len(outputs), context=cid)
    store.update(pid, save)
    return outputs


# Feedback and extraction ---------------------------------------------------------------------

def _output(project, oid):
    return next(o for o in project["outputs"] if o["id"] == oid)


def feedback(pid, payload, cid=None):
    """payload: signal (direction|critique|pick|edit), text, output_id, chosen_id, rejected_id, after.

    Feedback on an output belongs to the context that output was drawn in."""
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
    cid = _cid(project, _output(project, sources[0])["context"] if sources else cid)
    current = [
        {"id": x["id"], "statement": x["statement"], "expressible_as": x["expressible_as"], "parameter": x.get("parameter")}
        for x in project["lessons"] if x["status"] == "active" and store.applies(x, cid)
    ]
    found, seconds = extract_llm(signal, current, d, project["model"], f"{pid}-extract", project["contexts"], cid)
    pending = []
    for lesson in found:
        lesson.update({
            "id": store.new_id("les"),
            "status": "pending",
            "context": cid,
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
        # An example icon shows one context's look, and a note concerns one output: neither can hold model-wide.
        if lesson["scope"] == "instance" or lesson["expressible_as"] == "examples":
            lesson["reach"] = "context"
        if kind == "edit" and lesson["expressible_as"] == "examples":
            lesson["edited_content"] = signal["after"]["content"]
        pending.append(lesson)

    def save(p):
        p["lessons"] += pending
        store.event(p, "feedback", signal=kind, lessons=len(pending), seconds=round(seconds, 2), context=cid)
    store.update(pid, save)
    return pending


# Confirmation and routing --------------------------------------------------------------------

def _effect_test(project, lesson):
    """Probe concepts generated with and without the lesson in its context, judged pairwise.

    The concept the lesson came from is always a probe: a family lesson (star tips, bars) can only show its effect where it applies.
    """
    d = store.domain_of(project)
    cid = lesson["context"]
    rng = random.Random(lesson["id"])
    source = [lesson["concept"]] if lesson.get("concept") else []
    probes = source + rng.sample([c for c in d.concepts("train") if c not in source], PROBES - len(source))
    base = context(project, cid)
    with_lesson = context(project, cid, extra={"statement": lesson["statement"]})
    a = _many(project, probes, with_lesson, "metadata", f"{project['id']}-{cid}-probe-with")
    b = _many(project, probes, base, "metadata", f"{project['id']}-{cid}-probe-without")
    pairs = [(c, x["content"], y["content"]) for c, x, y in zip(probes, a, b) if x["content"] and y["content"]]
    if not pairs:
        return None, {}
    share, details = judge.effect(lesson["statement"], pairs, d.render, f"{project['id']}-effect")
    return share, {"probes": probes, "verdicts": details, "with": [x["content"] for x in a], "without": [y["content"] for y in b]}


def confirm(pid, lid, stability="permanent", statement=None, reach=None):
    """Measure a pending lesson in its context, route it and apply it. `reach` overrides the extractor's: context or model."""
    project = store.load(pid)
    lesson = _lesson(project, lid)
    if statement:
        lesson["statement"] = statement
    if reach in ("context", "model"):
        lesson["reach"] = reach
    lesson.setdefault("reach", "context")
    cid = lesson["context"]
    related = next((x for x in project["lessons"] if x["id"] == lesson.get("related_to") and x["status"] == "active"), None)

    if lesson["relation"] == "duplicate" and related:
        def dup(p):
            x = _lesson(p, lid)
            x.update(status="duplicate", reason=f"already covered by {related['id']}")
            store.event(p, "lesson_duplicate", lesson=lid, of=related["id"])
            return x
        return store.update(pid, dup)

    example = None
    if lesson["expressible_as"] == "examples" and lesson.get("sources"):
        source = _output(project, lesson["sources"][0])
        example = {"concept": source["concept"], "content": lesson.get("edited_content") or source["content"]}

    extra = {"example": example} if example else {"statement": lesson["statement"]}
    base_tokens = context_tokens(project, cid)
    tokens = 0 if lesson["expressible_as"] == "parameter" else max(context_tokens(project, cid, context(project, cid, extra=extra)) - base_tokens, 0)
    signals = {"tokens": tokens, "stability": stability, "effect": None}
    probe = {}
    if lesson["scope"] != "instance" and lesson["expressible_as"] in ("rule", "validator") and stability == "permanent":
        signals["effect"], probe = _effect_test(project, lesson)
    chosen, reason = route(lesson, signals, project["calls_per_day"], store.context_of(project, cid)["name"])

    def apply(p):
        x = _lesson(p, lid)
        x.update(statement=lesson["statement"], reach=lesson["reach"], route=chosen, reason=reason, signals=signals, probe=probe, confirmed=store.now())
        x["status"] = "active" if chosen != "rephrase" else "needs_rephrase"
        x["in_context"] = chosen in ("A∧B", "B", "note") or (chosen == "A" and x["expressible_as"] != "parameter")
        if example and chosen != "rephrase":
            p["examples"].append({"id": store.new_id("ex"), "lesson_id": lid, "context": cid, **example})
        if related and lesson["relation"] == "contradicts" and x["status"] == "active":
            r = _lesson(p, related["id"])
            r.update(status="superseded", superseded_by=lid)
        store.event(p, "lesson_routed", lesson=lid, route=chosen, tokens=tokens, effect=signals["effect"], context=cid, reach=lesson["reach"])
        _track_context(p, _reached(p, x))
        return x
    routed = store.update(pid, apply)

    if chosen == "note" and lesson.get("concept"):
        generate(pid, [lesson["concept"]], cid)
    return routed


def set_reach(pid, reaches):
    """Give lessons a reach and re-route them from their stored signals, with no new probes.

    For lessons routed before contexts existed: `reaches` is {lesson id: "context" | "model"}. Notes and lessons that
    asked to be rephrased keep their route; every change is logged as a lesson_rerouted event."""
    def apply(p):
        changed = []
        for x in p["lessons"]:
            if x["id"] not in reaches:
                continue
            x["reach"] = reaches[x["id"]]
            if x["status"] != "active" or x["route"] in (None, "note", "rephrase"):
                continue
            signals = {"tokens": 0, "stability": "permanent", "effect": None, **(x.get("signals") or {})}
            new, why = route(x, signals, p["calls_per_day"], store.context_of(p, x["context"])["name"])
            if new != x["route"]:
                store.event(p, "lesson_rerouted", lesson=x["id"], old=x["route"], route=new, context=x["context"], reach=x["reach"])
                changed.append({"id": x["id"], "old": x["route"], "route": new})
                x.update(route=new, reason=why)
        return changed
    return store.update(pid, apply)


def reject(pid, lid):
    def apply(p):
        x = _lesson(p, lid)
        x["status"] = "rejected"
        store.event(p, "lesson_rejected", lesson=lid)
        return x
    return store.update(pid, apply)


# Training ------------------------------------------------------------------------------------

def train(pid, count=40, cid=None):
    """Training calls under one context's approved context, recorded in full: these may become kept examples.

    Every context of the model sends the same system prompt, so its kept calls train the one shared adapter."""
    project = store.load(pid)
    d = store.domain_of(project)
    cid = _cid(project, cid)
    concepts = d.concepts("train")[:count]
    batch = len(project["training"]) + 1
    ctx = context(project, cid)
    outputs = _many(project, concepts, ctx, "full", f"{pid}-{cid}-train{batch}")
    summary = {
        "batch": batch,
        "t": store.now(),
        "context": cid,
        "calls": len(outputs),
        "valid": sum(not o["problems"] for o in outputs),
        "context_tokens": context_tokens(project, cid, ctx),
        "lessons_in_context": [x["id"] for x in project["lessons"] if x["status"] == "active" and x["in_context"] and store.applies(x, cid)],
        "outputs": [{"concept": o["concept"], "content": o["content"], "request_id": o["request_id"]} for o in outputs],
    }

    def save(p):
        p["training"].append(summary)
        store.event(p, "training_batch", batch=batch, calls=len(outputs), context=cid)
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

def try_message(pid, concept, mode="bare", without=None, cid=None):
    """The exact message to paste into Try models (which adds the task's instructions itself)."""
    project = store.load(pid)
    return message(project, concept, context(project, cid, mode=mode, without=without))


def import_outputs(pid, config, items, cid=None):
    """items: [{concept, content}] pasted from Try models for the adapter in one context; scored at its next evaluation."""
    project = store.load(pid)
    d = store.domain_of(project)
    cid = _cid(project, cid)
    cleaned = [{"concept": i["concept"], "content": d.parse_output(i["content"])} for i in items]

    def apply(p):
        p["imports"].setdefault(cid, {})[config] = cleaned
        store.event(p, "imported", config=config, n=len(cleaned), context=cid)
    store.update(pid, apply)
    return cleaned


def absorption(pid, lid, items):
    """Adapter outputs without the lesson in context; retire the lesson from context if it still holds."""
    project = store.load(pid)
    d = store.domain_of(project)
    lesson = _lesson(project, lid)
    outputs = [(i["concept"], d.parse_output(i["content"])) for i in items]
    outputs = [(c, o) for c, o in outputs if o]
    share = judge.compliance(lesson["statement"], outputs, d.render, f"{pid}-absorb") if outputs else 0.0
    absorbed = share >= 2 / 3

    def apply(p):
        x = _lesson(p, lid)
        x["absorption"] = {"share": share, "n": len(outputs), "t": store.now()}
        if absorbed and x["route"] == "B":
            x["in_context"] = False
            x["retired"] = store.now()
        store.event(p, "absorption", lesson=lid, share=share, retired=absorbed and x["route"] == "B")
        _track_context(p, _reached(p, x))
        return x
    return store.update(pid, apply)


# Evaluation ----------------------------------------------------------------------------------

def configurations(project, cid=None, frontier=FRONTIER):
    """The configurations run live in one context, as {name: (model, context)}. Adapter rows come from Try models instead."""
    return {
        "provider": (project["model"], context(project, cid, mode="bare")),
        "frontier": (frontier, context(project, cid, mode="bare")),
        "frontier + full context": (frontier, context(project, cid, mode="full")),
        "provider + routed context": (project["model"], context(project, cid)),
    }


def evaluate(pid, n=12, frontier=FRONTIER, cid=None):
    """Held-out concepts under each configuration of one context, judged blind against that context's examples and rules."""
    project = store.load(pid)
    d = store.domain_of(project)
    cid = _cid(project, cid)
    concepts = d.concepts("heldout")[:n]
    configs = configurations(project, cid, frontier)
    results = {name: _many(project, concepts, ctx, "metadata", f"{pid}-{cid}-eval-{name}", model) for name, (model, ctx) in configs.items()}
    for name, items in project["imports"].get(cid, {}).items():
        by_concept = {i["concept"]: i["content"] for i in items}
        mode = "routed" if "context" in name else "bare"
        tokens = context_tokens(project, cid, context(project, cid, mode=mode))
        results[name] = [
            {"concept": c, "content": by_concept.get(c), "problems": d.problems(by_concept.get(c)), "input_tokens": tokens, "output_tokens": None, "runs": None, "seconds": None}
            for c in concepts if c in by_concept
        ]

    references = [e["content"] for e in context(project, cid, mode="full")["examples"]]
    rules = context(project, cid, mode="full")["rules"]

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
            "model": configs[name][0] if name in configs else "adapter",
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
        "context": cid,
        "concepts": concepts,
        "rows": rows,
        "serving": serve.choose(rows),
        "outputs": {name: [{"concept": r["concept"], "content": r["content"]} for r in rs] for name, rs in results.items()},
    }

    def save(p):
        p["evals"].append(entry)
        store.event(p, "evaluation", id=entry["id"], context=cid)
    store.update(pid, save)
    return entry


# Comparison ----------------------------------------------------------------------------------

def compare(pid, concept, frontier=FRONTIER, cid=None):
    """One concept under each live configuration of one context, side by side. Recorded as metadata only: nothing here is kept."""
    project = store.load(pid)
    cid = _cid(project, cid)
    configs = configurations(project, cid, frontier)
    with ThreadPoolExecutor(max_workers=len(configs)) as pool:
        futures = {name: pool.submit(generate_one, project, concept, ctx, "metadata", f"{pid}-{cid}-compare-{name}", model) for name, (model, ctx) in configs.items()}
        outputs = {name: {**future.result(), "model": configs[name][0]} for name, future in futures.items()}
    entry = {"id": store.new_id("cmp"), "t": store.now(), "context": cid, "concept": concept, "outputs": outputs}

    def save(p):
        p["comparisons"] = (p.get("comparisons", []) + [entry])[-20:]
        store.event(p, "compared", concept=concept, context=cid)
    store.update(pid, save)
    return entry


def compare_styles(pid, concept, frontier=FRONTIER):
    """One concept in every context of the model, under each live configuration, side by side; nothing here is kept.

    The raw frontier uses no context, so it is drawn once and shared by every context's row. Each context's row is stored
    as an ordinary comparison, tied to the others by a group id, so the adapter's answer can be pasted into any of them."""
    project = store.load(pid)
    cids = [c["id"] for c in store.live(project)]
    group = store.new_id("grp")
    jobs = {("*", name): (model, context(project, cids[0], mode="bare"))
            for name, model in (("frontier", frontier), ("provider", project["model"]))}
    for cid in cids:
        for name, (model, ctx) in configurations(project, cid, frontier).items():
            if name not in ("frontier", "provider"):
                jobs[(cid, name)] = (model, ctx)
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futures = {key: pool.submit(generate_one, project, concept, ctx, "metadata", f"{pid}-{key[0]}-styles-{key[1]}", model) for key, (model, ctx) in jobs.items()}
        done = {key: {**future.result(), "model": jobs[key][0]} for key, future in futures.items()}
    t = store.now()
    entries = [{
        "id": store.new_id("cmp"), "t": t, "context": cid, "group": group, "concept": concept,
        "outputs": {**{name: out for (c, name), out in done.items() if c == "*"}, **{name: out for (c, name), out in done.items() if c == cid}},
    } for cid in cids]

    def save(p):
        p["comparisons"] = (p.get("comparisons", []) + entries)[-60:]
        store.event(p, "compared", concept=concept, group=group)
    store.update(pid, save)
    return entries


def compare_adapter(pid, comparison_id, config, content):
    """The adapter's answer for a comparison, pasted from Try models; the harness applies parameters as for any output."""
    project = store.load(pid)
    d = store.domain_of(project)
    cid = next(c for c in project.get("comparisons", []) if c["id"] == comparison_id)["context"]
    ctx = context(project, cid, mode="routed" if "context" in config else "bare")
    raw = d.parse_output(content)
    svg = d.postprocess(raw, ctx["params"]) if raw else None
    output = {"content": svg, "problems": d.problems(svg), "model": "adapter", "input_tokens": context_tokens(project, cid, ctx), "output_tokens": None, "seconds": None}

    def apply(p):
        entry = next(c for c in p.get("comparisons", []) if c["id"] == comparison_id)
        entry["outputs"][config] = {"concept": entry["concept"], **output}
        store.event(p, "compared_adapter", comparison=comparison_id, config=config)
        return entry
    return store.update(pid, apply)
