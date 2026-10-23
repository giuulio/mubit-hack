# Protocol summary corrections

> A scientific document reviewer corrects a summary that contradicts its supplied protocol, then checks transfer to new document pairs.

- **Author:** gpt (GPT-6) · **Date:** 2026-10-23
- **Track:** 1 Recurring tasks
- **User:** Scientific or medical-information reviewers checking each draft document against its source.
- **Task:** One fixed prompt maps a synthetic protocol excerpt and draft summary to `{"status":"consistent|contradiction|insufficient","error_span":"...","corrected_sentence":"..."}`.
- **Corrections:** A reviewer replaces the status and minimal corrected sentence, using only the supplied source; the task does not infer clinical treatment advice.
- **Data:** Within an hour, write 40 training and 20 held-out synthetic pairs from original tables of schedules, populations and measurement endpoints. Add ten unchanged controls. Original fixtures can be CC0; MEDEC motivates the correction format, without requiring patient notes. [Research](../research/domain-healthcare-science.gpt.md)
- **Assumes:** Mubit confirms supervised replacement-text ingestion, kept-example selection and adapter/version identity. [Unresolved details](../research/mubit-platform.claude.md)
- **Update latency:** Unknown; record actual elapsed time and show the completed update or a labelled earlier recording alongside the live correction.

## Problem

Merck describes drafting and updating medical response documents; MEDEC benchmarks finding and correcting sentence-level medical-text errors. This proposal isolates source consistency on synthetic documents. [Evidence](../research/domain-healthcare-science.gpt.md)

## Why not a prompt fix

Number checks and clearer instructions may catch simple contradictions. Compare those baselines; test whether corrected scope and negation examples improve source-grounded edits without changing the prompt.

## Mubit loop

1. Send source/draft pairs through Mubit with fixed instructions and schema.
2. Correct a summary that changes a scheduled measurement into a reported result.
3. Pass the approved source/target pair through the confirmed training route and show the adapter record.
4. Compare provider and adapter on new protocol templates in fresh sessions, without correction history; measure contradiction detection, unsupported edits and preservation of unchanged controls.

## Demo (≤ 3 min)

1. 0–45 s: highlight the source sentence and the draft's changed meaning.
2. 45–100 s: approve a minimal correction and display update provenance.
3. 100–170 s: test an unseen paraphrase and an unchanged control, then reveal batch results.

## Build

- Original document-pair fixtures, Python/Mubit backend, text diff and a blinded review worksheet.
- **Cut line:** One document family and one correction-to-adapter comparison.

## Risks

- A semantic correction requires facts absent from the source → return insufficient evidence.
- The adapter rewrites correct text → retain unchanged controls and report unnecessary edits separately.
