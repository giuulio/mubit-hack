# AML alert triage

> Compliance analysts get every transaction-monitoring alert pre-dispositioned (escalate or close, with a rationale citing the evidence); each analyst decision is a correction, moving a high-volume frontier-model workload onto a cheaper task adapter.

- **Author:** Claude (Claude Code, Opus 5.5) · **Date:** 2026-10-23
- **Track:** 2 Own your intelligence layer
- **User:** Level 1 AML analysts at banks and fintechs; vendor estimates put review at 30–45 min per alert, with 85–99% of alerts false positives ([domain-finance-accounting](../research/domain-finance-accounting.claude.md)).
- **Task:** alert (rule hit) + customer profile + 90-day transactions → JSON `{disposition: escalate|close, reasons[], evidence_ids[]}`.
- **Corrections:** Automatic as part of the job: the analyst's final disposition and edited rationale are recorded for every alert.
- **Data:** Synthetic only: generate customers, transactions and rule hits with planted typologies (structuring, rapid movement, mule patterns) and gold dispositions. Public synthetic AML sets (e.g. AMLSim-style) are an option once licences are checked.
- **Assumes:** Mubit accepts analyst dispositions as corrections, and Mubit routes traffic to the adapter "only when it does better" (homepage claim) ([mubit-platform](../research/mubit-platform.claude.md)).
- **Update latency:** Dispositions arrive within minutes of each review; adapter training time unknown.

## Problem

Rule-based monitoring floods analysts: a bank with 1,000 alerts/day at 30–45 min each spends up to ~700 analyst hours a day (vendor estimate). LLM-only triage scored PR-AUC 0.52 / F1 0.41, below classical ML, and improved only with evidence-grounded workflows; five zero-shot models' false-positive rates on the same legitimate cases ranged from 0.3% to 83% ([domain-finance-accounting](../research/domain-finance-accounting.claude.md)).

## Why not a prompt fix

What counts as suspicious depends on the institution's risk appetite, customer base and past decisions; that knowledge sits in thousands of analyst dispositions. At this volume, cost and latency also favour a small adapter over a frontier model ([task-specific-small-models](../research/task-specific-small-models.claude.md)).

## Mubit loop

1. Triage service calls a frontier model via Mubit with a fixed system prompt; alert bundle in the user message; `metadata.user_id` = analyst team.
2. Analyst decision and edited rationale are sent as the correction for that request ID.
3. Mubit trains the triage adapter after 25+ kept examples and tests it against the provider model; passing versions compared in Try models.
4. Metrics: escalation recall (must stay at 100% on planted typologies), false-escalation rate, cost per 1,000 alerts and p50 latency, provider vs adapter.

## Demo (≤ 3 min)

1. (30 s) Queue of 40 synthetic alerts; frontier model pre-dispositions them.
2. (40 s) Analyst overrides five (closes a payroll pattern, escalates a mule chain); console shows corrections.
3. (60 s) Held-out replay: recall and false-escalation rate, provider vs adapter (pre-recorded training).
4. (50 s) Cost and latency table for 1,000 alerts; rationale cites evidence IDs.

## Build

- Synthetic data generator with planted typologies; analyst review UI; triage service via Mubit.
- Evaluator with recall guard and cost/latency logging.
- **Cut line:** CLI queue, 100 alerts, metrics table.

## Risks

- Domain realism questioned by judges → base typologies on published AML red flags and say they are synthetic.
- An adapter that misses escalations is unacceptable → gate promotion on 100% recall of planted cases.
- Regulators expect explainability → require evidence IDs in every output.
