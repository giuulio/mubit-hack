"""Compare extraction variants against hand-labelled feedback. Run as `python -m router.eval_extraction <name>`.

Variants: rules, llm (one per model) and hybrid (rules for parameters, the first LLM model for the rest).
An LLM judge routed through Mubit pairs predicted and expected lessons by meaning; code scores the fields.
"""

import argparse
import json
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from . import mubit
from .extract import describe_lessons, extract_hybrid, extract_llm, extract_rules, parse_json

ROOT = Path(__file__).resolve().parent.parent

# Fixed prompt: changing it starts a new Mubit task for the judge.
JUDGE_PROMPT = """You match predicted lessons to expected lessons for one piece of feedback. A predicted and an expected lesson match when they ask for the same change to future outputs, even if worded differently or more specifically. Each lesson matches at most one other. Reply with JSON only: {"matches": [{"predicted": "P1", "expected": "E1"}]}."""


def load(dataset, outputs, domain_name):
    data = json.loads((ROOT / dataset).read_text())

    def output(ref):
        return {"concept": ref.split("/")[-1].replace("-", " "), "content": (ROOT / outputs / f"{ref}.svg").read_text()}

    items = []
    for item in data["items"]:
        signal = {"signal": item["signal"], "text": item.get("text")}
        if item.get("icon"):
            signal["output"] = output(item["icon"])
        if item["signal"] == "pick":
            signal["chosen"], signal["rejected"] = output(item["chosen"]), output(item["rejected"])
        if item["signal"] == "edit":
            signal["before"] = output(item["before"])
            signal["after"] = {"concept": signal["before"]["concept"], "content": item["after"]}
        lessons = {lesson["id"]: lesson for lesson in data["lessons"]}
        for lesson in item.get("lessons_override", []):
            lessons[lesson["id"]] = lesson
        items.append({"id": item["id"], "signal": signal, "lessons": list(lessons.values()), "expected": item["expected"]})
    return items


def judge(item, predicted, model):
    if not predicted or not item["expected"]:
        return []
    expected = "\n".join(f"- E{i + 1}: {e['statement']}" for i, e in enumerate(item["expected"]))
    found = "\n".join(f"- P{i + 1}: {p['statement']}" for i, p in enumerate(predicted))
    feedback = item["signal"].get("text") or f"({item['signal']['signal']} without text)"
    current = describe_lessons(item["lessons"])
    user = f"Current lessons, for context:\n{current}\n\nFeedback: {feedback}\n\nExpected lessons:\n{expected}\n\nPredicted lessons:\n{found}"
    reply = mubit.call(JUDGE_PROMPT, user, model=model, record="metadata", session=f"judge-{item['id']}")
    pairs, used_p, used_e = [], set(), set()
    for m in (parse_json(reply["text"]) or {}).get("matches", []):
        try:
            p, e = int(str(m["predicted"]).lstrip("P")) - 1, int(str(m["expected"]).lstrip("E")) - 1
        except (KeyError, ValueError):
            continue
        if 0 <= p < len(predicted) and 0 <= e < len(item["expected"]) and p not in used_p and e not in used_e:
            pairs.append((p, e))
            used_p.add(p)
            used_e.add(e)
    return pairs


def field_scores(predicted, expected):
    relation_ok = predicted["relation"] in expected["relation"] and (
        predicted["relation"] == "new" or predicted["related_to"] in expected.get("related_to", [predicted["related_to"]])
    )
    return {
        "scope": predicted["scope"] in expected["scope"],
        "expressible_as": predicted["expressible_as"] in expected["expressible_as"],
        "relation": relation_ok,
    }


def summarise(rows):
    required = sum(sum(not e.get("optional") for e in r["expected"]) for r in rows)
    hit = sum(sum(not r["expected"][e].get("optional") for _, e in r["pairs"]) for r in rows)
    predicted = sum(len(r["predicted"]) for r in rows)
    matched = sum(len(r["pairs"]) for r in rows)
    fields = [f for r in rows for f in r["fields"]]
    acc = {k: sum(f[k] for f in fields) for k in ("scope", "expressible_as", "relation")}
    return {
        "recall": f"{hit}/{required}",
        "precision": f"{matched}/{predicted}",
        **{k: f"{v}/{len(fields)}" for k, v in acc.items()},
        "mean_seconds": round(sum(r["seconds"] for r in rows) / len(rows), 2),
    }


def main():
    parser = argparse.ArgumentParser(prog="python -m router.eval_extraction")
    parser.add_argument("name")
    parser.add_argument("--dataset", default="data/feedback.json")
    parser.add_argument("--outputs", default="runs/heldout-v1")
    parser.add_argument("--domain", default="icons")
    parser.add_argument("--models", nargs="+", default=["claude-sonnet-5-5", "claude-haiku-4-5"])
    parser.add_argument("--judge", default="claude-opus-5-5")
    parser.add_argument("--workers", type=int, default=4)
    args = parser.parse_args()

    domain = __import__(f"{args.domain}.domain", fromlist=["domain"])
    items = load(args.dataset, args.outputs, args.domain)
    variants = {"rules": {}}
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        for i in items:
            variants["rules"][i["id"]] = extract_rules(i["signal"], i["lessons"], domain)
        for model in args.models:
            futures = {i["id"]: pool.submit(extract_llm, i["signal"], i["lessons"], domain, model, f"extract-{i['id']}") for i in items}
            variants[f"llm:{model}"] = {k: f.result() for k, f in futures.items()}
        first = variants[f"llm:{args.models[0]}"]
        variants["hybrid"] = {i["id"]: extract_hybrid(i["signal"], i["lessons"], domain, *first[i["id"]]) for i in items}

        results = {}
        for name, outputs in variants.items():
            futures = {i["id"]: pool.submit(judge, i, outputs[i["id"]][0], args.judge) for i in items}
            rows = []
            for i in items:
                predicted, seconds = outputs[i["id"]]
                pairs = futures[i["id"]].result()
                rows.append({
                    "id": i["id"],
                    "expected": i["expected"],
                    "predicted": predicted,
                    "pairs": pairs,
                    "fields": [field_scores(predicted[p], i["expected"][e]) for p, e in pairs],
                    "seconds": seconds,
                })
            results[name] = {"summary": summarise(rows), "rows": rows}

    out = ROOT / "runs" / args.name
    out.mkdir(parents=True, exist_ok=True)
    (out / "extraction.json").write_text(json.dumps(results, indent=1))
    header = ["variant", "recall", "precision", "scope", "expressible_as", "relation", "mean_seconds"]
    print(" | ".join(header))
    for name, r in results.items():
        print(" | ".join([name] + [str(r["summary"][h]) for h in header[1:]]))
    print(f"details: {out / 'extraction.json'}")


if __name__ == "__main__":
    main()
