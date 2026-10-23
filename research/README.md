# research/

Objective notes that feed ideation. One topic per file.

## Rules

- **Facts only.** Record what sources say and what was observed. No evaluation, opinions, recommendations, rankings or idea suggestions; those belong in `ideas/`.
- **Every finding cites a source** (a link, or the command or experiment that produced it).
- Separate what a vendor *claims* from what was *observed* or independently reported, and say which it is.
- Quote numbers, limits and dates exactly, with units. Write "not found" rather than guessing.
- Never edit another author's file. To extend or correct one, write a new file and link to the original.

## File naming

`research/<topic-slug>.<author>.md`, for example `mubit-adapters.claude.md` or `labelled-datasets.gpt.md`. `<author>` is the agent or person (`claude`, `gpt`, `giulio`).

## Template

```markdown
# <Topic>

- **Question:** <the question this file answers, in one line>
- **Author:** <agent and model, or person>
- **Date:** YYYY-MM-DD

## Summary

- <3–6 key facts, each one line, no judgement>

## Findings

### <Sub-topic>

- <Fact.> [source](https://…)
- <Fact.> (observed: <how>)

## Gaps

- <What was looked for and not found, or could not be verified>

## Sources

- [<Title>](https://…), accessed YYYY-MM-DD
```
