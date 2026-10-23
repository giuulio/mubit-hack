# Schema-drift SQL assistant

> Analysts ask questions of a database in plain English; when the schema changes, failing queries and analyst fixes become corrections, so the adapter is refreshed for the new schema while the old one keeps serving.

- **Author:** Claude (Claude Code, Opus 5.5) · **Date:** 2026-10-23
- **Track:** 3 Fast refresh (also 2: small adapter vs frontier model on cost and latency)
- **User:** Analysts and ops staff querying an internal database many times a day.
- **Task:** question + schema summary → SQL (JSON `{sql, tables_used}`) for one database.
- **Corrections:** Partly automatic: the query is executed; SQL errors (unknown column or table) and empty or implausible results are failures; the analyst's fixed SQL is the corrected output. Gold queries in a test set give exact checks.
- **Data:** A synthetic SQLite database (shop or ticketing schema) with 100+ generated question/SQL pairs, or Spider/BIRD-style public sets (licences to check). A Ratchet entrant got 821 teacher-labelled text-to-SQL rows for ~$3 ([hackathon-winners-model-centric](../research/hackathon-winners-model-centric.claude.md)).
- **Assumes:** Mubit accepts corrected outputs and retrains when the input distribution changes; schema text in the system prompt would split the task, so the schema must go in the user message ([mubit-platform](../research/mubit-platform.claude.md)).
- **Update latency:** Execution feedback is instant; adapter retraining time is unknown, so the refresh step is likely pre-recorded.

## Problem

Schema migrations break assistants silently. In CL-Bench's database task, a stateless baseline's reward fell from 0.247 to 0.057 after a mid-run migration (Mubit's own write-up) ([mubit-ecosystem](../research/mubit-ecosystem.claude.md)). Retrieval narrows but does not close recency gaps ([drift-and-fast-refresh](../research/drift-and-fast-refresh.claude.md)).

## Why not a prompt fix

The schema text can be updated in the prompt, but the learned mapping from the team's vocabulary ("active customer", "churned") to columns and joins lives in past corrections, and much of it changes with a migration. Each refresh would need someone to rewrite those rules.

## Mubit loop

1. App calls the model via Mubit with a fixed system prompt; schema summary + question in the user message; `metadata.user_id` = analyst.
2. Executor runs the SQL; errors or analyst edits are sent as the correction for that request ID.
3. Mubit trains an adapter on the kept examples; after a migration, new corrections drive a new version, promoted only when it beats the provider model.
4. Metric: execution accuracy on held-out questions before and after migration, for provider, old adapter and refreshed adapter; cost and p50 latency per query.

## Demo (≤ 3 min)

1. (30 s) Ask five questions; correct SQL, adapter-backed.
2. (30 s) Run a migration live (rename `customers` → `accounts`, split `status`).
3. (40 s) Same questions fail; analyst fixes two; corrections appear in the Mubit console.
4. (50 s) Refreshed adapter version: accuracy chart pre- and post-migration (pre-recorded training).
5. (30 s) Cost and latency vs the frontier model.

## Build

- SQLite demo DB and migration script; question generator (frontier model, synthetic data); executor with checks; small web UI.
- Evaluator over the gold set before and after migration.
- **Cut line:** CLI only, one migration, accuracy table.

## Risks

- Adapter may lag the migration for longer than the demo → pre-record the refresh and show timestamps.
- Synthetic questions too easy → include joins, date ranges and business vocabulary.
- Overlap with Mubit's own CL-Bench story → frame as weight-level refresh, not memory.
