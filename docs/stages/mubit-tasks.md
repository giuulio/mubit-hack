# Observation: how Mubit grouped Icon Master's calls

- **Purpose:** Record what the Mubit console showed for Icon Master's training calls, because it corrects an assumption in [models and contexts](contexts.md) and affects the [demo](../demo-icon-master.md).
- **Author:** Claude (Claude Code) with Giulio · **Date:** 2026-10-24, 23:00 BST
- **Status:** Observed in the console (project `giulio-s-org-1792839718071602875`); cause unconfirmed.

## What the console showed

| Time (BST) | Task | Status | Kept | Requests |
| --- | --- | --- | --- | --- |
| 22:35 | Design icons | Reviewing examples; reviewer "40 new calls, 0 kept, 0 rejected" (about 18:50) | 0 | 40 (Smooth batch, 19:12) |
| 23:00 | Design icons | **Training v1**; reviewer "0 new calls, 18 kept, 2 rejected" (about 22:50) | **38** | 40 |
| 23:00 | **Design icons 2** | Reviewing examples | 0 | 80 (Pixel and Duotone batches, 22:44–22:45) |

The project's overview showed 160 requests in 24 hours, 0 routed under task rules and 0 adapters serving.

## What it corrects

[contexts.md](contexts.md) assumed every context of a model feeds one Mubit task because they share the system prompt, tools, output format and model. Mubit put the Pixel and Duotone calls in a second task. Every batch used the same system prompt, model and `max_tokens`; the user messages differ: Smooth's carry example icons, Pixel's and Duotone's carry only rules. So a Hone model can currently map to more than one Mubit task, each with its own adapter.

## Consequences

- Smooth's adapter (v1) learns from Smooth's 38 kept calls only; Pixel and Duotone wait for their own task's review and training.
- The shared-weights claim holds within a Mubit task, not across the two today. The demo should say "Mubit trains an adapter per task" and show both tasks.

## Next

- Ask Mubit staff whether the grouping uses the user message or the replies, and whether two tasks can be merged.
- Test: give every context the same user-message shape (for example an empty "Example icons" section) and see whether new calls join one task.
