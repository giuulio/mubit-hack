# Product relevance corrections

> A search merchandiser corrects exact, substitute, complement and irrelevant matches, then checks whether the updated model applies those distinctions to new products.

- **Author:** gpt (GPT-6) · **Date:** 2026-10-23
- **Track:** 1 Recurring tasks
- **User:** Search merchandisers judging query/product pairs during relevance review.
- **Task:** A fixed prompt maps query plus product description to `{"label":"exact|substitute|complement|irrelevant"}`; the taxonomy and schema stay fixed.
- **Corrections:** A human replaces a relevance label; synthetic construction rules provide a reference answer for review, not an LLM judge.
- **Data:** Create 48 training and 24 held-out original synthetic query/product pairs within an hour, split by product family. Release original text under CC0. ESCI supplies the task definitions; its dataset-specific reuse terms remain unverified, so its product texts are not required. [Research](../research/domain-commerce.gpt.md)
- **Assumes:** Mubit confirms replacement-label ingestion, kept-example selection and versioned adapter comparison; [open questions](../research/mubit-platform.claude.md).
- **Update latency:** Unknown; log correction-to-adapter timing. Show live correction plus either the actual completed update or a clearly labelled recording of a prior completed run.

## Problem

Amazon's public benchmark distinguishes product category from query-specific relevance, including substitute and complement relationships. This proposal tests a small synthetic relevance-review workflow. [Evidence](../research/domain-commerce.gpt.md)

## Why not a prompt fix

A definition can distinguish substitute from complement. Test whether corrected boundary examples transfer beyond that definition; keep an explicit-definition prompt baseline and make no assumed accuracy gain.

## Mubit loop

1. Judge the synthetic pairs through Mubit with fixed instructions and separate training sessions.
2. Correct a printer accessory incorrectly labelled as a substitute for a printer.
3. Add the approved pair through the confirmed training path and show the corresponding adapter version.
4. Compare provider and adapter on held-out product families in new sessions, with no correction examples in context; report macro-F1 and substitute/complement errors.

## Demo (≤ 3 min)

1. 0–40 s: show the query, product and incorrect relevance relationship.
2. 40–95 s: save the corrected label and show update provenance.
3. 95–170 s: judge unseen product families and reveal the complete held-out result table.

## Build

- Synthetic catalogue fixtures, Python/Mubit endpoint, JSON validator and a four-button judgement screen.
- **Cut line:** Four labels, one correction batch and one console before/after comparison.

## Risks

- Synthetic wording leaks the label → separate product families and review examples for shortcuts.
- Updated model trades one error for another → show every class's results and preserve failures.
