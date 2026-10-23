# Evidence screening corrections

> A literature reviewer corrects a study-screening decision and tests whether the updated model handles unseen abstracts under the same eligibility criteria.

- **Author:** gpt (GPT-6) · **Date:** 2026-10-23
- **Track:** 1 Recurring tasks
- **User:** Researchers screening candidate studies one record at a time for a systematic review.
- **Task:** A fixed prompt takes eligibility criteria, title and abstract in the user message and returns `{"decision":"include|exclude|uncertain","criterion":"...","evidence":"..."}`.
- **Corrections:** A reviewer changes the decision and cited evidence. Missing abstract information receives `uncertain`; a full-text inclusion label is not automatically treated as abstract-level truth.
- **Data:** Within one hour, select 60 records from one SYNERGY review, manually adjudicate 40 for training and reserve 20 by DOI. Record uncertainty and retain criteria. SYNERGY declares CC0 1.0; [data and limits](../research/domain-healthcare-science.gpt.md).
- **Assumes:** Mubit confirms corrected decision/evidence targets can enter adapter training and identifies the updated version; [platform gaps](../research/mubit-platform.claude.md).
- **Update latency:** Unknown; measure correction-to-ready time. Use live review plus the completed update, or label a timestamped recording if training exceeds the demo window.

## Problem

SYNERGY records include/exclude decisions across 26 reviews; ASReview already provides an interactive screening workflow. Some final inclusion labels require evidence beyond the abstract. [Research](../research/domain-healthcare-science.gpt.md)

## Why not a prompt fix

Explicit eligibility rules may suffice. Compare that baseline; test the narrower hypothesis that corrected evidence-selection examples improve consistency without adding correction history to inference.

## Mubit loop

1. Screen public titles/abstracts through Mubit with fixed instructions, model and schema.
2. Correct a decision where an inclusion requirement was inferred rather than stated.
3. Use the staff-confirmed adapter path and show the new version and approved training records.
4. Compare provider and adapter on held-out DOIs in new sessions; measure eligible-study misses, unsupported inclusions and uncertainty separately against the abstract-level adjudications.

## Demo (≤ 3 min)

1. 0–45 s: show the criteria and an abstract missing a decisive detail.
2. 45–100 s: correct the decision and show update lineage.
3. 100–170 s: screen unseen abstracts and display all three outcome categories.

## Build

- SYNERGY subset loader, adjudication sheet, Python/Mubit backend and an evidence-span review screen.
- **Cut line:** One review, 40 approved examples and console comparisons on the held-out set.

## Risks

- Abstracts cannot determine final inclusion → preserve uncertainty and avoid treating full-text labels as the grading oracle.
- Similar study records leak across splits → group by DOI and duplicate title.
