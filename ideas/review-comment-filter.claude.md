# Review comment filter

> Teams using AI code review get each bot comment scored keep/drop for their repo before it is posted; every comment developers resolve or dismiss is a correction, so the filter learns what that team finds useful.

- **Author:** Claude (Claude Code, Opus 5.5) · **Date:** 2026-10-23
- **Track:** 1 Recurring tasks
- **User:** Teams running review bots (Copilot, CodeRabbit, Greptile, Cursor BugBot); every pull request, many comments each ([domain-software-engineering](../research/domain-software-engineering.claude.md)).
- **Task:** diff hunk + candidate review comment → JSON `{keep: bool, category, reason}`.
- **Corrections:** Mostly automatic: on GitHub, a thread resolved after a code change = useful; resolved with no change, or left open at merge = not useful. Developers can also mark 👍/👎.
- **Data:** Public PRs with bot review threads via the GitHub API (needs a token; 60 requests/hour unauthenticated). The 54,791-comment study shows such data exist at scale ([domain-software-engineering](../research/domain-software-engineering.claude.md)). Synthetic diffs plus comments as backup.
- **Assumes:** Mubit can take a label or corrected output for a recorded call (or a Bad rating) into adapter training; not confirmed ([mubit-platform](../research/mubit-platform.claude.md)).
- **Update latency:** Unknown. GitHub signals arrive when threads are resolved (minutes to days); for the demo, replay historic threads in order.

## Problem

Review bots are noisy: reviewers accepted 8.1% (Mozilla) and 7.2% (Ubisoft) of AI comments, and 24 of 37 said review took longer; Greptile's own audit found 79% of its comments were nits. Incorrect suggestions are the top reason comments go unresolved ([domain-software-engineering](../research/domain-software-engineering.claude.md)).

## Why not a prompt fix

"Useful" is team-specific (some want nits, some ban them; design comments matter to core developers more than to others), and it shifts with the codebase. Thousands of resolved/dismissed threads carry this preference; a prompt can hold a few rules.

## Mubit loop

1. A GitHub App intercepts the bot's comments and calls the filter via Mubit; fixed system prompt; `metadata.user_id` = repo, so held-out tests are by repo.
2. A webhook on thread resolution (or merge) labels the earlier call keep/drop and sends it to Mubit as the correction for that request ID.
3. After 25+ kept labelled examples, Mubit trains the filter adapter and tests it against the provider model.
4. Metric: precision of posted comments (share later resolved with a code change) and comments suppressed per PR, provider vs adapter.

## Demo (≤ 3 min)

1. (30 s) A PR in our demo repo receives eight bot comments; three are nits the team dismisses.
2. (40 s) Webhook fires; Mubit console shows the labelled calls under one task.
3. (60 s) Replay 100 historic threads: precision curve as labels accumulate; adapter version passes the test against the provider (pre-recorded).
4. (50 s) Next PR: only the comments the team would act on get posted; cost per 1,000 comments.

## Build

- GitHub App (webhooks for review comments and thread resolution), filter service calling Mubit, label back-fill script for historic PRs.
- Replay evaluator and a small precision dashboard.
- **Cut line:** offline replay on mined threads only, no live GitHub App.

## Risks

- Resolution is a weak label (people resolve to clear the queue) → require a later commit touching the same lines to count as useful.
- GraphQL rate limits and token needs → mine a fixed set of repos the night before.
- Public PR content goes to Mubit → limit to public repositories, which is allowed under AGENTS.md.
