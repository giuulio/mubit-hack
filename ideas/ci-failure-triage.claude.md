# CI failure triage

> Engineers get every failed CI test labelled flaky, real or infrastructure, with a likely cause; the CI system itself supplies the corrections (a retry that passes with no code change is flaky), so the adapter improves without anyone labelling.

- **Author:** Claude (Claude Code, Opus 5.5) · **Date:** 2026-10-23
- **Track:** 1 Recurring tasks (3 Fast refresh if the codebase changes mid-demo)
- **User:** Developers and on-call build engineers; every red CI run on every push.
- **Task:** failing test name + test source + failure log excerpt → JSON `{category: flaky|real|infra, cause, confidence}`; causes follow FlakyCat-style classes (async wait, concurrency, order dependency, time, network, randomness).
- **Corrections:** Automatic: the CI retries a failed test; pass on retry with the same commit ⇒ `flaky`; fails again and a later commit touching the code under test fixes it ⇒ `real`; runner or network errors ⇒ `infra`. Engineers can override in the PR.
- **Data:** IDoFT / FlakyCat labelled flaky tests and C-IDoFT (54,468 unit tests from 57 projects) for seeding; licences not yet checked ([domain-software-engineering](../research/domain-software-engineering.claude.md)). A demo repo with deliberately flaky tests (sleep races, order dependence, random seeds) gives 25+ live failures in minutes.
- **Assumes:** Mubit accepts a label for a recorded call, or a Bad rating removes wrong answers from training; not confirmed ([mubit-platform](../research/mubit-platform.claude.md)).
- **Update latency:** Retry labels arrive within one CI run (minutes); adapter training time after 25 examples is unknown.

## Problem

Flaky tests waste CI time and erode trust in red builds. General LLMs classifying flakiness from test code alone were only marginally better than random on IDoFT and FlakeBench, while fine-tuned models reached high accuracy in an ICST 2025 comparison ([domain-software-engineering](../research/domain-software-engineering.claude.md)).

## Why not a prompt fix

The deciding features are repo-specific (which fixtures are slow, which services time out, which tests share state) and change as the code changes. Retry outcomes provide hundreds of free labels a week; a prompt cannot absorb them.

## Mubit loop

1. A CI step (GitHub Actions) posts each failure to the triage service, which calls the model via Mubit with a fixed system prompt; `metadata.user_id` = repo.
2. The retry job's result back-fills the label and sends it to Mubit as the correction for that request ID.
3. After 25+ kept labelled failures, Mubit trains the task adapter and tests it against the provider model.
4. Metric: accuracy and flaky-recall on held-out failures, provider vs adapter; CI minutes saved by not retrying real failures.

## Demo (≤ 3 min)

1. (30 s) Push to the demo repo; six tests fail; the provider model mislabels two order-dependent tests as real.
2. (40 s) Retries pass; labels flow to Mubit; console shows the task with corrections.
3. (60 s) Replay 100 failures: accuracy curve, provider vs adapter (pre-recorded training).
4. (50 s) Next push: adapter-quality labels, a PR comment naming the flaky cause, cost per 1,000 failures.

## Build

- Demo repo with seeded flaky tests; GitHub Actions workflow with retry; triage service calling Mubit; label back-fill.
- Replay evaluator over IDoFT/FlakyCat samples plus our live failures.
- **Cut line:** local runner (pytest with retries) and replay only, no GitHub integration.

## Risks

- Retry-pass is noisy (some real bugs are intermittent) → treat "passed on retry twice" as flaky, allow engineer override.
- Dataset licences unclear → use our own synthetic flaky repo for anything sent to Mubit.
- Failures cluster in few tests → vary seeded causes so 25 examples cover all classes.
