# Use case: bespoke icon styles you own

- **Purpose:** Choose the use case that shows the [lesson router](ARCHITECTURE.md) best, using criteria stated before the choice.
- **Author:** Claude (Claude Code) with the team · **Date:** 2026-10-24
- **Status:** Chosen for a spike on 2026-10-24. Selection holds only if the first tests below pass; the fallback is the LaTeX report use case below.
- **Basis:** [ARCHITECTURE.md](ARCHITECTURE.md), [PRODUCT_CRITERIA.md](PRODUCT_CRITERIA.md), [HACKATHON.md](HACKATHON.md), [Lucide icon design guide](https://lucide.dev/contribute/icon-design-guide) and [Lucide repository](https://github.com/lucide-icons/lucide) (both accessed 2026-10-24).

## Pitch

AI coding agents reach for the same icon libraries, Lucide above all, and those defaults now read as a sign of generic, AI-made design. A less common library avoids the stigma but still leaves almost no room for personalisation, and no reliable tool creates icons on demand. Teams want what the Claude app has: icons that are **unique to their product**, available for **any concept**, and sharing **one recognisable style**.

Our system lets a designer grow that style from corrections. Each correction takes effect immediately in context; the router moves the stable parts of the style into an adapter the team owns, so the style lives in its own model instead of a borrowed library or an ever-growing prompt. This is Track 2 taken literally: **own your intelligence layer**, here your icon style.

## How the pitch maps to the architecture

| Pitch element | Architecture |
| --- | --- |
| Unique to my project | One style = one Mubit task with a fixed system prompt, owned as an adapter |
| A common thread in style | Lessons from a designer's corrections, held in STYLE.md and example icons |
| Icons for just about anything | Held-out concepts never seen in training test transfer, not recall |
| Hard specs: canvas, stroke width, colour | **A**: validators and post-processors in the harness; colour is also volatile |
| Cheap, stable rules: radii, caps, padding | **A∧B**: in STYLE.md until the adapter passes the lesson's probes without it, then retired |
| The feel: visual weight, density, metaphor, a signature detail | **B**: only showable by example icons (roughly 0.5–1.5K tokens each), which is what becomes expensive in context |
| Lucide reads as slop | Lucide becomes the baseline and a **slop score**: distance from a generated icon to its nearest Lucide icon |

The style is not given up front: it **emerges from corrections**, so every correction defines the style rather than recovering a written rule. That is the loop the judges score.

## The use case

- **User:** a product team, or a designer working for one, that needs new icons whenever a feature ships, and that will not ship default library icons.
- **Task:** concept → one SVG icon. Fixed system prompt; STYLE.md, any example icons and the concept in the user message. Model: `claude-sonnet-5-5` on starter credit.
- **Corrections:** critique and approve. A designer picks between variants, writes a short critique ("more negative space") or pastes back an SVG edited in a vector tool. The system regenerates with the lesson in context until the designer approves, so an approved icon is generated from lessons rather than copied from a fixed answer ([recording rule 3](ARCHITECTURE.md#recording-rules)).
- **Hidden target style:** for objective evaluation we design a target style before the demo, a short brief plus seed icons in `style/`. Demo corrections apply it; validators and the judge measure against it.

### Metrics

| Metric | How |
| --- | --- |
| Validity | The SVG parses and renders |
| Style conformance | Validators: canvas, stroke attributes, allowed geometry, safe zone, element count, accent |
| Set consistency | Odd-one-out judge routed through Mubit: can it pick the new icon out of a row of set icons? |
| Slop score | Highest overlap between the rendered icon and any Lucide icon |
| Novelty | Highest overlap with any training icon, so the adapter is not just copying |
| Cost | Prompt tokens, Mubit runs and cost per 1,000 icons |

### Data plan

- **Training:** 25+ approved icons for everyday UI concepts, generated with STYLE.md and seed icons in context, gated by validators and a reviewer.
- **Held out:** 20–25 unusual concepts (for example "heat pump", "sourdough starter"), split by concept family to avoid near-duplicates.
- **Probes:** five concepts per A∧B lesson, used to decide retirement.
- **Lucide:** used only as the slop reference, downloaded at build time (ISC licence), not committed.

## Demo sketch (≤ 3 min)

1. A coding agent's default icons: Lucide lookalikes with a high slop score.
2. A designer sets a direction and corrects three icons. STYLE.md changes and the next icons follow the style immediately (A).
3. After 25 approved icons, the adapter (B) draws unseen concepts in the style without the example icons in the prompt.
4. The Track 2 table: consistency, slop score, tokens and cost per 1,000 icons, frontier versus our system.

## First tests

| # | Test | Passes if (proposed) |
| --- | --- | --- |
| 1 | Frontier with and without STYLE.md and seeds on 20 new concepts | Context clearly raises validator pass rate and lowers the slop score |
| 2 | Replay determinism: the same call twice at temperature 0 | Replays reproduce the approved SVG, so only approved icons are kept |
| 3 | After 25+ kept icons, the adapter on 20 held-out concepts in Try models, rendered by hand | Most outputs are valid and pass the validators |
| 4 | Adapter with and without an A∧B lesson in context | The lesson holds without it; otherwise drop the retirement claim |

## Risks

- **Mubit's agreement gate:** a version reaches Try models only if its answers agree with the provider's, and one concept has many valid icons → constrain geometry (lines and arcs, few elements) to reduce variance; test 3 decides.
- **A small adapter cannot draw** → same constraint; if test 3 fails, switch to the LaTeX fallback.
- **Volume for the cost argument is modest:** one project needs tens to hundreds of icons → present cost per 1,000 for runtime generation (per category or per user-created item) and across many projects, and say so.
- **Existing vector generators with reference styles** (Recraft, for example; to verify) → our difference is a style learned from corrections and owned as weights, with the router managing context.
- **Base models have memorised Lucide** → the slop score measures exactly that; held-out concepts are not in Lucide.

## Selection criteria and candidates

Thresholds are our own proposals. Gates: G1 fixable by telling, G2 checkable by code and judge, G3 conventions not facts, G4 fits one Mubit run, G5 a small model is capable enough, G6 data in an hour, G7 not crowded at the event. Objectives: a mix of lessons for all three routes, context cost, volume, five-second legibility, natural corrections.

| Criterion | Bespoke SVG icons | LaTeX experiment reports (fallback) |
| --- | --- | --- |
| Mubit's agreement gate | ~ Creation: many valid answers | ✓ Transformation: input largely fixes output |
| Small model capable | ~ Risky; constrained geometry helps | ✓ |
| All three routes | ✓ | ✓✓ Format rules vs flow |
| Context cost | ✓ | ✓✓ |
| Checkable by code | ✓ | ✓ Compile, linters |
| Volume | ~ | ✓ |
| Legibility | ✓✓ | ~ |
| Usefulness pitch | ✓✓ Clear pain: default icons read as slop | ✓ |
| Not crowded | ✓ | ✓ |

The fallback: an ML team's one-page experiment report, a run JSON in and the LaTeX body out, with format rules (`booktabs`, `siunitx`, `\cref`, section order) as A∧B and flow ("lead with the result", "caveats after results") as B.
