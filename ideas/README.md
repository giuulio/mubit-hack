# ideas/

Project ideas for Night Shift, one per file, all in the same format so they can be compared side by side.

## Rules

- Follow the template exactly: same headings, same order, every field filled. Write "unknown" rather than leaving a field out.
- Every idea is built around **one repeated LLM task** (a fixed system prompt, varying input) whose outputs can be corrected, because Mubit groups calls into tasks and judging needs a correction to become a model update in the demo.
- Link facts to files in `research/` or to sources. Keep each section short; the whole file should read in under two minutes.
- The score is the author's own estimate. Reviewers record theirs in a new line under it rather than overwriting.
- Never edit another author's idea except to add a review score line.

## File naming

`ideas/<idea-slug>.<author>.md`, for example `invoice-coder.claude.md`. `<author>` is the agent or person (`claude`, `gpt`, `giulio`).

## Template

```markdown
# <Idea name>

> <One-sentence pitch: who gets what, and how it improves from corrections.>

- **Author:** <agent and model, or person> · **Date:** YYYY-MM-DD
- **Track:** <1 Recurring tasks | 2 Own your intelligence layer | 3 Fast refresh>
- **User:** <who has this task today, and how often>
- **Task:** <the single repeated LLM call: input → output>
- **Corrections:** <where corrections or ground truth come from, and whether they arrive automatically>
- **Data:** <how we get 25+ examples within an hour; links to research/>

## Problem

<2–3 lines: the pain today, with evidence.>

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

## Score

| Use of Mubit | Usefulness | Execution | Demo | Feasibility | Total /25 |
| --- | --- | --- | --- | --- | --- |
| x/5 | x/5 | x/5 | x/5 | x/5 | xx |

<One line per score: why.>
```
