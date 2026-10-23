# ideas/

Project ideas for Night Shift, one per file, all in the same format so they can be compared side by side. The team chooses; agents describe.

## Rules

- Follow the template exactly: same headings, same order, every field filled. Write "unknown" rather than leaving a field out.
- Every idea is built around **one repeated LLM task** (a fixed system prompt, varying input) whose outputs can be corrected, because Mubit groups calls into tasks and judging needs a correction to become a model update in the demo.
- **No scores, rankings or recommendations**, within a file or across files. Describe the idea plainly; don't sell it.
- Link facts to files in `research/` or to sources. Keep each section short; the whole file should read in under two minutes.
- Data must be public or synthetic, because Mubit records request and reply content.
- Never edit another author's idea.

## Who writes what

- Write ideas after your research is pushed. Pull `main` first and read every file in `research/`, including the other agent's.
- Draw mainly on your own domain files (see [research/README.md](../research/README.md)). Ideas that cut across domains are open to both authors.
- Before writing an idea, check `ideas/` on `main` for one built on the same task. If it exists, write a different idea instead.
- Aim for 6–8 ideas per agent.

## File naming

`ideas/<idea-slug>.<author>.md`, for example `invoice-coder.claude.md`. `<author>` is the agent or person (`claude`, `gpt`, `giulio`).

## Template

```markdown
# <Idea name>

> <One-sentence pitch: who gets what, and how it improves from corrections.>

- **Author:** <agent and model, or person> · **Date:** YYYY-MM-DD
- **Track:** <1 Recurring tasks | 2 Own your intelligence layer | 3 Fast refresh>
- **User:** <who has this task today, and how often>
- **Task:** <the single repeated LLM call: input → output, and the output format>
- **Corrections:** <where corrections or ground truth come from, and whether they arrive automatically>
- **Data:** <how we get 25+ examples within an hour; public or synthetic, and licence; links to research/>
- **Assumes:** <Mubit behaviour the idea depends on that is not yet confirmed, or "nothing unconfirmed">
- **Update latency:** <time from a correction to a visible adapter update, and whether the demo shows it live or pre-recorded>

## Problem

<2–3 lines: the pain today, with evidence.>

## Why not a prompt fix

<1–2 lines: why editing the system prompt would not absorb these corrections as well as an adapter does.>

## Mubit loop

1. <Call goes through Mubit>
2. <How a correction is captured>
3. <How it becomes an adapter update>
4. <What improves, and the metric that shows it>

## Demo (≤ 3 min)

1. <Beat, with roughly the seconds it takes>
2. <…>

## Build

- <Main components and stack, roughly in build order>
- **Cut line:** <the smallest version that still demos the loop>

## Risks

- <Risk> → <mitigation>
```
