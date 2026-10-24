# Stage: serving

- **Purpose:** Decide which configuration should answer each context's calls, cheapest first. Part of the [lesson router](../../ARCHITECTURE.md); follows [routing](routing.md) and [models and contexts](contexts.md); used by the [Icon Master demo](../demo-icon-master.md).
- **Author:** Claude (Claude Code) with Giulio · **Date:** 2026-10-24
- **Status:** Implemented in `router/serve.py`; every held-out evaluation now stores its decision, shown on Results → Serving.

## Policy

The ladder, cheapest first: the Mubit adapter alone, the adapter with the context, the provider (Sonnet 5.5) with Hone's routed context, the frontier (Opus 5.5) with every lesson. The frontier with context is the reference and the fallback. A cheaper rung serves if its blind style score is within **0.25** of the reference's and it has **at most one more invalid output** (n = 12). Like routing, it is a fixed policy over measured numbers. Mubit's task rules are what route live calls to an adapter; Hone states which rung should serve.

## Results (Icon Master, 2026-10-24, n = 12 held-out concepts per context)

| Context | Raw frontier | Frontier + context | Hone (Sonnet + context) | Serves |
| --- | --- | --- | --- | --- |
| Smooth | style 2.75 · 11/12 valid · 105 tokens | 3.33 · 12/12 · 1,360 | **3.75 · 12/12 · 1,360** | Hone |
| Pixel | 1.00 · 12/12 · 105 | 3.75 · 12/12 · 346 | **3.58 · 12/12 · 346** | Hone |
| Duotone | 1.08 · 11/12 · 105 | 4.17 · 12/12 · 302 | **3.92 · 12/12 · 302** | Hone |

- Without context the frontier draws one generic style: 1.0–2.75 on each context's style.
- Recognisability falls where the look is extreme: Pixel 4.17 raw, 3.00 frontier + context, 2.58 Hone. Report it next to style.
- Adapter rungs are missing: Mubit has kept 0 of the task's calls, so no version exists (see the demo note).
- Frontier + context and Hone send the same tokens today: nothing has been retired from any prompt yet.

## A harness fix found here

Pixel's first evaluation (22:49) had Hone at 9/12 valid, which made the frontier serve. All three failures were replies cut off at 2,000 output tokens: pixel art drawn cell by cell runs long. Generation now allows 6,000 output tokens (`OUTPUT_TOKENS` in `router/pipeline.py`), which keeps prompt and reply within one 8K Mubit run; `max_tokens` does not change the Mubit task. The re-run (22:53) is the row above.

## Open

- Tolerances are first guesses; the metrics pass should derive them from judge agreement across repeated runs.
- Cost per 1,000 icons needs provider prices for each model; tokens per call are the honest proxy until then.
