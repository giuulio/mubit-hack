# FOI request item corrections

> A caseworker fixes how a multipart information request is split into requested records and tests the updated model on new phrasing.

- **Author:** gpt (GPT-6) · **Date:** 2026-10-23
- **Track:** 1 Recurring tasks
- **User:** FOI caseworkers preparing an item list for each incoming multipart request.
- **Task:** One fixed prompt maps a fictional request to `{"items":[{"record_type":"...","date_range":"...","scope_span":"..."}]}` without deciding exemptions or whether records should be released.
- **Corrections:** A reviewer splits, merges or edits an item while preserving the requester's scope; these are proposed workflow actions, not claimed existing Alaveteli features.
- **Data:** Write 40 training and 20 held-out original synthetic requests within one hour, covering overlapping date ranges, bundled records and clarifications. Original fixtures can be CC0; no real casework or correspondence is needed. [FOI platform context](../research/domain-public-sector-education.gpt.md)
- **Assumes:** Mubit confirms that corrected arrays can become kept examples and exposes an identifiable adapter update. [Open platform questions](../research/mubit-platform.claude.md)
- **Update latency:** Unknown; record actual timing. Show live correction and a completed update, or label a prior update recording when waiting would exceed the video window.

## Problem

Alaveteli provides an established FOI-request platform. This proposal tests whether item extraction can preserve multipart scope; the research does not establish its present frequency or time cost. [Evidence and gaps](../research/domain-public-sector-education.gpt.md)

## Why not a prompt fix

A conjunction-based splitter and explicit scope rules are baselines. An adapter benefit remains a hypothesis for nested requests and shared date qualifiers, with the evaluated prompt frozen.

## Mubit loop

1. Extract requested items through Mubit with fixed instructions, model and schema.
2. Correct a split that mistakenly applies one date range to all requested records.
3. Ingest the approved target via the confirmed adapter path and show the new version record.
4. Compare provider and adapter on held-out request templates in fresh sessions, without correction history; score missing items, duplicated items and incorrect scope assignments against human targets.

## Demo (≤ 3 min)

1. 0–45 s: display a multipart request and the wrong scope assignment.
2. 45–100 s: fix the item list and show update lineage.
3. 100–170 s: test an unseen wording and reveal the full held-out error table.

## Build

- Original request fixtures, Python/Mubit backend, item-list editor and a source-span comparison view.
- **Cut line:** Text-only extraction, one reviewed batch and console comparisons.

## Risks

- Synthetic requests omit real-world ambiguity → identify the prototype's data limits.
- The system drops an item while improving another → count omissions separately and keep the original request visible.
