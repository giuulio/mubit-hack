# MTD expense categoriser

> UK sole traders and landlords now filing quarterly under Making Tax Digital get each bank transaction mapped to an HMRC self-employment category; every re-categorisation teaches their own adapter how their business spends.

- **Author:** Claude (Claude Code, Opus 5.5) · **Date:** 2026-10-23
- **Track:** 1 Recurring tasks
- **User:** ~864,000 sole traders and landlords over £50,000 qualifying income, in scope since April 2026; thresholds drop to £30,000 (2027) and £20,000 (2028). Every transaction, reviewed quarterly ([domain-finance-accounting](../research/domain-finance-accounting.claude.md)).
- **Task:** transaction (description, amount, date, counterparty) + business type → JSON `{hmrc_category, allowable: yes|no|partial, confidence}`.
- **Corrections:** The user or their bookkeeper re-categorises in the review screen; accepted suggestions count as confirmations. Arrives during normal quarterly review.
- **Data:** Synthetic: no open labelled bank-transaction dataset was found ([domain-finance-accounting](../research/domain-finance-accounting.claude.md)). Generate 300 realistic UK bank lines for three personas (café, plumber, landlord) with gold labels; 25+ corrections in minutes through the UI.
- **Assumes:** Mubit can take a corrected label for a recorded call into training; per-user adapters need separate tasks, which Mubit may not support (one task per system prompt) ([mubit-platform](../research/mubit-platform.claude.md)).
- **Update latency:** Corrections are captured instantly; adapter retraining time is unknown.

## Problem

General LLMs do poorly here: zero-shot GPT-4o scored ~60% vs ~73% for a fine-tuned classifier on SME bank transactions, and an LLM matched expert labels 80% of the time, failing on rare and ambiguous categories. The study names missing company-specific history as the cause ([domain-finance-accounting](../research/domain-finance-accounting.claude.md)).

## Why not a prompt fix

The mapping is merchant- and business-specific ("Tesco" is stock for a café, groceries for a plumber; "Screwfix" is materials for one, tools capital for another). Hundreds of such pairs per user would bloat any prompt; corrections are the natural data.

## Mubit loop

1. App calls the model via Mubit with one fixed system prompt; persona/business type and transaction go in the user message; `metadata.user_id` = business.
2. Re-categorisation sends the corrected JSON as the correction for that request ID.
3. After 25+ kept examples, Mubit trains the categoriser adapter and tests it against the provider model.
4. Metric: accuracy on held-out transactions per persona, provider vs adapter; corrections needed per 100 transactions; cost per quarter's review.

## Demo (≤ 3 min)

1. (30 s) Import a café owner's synthetic quarter; model categorises 60 lines.
2. (40 s) Owner fixes eight (Tesco → cost of goods; Uber Eats fee → selling costs); console shows corrections on the task.
3. (60 s) Held-out replay: accuracy climbs from provider baseline to adapter (pre-recorded training).
4. (50 s) Next quarter: fewer corrections; quarterly summary totals ready for submission (no real HMRC call).

## Build

- Synthetic data generator (frontier model, three personas, gold labels); review UI (web, one page); categoriser service via Mubit.
- Evaluator and corrections-per-100 metric.
- **Cut line:** one persona, CLI review, accuracy table.

## Risks

- Real bank data must not go to Mubit → synthetic only, stated on screen.
- Tax-category rules may be misstated → use HMRC's published SA103 box names and avoid tax advice claims.
- Per-user adapters may not be possible → one shared adapter with business type in the input.
