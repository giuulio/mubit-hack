# NDA playbook triage

> In-house lawyers get each incoming NDA clause classified against their playbook (accept, redline or escalate) with a suggested redline; every lawyer decision or edit is a correction, so the adapter learns the team's actual positions.

- **Author:** Claude (Claude Code, Opus 5.5) · **Date:** 2026-10-23
- **Track:** 1 Recurring tasks
- **User:** In-house legal teams; NDAs are reported as 25–35% of in-house contracts, and one 12-lawyer firm reported 15–20 NDAs a week at ~2 hours each ([domain-legal-compliance](../research/domain-legal-compliance.claude.md)).
- **Task:** clause text + clause type + one-page playbook → JSON `{position: accept|redline|escalate, playbook_rule, redline}`.
- **Corrections:** The lawyer accepts, changes the position or edits the redline in the review screen; captured as part of normal review.
- **Data:** ContractNLI (~607 NDAs, CC BY 4.0 reported) and CUAD (510 contracts, 41 clause types, CC BY 4.0) supply public clauses; a synthetic playbook defines gold positions. 25+ clause decisions take minutes ([domain-legal-compliance](../research/domain-legal-compliance.claude.md)).
- **Assumes:** Mubit accepts corrected outputs for recorded calls. Putting the playbook in the system prompt fixes the task; changing the playbook would start a new task ([mubit-platform](../research/mubit-platform.claude.md)).
- **Update latency:** Corrections are instant; adapter training time unknown.

## Problem

Sources describe the playbook as the main accuracy lever, and hard cases as clauses whose meaning depends on facts outside the document; no vendor publishes independent accuracy benchmarks. Sales expects NDAs back in 3–5 days while legal aims for 1–2 ([domain-legal-compliance](../research/domain-legal-compliance.claude.md)).

## Why not a prompt fix

Written playbooks are short; the real positions (which carve-outs are fine for which counterparties, how far to push on term or non-solicit) live in lawyers' past decisions. Corrections capture the unwritten part.

## Mubit loop

1. Review tool splits the NDA into clauses and calls the model via Mubit per clause; playbook fixed in the system prompt; `metadata.user_id` = matter.
2. Lawyer decision and redline edit are sent as the correction for that request ID.
3. After 25+ kept examples, Mubit trains the triage adapter and tests it against the provider model.
4. Metric: agreement with lawyer positions on held-out NDAs, redline edit distance, minutes per NDA (simulated), provider vs adapter.

## Demo (≤ 3 min)

1. (30 s) Upload a public NDA; 14 clauses triaged.
2. (40 s) Lawyer flips two (mutual term accepted for suppliers; residuals clause escalated) and edits one redline; console shows corrections.
3. (60 s) Held-out replay on 20 NDAs: agreement and edit-distance charts (pre-recorded training).
4. (50 s) New NDA: adapter matches the lawyer's positions; Banyan Sapling-style "insufficient information" for clauses outside the playbook.

## Build

- Clause splitter (CUAD/ContractNLI clause boundaries), synthetic playbook, review UI, triage service via Mubit.
- Evaluator over held-out NDAs.
- **Cut line:** clause list in a CLI, one playbook, agreement table.

## Risks

- Gold positions are our own synthetic playbook, not a real firm's → say so; use clause types CUAD already labels.
- Legal-advice concerns → position the tool as triage for lawyer review.
- Clause splitting errors → use CUAD's annotated spans for the demo set.
