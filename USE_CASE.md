# Use case: on-style SVG icon generation

- **Purpose:** Choose the use case that shows the [lesson router](ARCHITECTURE.md) best, using criteria stated before the choice.
- **Author:** Claude (Claude Code) with the team · **Date:** 2026-10-24
- **Status:** Leading candidate. Selection holds only if the first tests below pass.
- **Basis:** [ARCHITECTURE.md](ARCHITECTURE.md), [PRODUCT_CRITERIA.md](PRODUCT_CRITERIA.md), [HACKATHON.md](HACKATHON.md), [Lucide icon design guide](https://lucide.dev/contribute/icon-design-guide) and [Lucide repository](https://github.com/lucide-icons/lucide) (both accessed 2026-10-24).

## Selection criteria

Thresholds are our own proposals. A candidate failing any gate is dropped.

### Gates

| # | Gate | Test |
| --- | --- | --- |
| G1 | **Fixable by telling.** Errors come from house conventions, not missing capability | On 20 cases, a frontier model with a written style guide clearly beats the same model without it |
| G2 | **Checkable.** Style is checked by code; meaning by a blind human ranking or a judge routed through Mubit | Validators exist for most written rules |
| G3 | **Lessons are conventions, not facts.** Stable for months and applicable to many inputs | Facts that change stay in context or retrieval |
| G4 | **Fits one Mubit run.** Input plus output well under 8K tokens | Measured on 20 cases |
| G5 | **The small model is capable enough.** A task adapter can plausibly reach useful quality | First test 2 below |
| G6 | **Data in an hour.** 60+ public or synthetic cases plus a written house style we can hold back as ground truth | Licence checked |
| G7 | **Not crowded.** No build at this event in the same task family | Checked against public repositories |

### Objectives

- **O1 Mix of lessons:** some cheap to state, some only showable by example, some volatile, so all three routes are exercised.
- **O2 Context cost:** examples are expensive enough that carrying them in every prompt matters (Track 2).
- **O3 Volume:** the output is generated often enough for cost per 1,000 to matter.
- **O4 Legibility:** a non-expert judge sees the error and the fix in five seconds.
- **O5 Natural corrections:** a reviewer already approves or fixes these outputs.

## Candidates assessed

| Criterion | SVG icons with a common style | LaTeX with house format and flow |
| --- | --- | --- |
| G1 Fixable by telling | ✓ Frontier models draw icons but drift in stroke, fill, grid and detail | ✓ Format; ~ flow is partly judgement |
| G2 Checkable | ✓ Parse the SVG; meaning by ranking or judge | ✓ Compiles, house macros, section order; ~ flow needs a rubric |
| G3 Conventions | ✓ | ✓ |
| G4 Fits one run | ✓ An icon is roughly 0.5–1.5K tokens (estimate) | ~ Only sections or one-page documents |
| G5 Small model capable | ~ Risky for free drawing; plausible in a constrained grammar | ~ Long coherent documents are hard for a small model |
| G6 Data | ✓ Lucide: "1600+" icons, ISC licence, published design rules | ~ We would write the template ourselves |
| G7 Not crowded | ✓ None found | ✓ None found |
| O1 Mix of lessons | ✓ See routing below | ✓ Format rules plus flow patterns |
| O2 Context cost | ✓ Ten example icons push a prompt past one 8K-token run | ✓ |
| O4 Legibility | ✓✓ A grid of icons | ~ PDFs side by side |

**Choice: SVG icons.** SVG also makes image generation an LLM task, so Mubit can train on it; raster image models are called directly and cannot be trained through Mubit. LaTeX stays as a deck slide showing the same router on a second kind of output, not a second demo.

Also considered and dropped: UI-string localisation and job-title normalisation. Both scored well on checkability but do not match the team's direction of generated artefacts sharing a style.

## The use case

- **User:** a design-system team that needs new icons in its house style whenever a feature ships. Frequency and cost are assumptions, not researched.
- **Task:** concept name and short description → one SVG icon. Fixed system prompt; STYLE.md and the concept in the user message.
- **House style:** Lucide's published guide, held back as ground truth: 24 × 24 canvas, 1 px padding, 2 px centred strokes, round joins and caps, corner radii, 2 px spacing, matched visual weight, low density, balance, simple curves, pixel grid, reused shapes.

### How Lucide's rules route

| Lesson | Route | Why |
| --- | --- | --- |
| Canvas 24 × 24, `stroke="currentColor"`, `fill="none"` | A | Enforceable by a validator or post-processor |
| A company decision that may change, for example "sync is a cloud, not two arrows" | A | Volatile |
| 2 px stroke, round caps and joins, 1 px padding, corner radii | A∧B | Stable, frequent, cheap to state, checkable |
| Visual weight, density, balance, simple curves, reused shapes | B | Stable and frequent, but only showable by example icons, which are costly in context |

### Validators (code)

Valid SVG; `viewBox="0 0 24 24"`; `stroke-width="2"`; round caps and joins; no fills; coordinates within the 1 px safe zone; allowed elements only (`path`, `circle`, `rect`, `line`, `polyline`, `ellipse`); element count cap as a density proxy.

### Data plan

- **Training:** 25+ approved icons for Lucide concept names, generated by the provider with STYLE.md and examples, gated by validators and a reviewer.
- **Held out:** 20–25 **concepts not in Lucide** (for example "heat pump", "drone delivery"). Lucide is popular and may be memorised by name, so new concepts measure style transfer rather than recall. Split by icon family to avoid near-duplicates.
- **Probes:** five concepts per A∧B lesson, used to decide retirement.

## Demo sketch (≤ 3 min)

1. A grid of frontier-generated icons that drift from the house style.
2. A designer fixes two; the router sends "2 px stroke" to A∧B and "density" to B. The STYLE.md diff appears and the next icons are on-style immediately.
3. The adapter version with its timestamps, then its icon grid with STYLE.md shrunk.
4. The Track 2 table: validator pass rate, quality, tokens and cost per 1,000 icons.

## First tests

Run in parallel before building presentation.

| # | Test | Passes if (proposed) |
| --- | --- | --- |
| 1 | G1: frontier with and without STYLE.md on 20 new concepts | STYLE.md clearly raises the validator pass rate |
| 2 | G5: after 25+ kept icons, the adapter on 20 held-out concepts in Try models, rendered by hand | Most outputs are valid SVG and pass the validators |
| 3 | Retention: adapter with and without an A∧B lesson in context | The lesson holds without it; otherwise drop the retirement claim |

## Risks

- **The adapter cannot draw** → constrain the grammar further (fewer element types, coordinate grid); if test 2 still fails, switch to the LaTeX use case.
- **Semantic quality is subjective** → blind ranking by two team members, with disagreements reported.
- **Try models outputs must be rendered by hand** → keep the held-out set small and script the rendering of pasted SVG.
- **Base models have memorised Lucide** → held-out concepts are new ones.
