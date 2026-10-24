"""Routing stage: a fixed policy over measured signals (ARCHITECTURE.md, "Routing rules").

Routes describe where a lesson ends up:
  A      stays in context or code permanently (parameters, volatile lessons)
  A∧B    trained into the weights and kept in context, because it is cheap
  B      trained into the weights, then removed from context once absorbed
  note   applies to one output only; the style does not change
  rephrase  had no measurable effect in context, so Mubit has nothing to learn from yet
"""

CHEAP_TOKENS = 60  # a one-line rule; above this, keeping it in every prompt is a real cost
MIN_EFFECT = 0.5  # share of probes where the lesson visibly changed the output as intended


def route(lesson, signals, calls_per_day):
    """Return (route, reason). `signals`: tokens, stability, effect (share or None)."""
    tokens, stability, effect = signals["tokens"], signals["stability"], signals.get("effect")
    cost = f"{tokens} tokens × {calls_per_day:,} calls/day"

    if lesson["scope"] == "instance":
        return "note", "applies to one output only"
    if lesson["expressible_as"] == "parameter":
        return "A", "code applies it to every output at zero tokens"
    if stability == "temporary":
        return "A", f"marked temporary, so it stays editable in context ({cost})"
    if effect is not None and effect < MIN_EFFECT:
        return "rephrase", f"changed {effect:.0%} of probes in context; nothing for the weights to learn yet"
    measured = f"; changed {effect:.0%} of probes" if effect is not None else ""
    if tokens <= CHEAP_TOKENS:
        return "A∧B", f"stable and cheap ({cost}){measured}: train it and keep it in context"
    return "B", f"stable and costly ({cost}){measured}: train it, then remove it from context"
