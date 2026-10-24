"""Routing stage: a fixed policy over measured signals (ARCHITECTURE.md, "Routing rules"; docs/stages/contexts.md).

Routes describe where a lesson ends up:
  A      stays in context or code permanently (parameters, volatile lessons, lessons specific to one context)
  A∧B    trained into the weights and kept in context, because it is cheap
  B      trained into the weights, then removed from context once absorbed
  note   applies to one output only; the style does not change
  rephrase  had no measurable effect in context, so Mubit has nothing to learn from yet

A model's weights are shared by all its contexts (smooth, sharp, pixel icons), so only a lesson whose reach is the whole
model may go to them; a lesson specific to one context stays in that context however stable or costly it is.
"""

CHEAP_TOKENS = 60  # a one-line rule; above this, keeping it in every prompt is a real cost
MIN_EFFECT = 0.5  # share of probes where the lesson visibly changed the output as intended


def route(lesson, signals, calls_per_day, context_name=None):
    """Return (route, reason). `signals`: tokens, stability, effect (share or None). `lesson["reach"]`: context or model."""
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
    if lesson.get("reach", "context") != "model":
        where = f"the {context_name} context" if context_name else "its context"
        return "A", f"specific to {where}, and the weights are shared by every context: it stays in context ({cost}){measured}"
    if tokens <= CHEAP_TOKENS:
        return "A∧B", f"holds in every context, stable and cheap ({cost}){measured}: train it and keep it in context"
    return "B", f"holds in every context, stable and costly ({cost}){measured}: train it, then remove it from context"
