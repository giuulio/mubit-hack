# Stage: extraction

- **Purpose:** Decide, by test, what logic the extraction tool needs. Part of the [lesson router](../../ARCHITECTURE.md).
- **Author:** Claude (Claude Code) with the team · **Date:** 2026-10-24
- **Status:** First comparison done; provisional decision below, pending label review and a fresh test set.

## Job

Extraction turns raw feedback into **lessons** and says how each could be expressed. Routing, a separate stage, decides where each lesson lives. They are split because extraction is interpretation and routing is policy over measured signals; each can then be tested and replaced alone.

## Inputs

| Signal | Example | Shape |
| --- | --- | --- |
| Taste direction | "thin, rounded, organic" | Free text, style-wide |
| Critique of one output | "this one's too busy" | Free text plus the icon |
| Pick between variants | Chose B over A | Preference pair, no reason |
| Edited output | SVG changed in a vector tool | Before and after |
| Measurement | Validator failures rising | Numbers. Later |
| New demand | New kinds of concept arriving | A trigger to look, not a lesson. Later |

## Output: the lesson record

| Field | Values | Why the router needs it |
| --- | --- | --- |
| `statement` | One atomic lesson | What goes into STYLE.md or guides examples |
| `scope` | `style`, `family`, `instance` | A one-off fix must not change the style |
| `expressible_as` | `parameter`, `validator`, `rule`, `examples` | Enforceability and context cost |
| `parameter` | `{name, value}` or null | Lets code apply it with no model |
| `relation` | `new`, `duplicate`, `refines`, `contradicts` + `related_to` | Flip-flopping lessons are volatile |
| `evidence` | Signal and icon references | Traceability |

Definitions of `expressible_as`: **parameter**, code can apply it to any output (an attribute, a post-processor); **validator**, code can check it but the model must draw it; **rule**, statable in words but not reliably checkable; **examples**, only showable by example outputs.

## Options per sub-task

| Sub-task | Rules | LLM (via Mubit) | Trained classifier | Human confirmation |
| --- | --- | --- | --- | --- |
| Split into atomic lessons | ✗ | ✓ | ✗ No labels | — |
| Scope | ~ Cues like "this one" | ✓ | ✗ | ✓ |
| Expressibility | ✓ Known parameters | ✓ The rest | ✗ | — |
| Edited output → lesson | ✓ Attribute diff | ✓ Changes in meaning | ✗ | — |
| Pick → lesson | ✗ | ~ | ✗ | ✓ |
| Relation to existing lessons | ~ Same parameter | ✓ | ✗ | ✓ On conflict |

A trained classifier has no labelled data today; but the extraction calls are themselves a recurring task, so Mubit could later train an adapter for the extractor.

## Test

- **Data:** [data/feedback.json](../../data/feedback.json), 22 feedback items about the icons in [runs/heldout-v1](../../runs/heldout-v1), each hand-labelled with the expected lessons against six existing lessons. Labels were written by Claude and need review by the team. Some expected lessons are optional (ambiguous); some items expect no lesson at all (vague or no-difference feedback), to catch invented lessons.
- **Variants:** rules only; LLM only; hybrid (rules for parameters and diffs, LLM for the rest, the LLM's duplicate parameter lessons dropped).
- **Matching:** an LLM judge routed through Mubit pairs predicted with expected lessons by meaning; fields are then compared by code.
- **Metrics:** recall of required lessons, precision, scope, expressibility and relation accuracy on matched pairs, latency. Later: consistency across repeated runs, and the effect test (do probe icons change as intended with the lesson in context?).

## Results (2026-10-24)

Command: `python -m router.eval_extraction <run>`; details in `runs/<run>/extraction.json`. All calls metadata only; judge `claude-opus-5-5`.

**v1:** original extractor prompt.

| Variant | Recall | Precision | Scope | Expressible as | Relation | Mean s |
| --- | --- | --- | --- | --- | --- | --- |
| Rules | 12/23 | 13/13 | 13/13 | 11/13 | 9/13 | 0.0 |
| LLM, `claude-sonnet-5-5` | 20/23 | 21/22 | 20/21 | 19/21 | 18/21 | 2.7 |
| LLM, `claude-haiku-4-5` | 20/23 | 21/34 | 19/21 | 19/21 | 14/21 | 2.1 |
| Hybrid (rules + Sonnet) | 19/23 | 20/23 | 19/20 | 18/20 | 16/20 | 2.7 |

**v2:** one sentence added to the prompt (approval yields an example lesson) and the current lessons given to the judge. Two runs:

| Variant | Recall | Precision | Scope | Expressible as | Relation | Mean s |
| --- | --- | --- | --- | --- | --- | --- |
| LLM, Sonnet, run 1 | 21/23 | 24/27 | 22/24 | 24/24 | 23/24 | 3.9 |
| LLM, Sonnet, run 2 | 23/23 | 25/31 | 23/25 | 24/25 | 23/25 | 3.2 |
| Hybrid, run 1 | 21/23 | 25/28 | 23/25 | 24/25 | 21/25 | 3.9 |
| Rules (deterministic) | 11/23 | 12/13 | 12/12 | 11/12 | 9/12 | 0.0 |

Observations:

- v1 Sonnet missed both approvals ("love this one", a pick): nothing told it approval is a lesson, yet chosen outputs are how B lessons get their examples.
- Haiku over-generates (34 lessons for 22 items, invented style rules from picks) and calls value changes "refines" rather than "contradicts", which would hide volatility from the router.
- Rules add nothing over Sonnet and cost relation accuracy: they cannot tell that "no accent dot" contradicts a lesson not stated as a parameter.
- Most remaining Sonnet extras restate existing lessons as duplicates, which is harmless for routing; "make them cooler" correctly yields nothing.
- Consistency: the two v2 runs matched the same lessons with the same count on 17/22 items.
- The judge varies by about 1 lesson per run: deterministic rules output scored 12/23 and 11/23.

## Decision (provisional)

- Extraction is **one `claude-sonnet-5-5` call through Mubit** with the v2 prompt, JSON out, about 3 s. Rules and the hybrid are dropped; the LLM reads before/after SVGs directly.
- **The user confirms extracted lessons** before they are routed: run-to-run variation (17/22) is too high to apply lessons unseen.
- Caveats: labels were written by Claude and are unreviewed; the v2 prompt was tuned on the same 22 items, so a fresh feedback set is needed before quoting these numbers; the effect test (do probe outputs change as intended?) has not run yet.
