# Demo: Icon Master, one model and three looks

- **Purpose:** The story, evidence and remaining work for the demo, centred on the Icon Master model. Builds on [demo-video-script.md](demo-video-script.md) and [docs/stages/contexts.md](stages/contexts.md).
- **Author:** Claude (Claude Code) with Giulio · **Date:** 2026-10-24, 22:45 BST
- **Status:** Proposal. Contexts and training batches exist; the serving view and the per-context evaluation are still to build.

## One line

**One model, many house styles.** Hone decides, lesson by lesson, what each style rents in its context and what the model owns in its shared weights, then serves each style from the cheapest model that holds its quality.

## The task, stated on screen

| | |
| --- | --- |
| Input | A concept ("heat pump") and a house style (a context) |
| Output | One SVG icon on a 24 × 24 canvas |
| Measured by | Valid (checker), style and recognisable (blind judge, 1–5), input tokens and seconds per call |
| Model | Icon Master: one Mubit task (system prompt "… Project: Hone icons."), Sonnet 5.5 as provider |

## Three contexts on the same weights

| Context | Look | Lives in context | Why it is in the demo |
| --- | --- | --- | --- |
| Smooth | Rounded, hand-drawn line icons | Rules and three example icons (~1,350 tokens) | The original style; 40 kept calls |
| Pixel | 8-bit icons from square cells, no curves | Grid, margin and no-curve rules (~290 tokens) | Contradicts Smooth, so its rules can never share weights |
| Duotone | Flat green fills, white cut-outs, one orange accent | Colours and stroke in code, cut-out and accent rules (~245 tokens) | Shows parameters applied in code at zero tokens |

Each context's rules changed 3 of 3 probes and still routed **Context**: effective and stable, but specific to one look. Model-wide lessons (one clear idea per icon; avoid stock-looking forms; the 24 × 24 canvas) appear in all three.

## Story (3 minutes)

1. **Hook (0:00–0:20).** The same concept in all three contexts, side by side: one model, three looks.
2. **The task (0:20–0:35).** The table above, in one sentence.
3. **Honing (0:35–1:30).** A live critique in one context that yields two lessons: one specific to the look (stays in its context) and one that holds in every context (goes to the shared weights). Duotone's mail icon did exactly this on 2026-10-24: "white cut-outs" (Duotone only) and "keep the identifying detail" (every context).
4. **Weights (1:30–2:00).** Kept calls from all three contexts in one Mubit task; the adapter version from the console.
5. **Evidence (2:00–2:45).** Per context, the same held-out concepts across the ladder: raw frontier, frontier + context, Sonnet + Hone's context, adapter + context (Try models). Pictures plus style, valid, tokens.
6. **Serving (2:45–3:00).** Per context, the cheapest rung that passes the held-out bar serves it; otherwise the frontier with context is the fallback.

## Facts that shape it

- Mubit has no API for adapter status and no way to call an adapter by model ID; adapters run only in Try models. Adapter outputs in Hone are pasted from there (operator drawer).
- The console does route live calls to an adapter "under task rules" once a version passes its silent test and goes live. Hone can show which rung *should* serve each context; Mubit's routing is what serves it.
- **Blocker, 2026-10-24 22:40:** the "Design icons" task shows *Reviewing examples, 0 of 25 kept*. Its reviewer saw the 40 Smooth calls four hours earlier: "40 new calls, 0 kept, 0 rejected". No adapter can train until calls are kept. Training is enabled (the Adapters page exists). Ask Mubit staff why the reviewer keeps none, quoting the task and an `mreq_` ID from `project.json`.
- 80 more calls recorded in full at 22:44–22:45, for Mubit to keep: 40 under Duotone (40 valid), 40 under Pixel (38 valid).

## To build

| Item | What | Why |
| --- | --- | --- |
| Styles grid | One concept drawn by every context side by side | The hook and the "same weights, different looks" proof |
| Per-context evaluation | Held-out run in each context; adapter rows from Try models | The evidence matrix |
| Serving view | Per context: the ladder, the rung that passes, tokens per call | The cheap-model-first, frontier-fallback story |
| Validator measurement | Measure checkable lessons by checker pass rate, not the visual judge | The canvas rule scored 0 of 3 because its probes were already correct |

## Open decisions

- Re-route Smooth's lessons from before contexts: a dry run moves 9 of them to Context (6 Both rules, 3 Weights examples); two stay Both. The projected 1,312 → 402 drop disappears, because Smooth's examples stay rented.
