# Commit messages in house style

> Developers get commit messages drafted from their staged diff; every edit they make before committing becomes a correction, so the team's adapter converges on its own conventions.

- **Author:** Claude (Claude Code, Opus 5.5) · **Date:** 2026-10-23
- **Track:** 1 Recurring tasks
- **User:** Any developer; GitHub reports ~1 billion commits in 2025 ([domain-software-engineering](../research/domain-software-engineering.claude.md)). Each developer commits several times a day.
- **Task:** staged diff (+ branch name) → commit message as JSON `{subject, body}` in the team's format.
- **Corrections:** Automatic: a `prepare-commit-msg` hook inserts the draft; a `post-commit` hook diffs the draft against the message actually committed. Unedited = accepted; edited = corrected output.
- **Data:** Seed with the history of a public, permissively licensed repo (diff + human message pairs from `git log -p`, hundreds in minutes) or our own hackathon repo. CommitBench (1.66M commits) is CC BY-NC 4.0, so treat it as reference only ([domain-software-engineering](../research/domain-software-engineering.claude.md)).
- **Assumes:** Mubit can take a corrected output for a recorded call and use it in the next adapter version, or a Bad rating removes the draft from training. Neither is confirmed ([mubit-platform](../research/mubit-platform.claude.md)).
- **Update latency:** Unknown; time from the 25th kept example to a passing adapter is not documented. Correction capture is live; the adapter switch is probably pre-recorded.

## Problem

Generic models write generic messages; teams have unwritten conventions (scopes, ticket prefixes, tense, what goes in the body). Developers then fix drafts by hand, and the fixes are thrown away.

## Why not a prompt fix

Conventions are mostly tacit and differ by repo and by area of the codebase; the corrections themselves are the only complete specification. Edits are high-quality training signal: user edits work as SFT targets, preference pairs and edit-distance reward ([learning-from-feedback](../research/learning-from-feedback.claude.md)).

## Mubit loop

1. Hook calls the model through the Mubit proxy with a fixed system prompt; the diff goes in the user message; `metadata.user_id` = developer, so test cases are held out by developer.
2. `post-commit` sends the committed message as the correction for that request ID (`x-middleware-request-id`), or rates the draft Bad if only ratings exist.
3. After 25+ kept examples Mubit trains a task adapter and tests it against the provider model.
4. Metric: normalised edit distance between draft and committed message on held-out commits, provider model vs adapter, plus cost and latency per draft.

## Demo (≤ 3 min)

1. (20 s) Stage a diff; hook drafts a generic message; edit it to house style; commit.
2. (40 s) Show the Mubit console: the task, the request, the correction attached.
3. (60 s) Replay 20 held-out diffs: edit-distance chart, provider model vs adapter (pre-recorded training run).
4. (40 s) New diff, adapter-backed draft needs no edits; cost per 1,000 drafts.

## Build

- Git hooks (shell + Python), a small CLI that calls Mubit (Anthropic or OpenAI SDK), a script to mine seed pairs from `git log`.
- Replay evaluator with edit-distance metric; one-page results view.
- **Cut line:** hooks + replay script on one repo, with the adapter compared in Mubit's Try models.

## Risks

- Seed history uses a different style from our demo edits → seed from the same repo we demo on.
- Adapter cannot be called by model ID, so a live adapter-backed draft may be impossible → show the comparison in Try models or rely on Mubit's own switch-over.
- Committed messages may include secrets or personal names → use public repos and synthetic commits only.
