"""Serving stage: which configuration should answer a context's calls, decided from its held-out evaluation.

The ladder runs cheapest first: the Mubit adapter alone, the adapter with the context, the provider with Hone's routed
context, and last the frontier with every lesson. The frontier with context is the reference and the fallback: a cheaper
rung serves only if its blind style score is within TOLERANCE of the reference's and it has at most one more invalid
output (one output in twelve is within the noise, as a quarter of a point is for style).
Like routing, this is a fixed policy over measured numbers; Mubit's task rules are what actually route live calls.
"""

LADDER = ["adapter", "adapter + routed context", "provider + routed context", "frontier + full context"]
REFERENCE = "frontier + full context"
TOLERANCE = 0.25  # on the 1–5 style scale: about a quarter of a point is within the judge's noise at n = 12


def _valid(row):
    return row["valid"] / row["n"] if row["n"] else 0.0


def choose(rows):
    """{config, reason, checks}: the cheapest passing rung, with each rung's check, or None without a reference."""
    by = {r["config"]: r for r in rows}
    ref = by.get(REFERENCE)
    if not ref or ref["style"] is None:
        return None
    checks, chosen = [], None
    for config in LADDER:
        row = by.get(config)
        if not row or row["style"] is None:
            checks.append({"config": config, "status": "missing"})
            continue
        passes = config == REFERENCE or (row["style"] >= ref["style"] - TOLERANCE and _valid(row) >= _valid(ref) - 1 / ref["n"])
        checks.append({"config": config, "status": "pass" if passes else "fail", "style": row["style"], "valid": row["valid"], "n": row["n"], "input_tokens": row["input_tokens"]})
        if passes and chosen is None:
            chosen = config
    reason = (
        f"cheapest rung within {TOLERANCE} style of the frontier with context ({ref['style']:.2f}) and at most one more invalid output"
        if chosen != REFERENCE else "no cheaper rung holds up yet: the frontier with context serves as the fallback"
    )
    return {"config": chosen, "reason": reason, "reference": ref["style"], "tolerance": TOLERANCE, "checks": checks}
