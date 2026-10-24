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

## Evaluation (to do)

- Effect-test agreement with the user's eyes on a probe sheet.
- Policy ablation once an adapter exists: all-A against all-B against routed, on style, recognisability, tokens per call and cost per 1,000 outputs ([evidence 3](../../ARCHITECTURE.md#evidence-we-aim-to-obtain)).
