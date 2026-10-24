# Stage: routing

- **Purpose:** Decide where each confirmed lesson lives. Part of the [lesson router](../../ARCHITECTURE.md).
- **Author:** Claude (Claude Code) with the team · **Date:** 2026-10-24
- **Status:** First policy implemented (`router/route.py`); evaluation by outcome pending a trained adapter.

## Who decides

Extraction interprets language, so it uses an LLM ([extraction](extraction.md)). Routing is a **fixed policy over measured signals**: an LLM cannot see token counts, call volume, whether context changes the output, or whether the adapter has learned something. A policy is reproducible, explainable in the interface, and can be compared with all-A and all-B. LLMs only gather measurements (the effect judge); they never make the decision.

## Signals

| Signal | Source | Measured or asked |
| --- | --- | --- |
| Scope, expressible as | Extraction, confirmed by the user | Confirmed |
| Context cost | Token-count endpoint: context with the lesson minus without, × calls per day | Measured |
| Stability | One tap when confirming: permanent or for now | Asked |
| Effect | Three probe concepts generated with and without the lesson (metadata only), judged pairwise from rendered images | Measured |
| Absorption | Adapter outputs from Try models on the probes without the lesson, judged for compliance | Measured |

## Policy

1. Instance scope → **note** for that concept; the output is regenerated with it.
2. Parameter → **A**: code applies it at zero tokens.
3. Temporary → **A**: stays editable in context.
4. Effect below 50% → **rephrase**.
5. Stable, effective, ≤ 60 tokens → **A∧B**.
6. Otherwise → **B**; retired from context when absorption reaches two thirds of the probes.

A contradicting lesson supersedes the one it contradicts; a duplicate is recorded but not applied.

## First observations (trial project, 2026-10-24)

- "thin, rounded, organic, no fills" became four parameter lessons (**A**, 0 tokens) and one rule ("organic, softly curved forms"): effect 3/3 probes, 31 tokens → **A∧B**. The effect test took about 9 s.
- Approving one icon became an example lesson: 373 tokens → **B**.

## Demo project "Hone icons" (2026-10-24)

Four feedback rounds (1 direction, 18 critiques, picks and one edit) produced 27 lessons in context at 1,312 tokens: 4 parameters (**A**), 7 style rules (**A∧B**), 3 style examples (**B**) and 17 notes. Seven lessons went to **rephrase**.

- **Rephrase catches what the model already does:** "at most four shapes" and "2 px padding" changed 1/3 and 0/3 probes, because Sonnet already follows them.
- **Rephrase catches what words cannot do:** "round every sparkle tip" failed three phrasings; the model kept drawing sharp tips. A hand-drawn edit (an example) fixed it in one round.
- **Probes must include the source concept:** with three random probes, "draw bars as pills" scored 0/3 because no probe had bars. The lesson's source concept is now always a probe (2/3 → **A∧B**). Narrow family lessons are still diluted by the two random probes.
- **Note examples stay with their concept:** an approved or redrawn icon scoped to one concept is shown only when that concept is generated, not in every prompt.
- **Contradictions work:** "keep the fins" superseded the earlier "no fins" note after the rocket became a leaf.
- 40 training calls under the frozen context: 40/40 valid.
- Held-out evaluation (12 concepts, blind 1–5 judge): Opus bare 3.08 style, Opus + full context 3.50, Sonnet + routed context 3.82; recognisability 3.33, 3.67 and 3.09.

## Evaluation (to do)

- Effect-test agreement with the user's eyes on a probe sheet.
- Policy ablation once an adapter exists: all-A against all-B against routed, on style, recognisability, tokens per call and cost per 1,000 outputs ([evidence 3](../../ARCHITECTURE.md#evidence-we-aim-to-obtain)).
