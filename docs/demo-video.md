# Demo video plan (≤ 3 min)

- **Purpose:** Script the submission video around the thesis, the platform on Mubit and the icons project, using the evidence we already have.
- **Author:** Claude (Claude Code) with the team · **Date:** 2026-10-24
- **Status:** Proposal. Basis: commits up to `e0fee1d`, [ARCHITECTURE.md](../ARCHITECTURE.md), [docs/stages/routing.md](stages/routing.md), `projects/hone-icons/project.json` and the judging criteria in [HACKATHON.md](../HACKATHON.md).

## One line

**Rent what changes, own what lasts.** Every lesson lands in context instantly; Hone moves the ones worth keeping into a Mubit adapter, and measures both.

## What the judges must see

| Criterion | Where in the video |
| --- | --- |
| Use of Mubit: a correction becomes a model update | Beats 4 and 5: critique → lesson in context in seconds; training calls → adapter → lesson retired from context |
| Usefulness | Beat 1: default icons read as AI-made; teams want their own style for any concept |
| Technical execution | Beats 3 and 4: recording rules, measured routing (probes, tokens), held-out evaluation |
| Demo | Real screen recordings, one story, no slide longer than 15 s |

## Beats

About 420 words of voice-over at 150 words a minute.

| Time | Beat | Screen | Voice-over gist |
| --- | --- | --- | --- |
| 0:00–0:15 | 1. Hook | Model view: held-out icons, frontier row against routed row | Ask any model for icons and you get Lucide. Teams want their own style, and every correction they give ends up in a prompt that only grows. |
| 0:15–0:45 | 2. Thesis | Home schematic | A lesson can live in two places. Context is rented: instant, editable, paid on every call. Weights are owned: slow to train, free per call, and they hold taste that words cannot. Hone routes each lesson by measured cost, effect and stability. |
| 0:45–1:05 | 3. Platform on Mubit | Schematic, then Mubit console (Requests, Task) | Mubit records calls and trains an adapter per task. Hone decides what it learns from: one fixed system prompt per project is one Mubit task; previews, probes and judges are recorded as metadata only; only calls under an approved context are kept. Mubit has no corrections API, so a correction must first make the provider answer correctly in context. That is why every lesson starts in context. |
| 1:05–1:50 | 4. Live correction (A, seconds) | Studio, then the lesson's probes | Critique the chart: "bars should be pills". The lesson is extracted, confirmed, tested on three probes with and without it (2/3 changed) and routed **A∧B**; the next chart has pill bars. Sparkles: three phrasings of "round the tips" change nothing, so the router flags **rephrase** instead of training on it; one redrawn icon fixes it. Approve the lock, "exactly the style": an example at 357 tokens per call, routed **B**. Cheap words stay in context; taste shown by example is too costly to rent, so it goes to the weights. |
| 1:50–2:30 | 5. Model update (B, hours) | Lessons context split, Model view, Mubit console (Adapters, Try models) | 69% of every prompt is three example icons. 40 training calls under the approved context, 40/40 valid, sent 19:12. Adapter version and time from the console. Its outputs on held-out concepts without the examples; the absorption test retires a B lesson and the context line steps down. |
| 2:30–2:50 | 6. Results | Model view, Performance | 12 held-out concepts, blind judge: style 3.08 (Opus, no context), 3.50 (Opus, full context), 3.82 (Sonnet, routed context). Tokens per call and cost per 1,000 icons. |
| 2:50–3:00 | 7. Close | Home | Hone: the platform for bespoke Mubit models. Icons are the first domain plugin; any recurring task with a checker is next. |

## Numbers on screen (checked against `project.json`, 2026-10-24)

- Context per call: **1,312 tokens** = 102 base + 300 for seven **A∧B** rules + 910 for three **B** example icons (69%). Four **A** parameters cost 0 tokens: code applies them. 17 notes are paid only when their concept is generated.
- After the three **B** examples are absorbed and retired: **402 tokens** per call, 69% fewer. Projected until the absorption test passes; label it so.
- Training: batch 1, 40 calls recorded in full, 40/40 valid, each with a Mubit `mreq_` ID. No adapter version recorded yet.
- Held-out evaluation (19:13, n = 12): valid 12/12, 12/12, 11/12; style 3.08, 3.50, 3.82; recognisable 3.33, 3.67, 3.09; input tokens 105, 1,315, 1,315.

## Honesty rules for the cut

- Report n with every score. Show the recognisability dip in the deck, not hidden; claim style only in the video.
- Full and routed context cost the same today because nothing is retired yet. The token saving appears only after absorption.
- Mubit bills per run of up to 8K tokens, so 1,312 and 402 tokens are both one run: the saving is provider input tokens, not Mubit runs, at this size. About 25 example icons would cross 8K.
- Adapter latency from Try models is not comparable with API latency; do not show it next to API seconds.
- Speed up waits (effect test about 9 s, generation about 8 s) with an on-screen "×4" label; never cut the effect test itself, it is the evidence.

## The adapter gate

The judged moment is beat 5, and it depends on Mubit training an adapter from the 40 kept calls.

| By | Check | If yes | If no |
| --- | --- | --- | --- |
| 23:00 | Console: the task shows ≥ 25 kept examples and training started | Wait for the version | Send a second batch of 40 under the same context; check training is enabled |
| 01:00 (BST) | A version passed or reached Try models | Paste 8–12 held-out outputs into Model → Adapter outputs; run the absorption test on one **B** lesson; re-run Evaluate | Record beat 5 as the honest fallback: training batch with `mreq_` IDs, console task and adapter status with timestamps, and the projected 1,312 → 402 bar labelled "after absorption" |

Clocks go back at 02:00 → 01:00, which adds an hour before the 05:00 freeze. Submit a rough cut early: resubmission is allowed and the latest counts.

## Shot list

1. Home at 1920 × 1080, schematic fully visible.
2. Studio: generate chart, sparkles, lock; critique the chart; confirm; probes; regenerate the chart.
3. Studio: sparkles critique → rephrase; redraw edit; approve the lock → **B**.
4. Lessons: route badges, context split, examples, the message the model receives.
5. Model: training table, adapter log, adapter outputs, absorption, performance table and icon rows.
6. Mubit console: Requests showing metadata-only against full calls, the task, adapter versions, Try models.

## Cut for time (keep for the expo and Q&A)

- Rocket: "too many parts" turned it into a leaf; "keep the fins" superseded the earlier note.
- Probes must include the source concept: "pills" scored 0/3 on random probes, 2/3 with the chart.
- Domain plugins and the CLI (`python -m router`).
