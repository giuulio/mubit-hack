# AGENTS.md

Guidance for AI agents (Claude Code, Codex and others) working in this repo. It is a living document: refine it as the project takes shape.

## Context

This repo is our entry for Night Shift London, Mubit's hackathon (23–25 Oct 2026). [HACKATHON.md](HACKATHON.md) holds the event facts, deadlines, judging criteria and Mubit API notes. Read it before planning or building anything.

Hard constraints:

- Every LLM call routes through Mubit (base URLs in HACKATHON.md). Image and video model calls go direct.
- All project code is written during the event, from Fri 23 Oct 19:30.
- Code freeze is **Sun 25 Oct 05:00 (Europe/London)**. Submission is a ≤ 3 min video plus a PDF deck.
- The judges score a live correction becoming a model update. Anything we build must make that loop visible.
- The repo is private on purpose. Never change its visibility, publish its contents or share links to it.

## Repo layout

| Path | Purpose |
| --- | --- |
| `HACKATHON.md` | Event and Mubit reference |
| `research/` | Objective research notes. Format: [research/README.md](research/README.md) |
| `ideas/` | Project ideas, one per file. Format: [ideas/README.md](ideas/README.md) |
| `AGENTS.md` | This file |

Code layout is to be decided once an idea is chosen; record it here when it is.

## Writing conventions

- Markdown: one line per paragraph and per bullet. Never hard-wrap at a column width.
- British English for prose, docs and code comments (organise, behaviour, colour).
- American English for code: identifiers, API fields, string keys, file names, CLI flags (`color`, `normalize`).
- Be concise. Prefer bullets and tables to long paragraphs.
- Dates as `YYYY-MM-DD`; times in Europe/London.

## Working conventions

- Mubit docs: start from https://docs.mubit.ai/llms.txt and append `.md` to any docs path. Links on mubit.ai and its agent-skills SKILL.md are stale and 404.
- Secrets live in environment variables (`MUBIT_API_KEY` and so on). Never commit keys or `.env` files, and never print them in logs or output.
- Mubit records request and reply content by default, so send synthetic or public data only.
- Agents running in parallel work on their own branch, only create or edit their own files, and never edit another agent's research or idea file; add a new file instead. Topic assignments are in [research/README.md](research/README.md).
- Shared files (`AGENTS.md`, `HACKATHON.md`, `README.md`, the folder READMEs) change only when a human asks.
- When a batch of work is done (for example, all your research files), push it to `main`: `git fetch origin main`, `git rebase origin/main`, then `git push origin HEAD:main`. Never force-push `main`. If you can only open pull requests, open one against `main` instead.
- Commits are small, with an imperative subject line.
