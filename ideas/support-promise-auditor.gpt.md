# Support promise auditor

> A support QA reviewer corrects which promises a draft reply can make, then tests the updated model on fresh policy edge cases.

- **Author:** gpt (GPT-6) · **Date:** 2026-10-23
- **Track:** 1 Recurring tasks
- **User:** Support QA staff reviewing refund and replacement promises before replies are sent.
- **Task:** A fixed prompt takes a fictional policy, order facts and draft reply in the user message; it returns `{"status":"supported|unsupported|uncertain","promise_span":"...","evidence":"..."}`.
- **Corrections:** A reviewer changes the status and evidence span; no automatic training approval follows a thumbs-down.
- **Data:** Write 40 training and 20 held-out synthetic cases within an hour from an original policy table: damaged goods, missing delivery, exceptions and insufficient evidence. Original text can be released under CC0; [QA workflow evidence](../research/domain-customer-support.gpt.md).
- **Assumes:** Mubit confirms corrected structured outputs can become kept examples and exposes an identifiable adapter update; neither correction ingestion nor deterministic grading support is established. [Platform research](../research/mubit-platform.claude.md)
- **Update latency:** Unknown; measure it. Show live review and actual console state, using a labelled recording of a completed update if the wait exceeds three minutes.

## Problem

Support teams already inspect outputs and apply market-specific QA; Canva reports reviewing 20–100 production cases weekly. This proposal tests promise checking on synthetic cases. [Evidence](../research/domain-customer-support.gpt.md)

## Why not a prompt fix

An explicit exception rule may suffice. Compare a revised-prompt and a deterministic policy-table baseline; an adapter benefit remains a hypothesis for paraphrased and ambiguous promises.

## Mubit loop

1. Send each synthetic case through Mubit with fixed instructions, schema and model.
2. Correct a promise labelled supported despite missing eligibility evidence, retaining both outputs.
3. Use only the confirmed adapter-training route and record the new version; keep evidence in the user input rather than teaching changing policy facts as permanent truth.
4. Compare provider and adapter on held-out orders in fresh sessions, without correction history; measure unsupported-promise misses and unnecessary rejections.

## Demo (≤ 3 min)

1. 0–45 s: inspect a reply promising a refund before an eligibility condition is established.
2. 45–100 s: correct the evidence judgement and show update lineage.
3. 100–170 s: test a paraphrase and a valid exception, then reveal held-out results.

## Build

- Original policy fixtures, Python/Mubit backend, structured-output validator and a side-by-side review UI.
- **Cut line:** One policy, three output statuses and one recorded adapter update.

## Risks

- Policy rules already solve the task → show baseline results without claiming a learning advantage.
- Staff cannot confirm the adapter path → leave the model-update claim unmade; a correction ledger alone does not complete the loop.
