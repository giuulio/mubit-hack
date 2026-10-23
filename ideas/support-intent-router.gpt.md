# Support intent router

> A support lead corrects misrouted requests and tests whether the next task adapter routes unseen requests more accurately.

- **Author:** gpt (GPT-6) · **Date:** 2026-10-23
- **Track:** 1 Recurring tasks
- **User:** Support operations staff reviewing the intent assigned to each incoming request.
- **Task:** One fixed system prompt maps a request to `{"intent": "..."}` from a fixed intent list; only request text varies.
- **Corrections:** A reviewer replaces the intent; public dataset labels can reveal a wrong answer automatically, but approved corrections remain explicit.
- **Data:** Within one hour, sample 40 training and 40 held-out BANKING77 requests across eight related intents, preserve labels and attribution, and split by source row. CC BY 4.0; [dataset details](../research/domain-customer-support.gpt.md).
- **Assumes:** Mubit staff confirm how approved replacement labels enter adapter training, what makes an example kept, and how a particular updated adapter is identified in Try models; [unresolved platform details](../research/mubit-platform.claude.md).
- **Update latency:** Unknown. Record correction, job and adapter-ready times; show the live correction and a timestamped recording of an earlier real update if training exceeds the demo window.

## Problem

Intent detection is an intermediate support step whose mistakes can affect later actions; public intent data supply repeatable reference labels. [Support research](../research/domain-customer-support.gpt.md)

## Why not a prompt fix

A clearer label definition may solve a confusion. Compare that prompt baseline separately; the adapter hypothesis is transfer from corrected borderline examples, with the evaluated prompt frozen.

## Mubit loop

1. Classify training requests through the server-side Mubit proxy, keeping prompt, model, tools and schema fixed.
2. Show a misclassification and save the reviewer-approved label with the original request identifier.
3. Use the staff-confirmed correction path and show the resulting adapter/version record; memory lessons alone do not count as an update.
4. Compare provider and updated adapter in Try models on the same held-out requests in new sessions, without correction examples in context; report accuracy and the confusion matrix.

## Demo (≤ 3 min)

1. 0–40 s: show two confusable requests and their reference labels.
2. 40–90 s: correct one result and show its path into the update record.
3. 90–165 s: compare unseen requests and display measured results, timestamps and unresolved failures.

## Build

- Python backend, Mubit-compatible SDK, CSV sampler, SQLite correction log and a small browser review screen.
- **Cut line:** Eight intents, one corrected batch and a reproducible console comparison.

## Risks

- Dataset labels differ from a team's real queues → state the benchmark scope.
- No measured gain or no confirmed correction ingestion → report that outcome; do not present changed prompts or retrieval as adapter learning.
