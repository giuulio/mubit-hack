# Stage: models and contexts

- **Purpose:** Let one fine-tuned model serve several looks (smooth, sharp, pixel icons) and keep its shared weights clean. Extends the [lesson router](../../ARCHITECTURE.md) and the [routing](routing.md) policy.
- **Author:** Claude (Claude Code) with the team · **Date:** 2026-10-24
- **Status:** Implemented in `router/store.py`, `router/pipeline.py`, `router/route.py`, `router/extract.py`, the API and the interface. Checked live on a scratch model; the measured reach signal below is still to do.

## Model and context

| Thing | Is | Holds |
| --- | --- | --- |
| Model | One Mubit task: one fixed system prompt (`… Project: <name>.`) and one provider model | Kept calls, adapter versions, the model-wide lessons |
| Context | One look the model serves; its rules, examples and notes go in the **user message** | Its own lessons, examples, outputs, token history, evaluations, comparisons, adapter imports |

Mubit groups calls into a task by system prompt, tools, output format and model; per-call variation belongs in the user message ([HACKATHON.md](../../HACKATHON.md), "What makes a task"). So every context of a model feeds the same task, and their kept calls train one shared adapter. A model's name is in its system prompt and cannot change; a context's name is in no prompt and can.

## The routing rule

Each lesson has a **reach**: `context` (it belongs to one look) or `model` (it holds in every context: what makes any icon correct, clear or well built).

- The weights are shared, so only a `model` lesson may be routed **A∧B** or **B**.
- A `context` lesson that is stable and effective routes **A** and stays in its context, however costly; training it would pull every other context towards this one's look.
- Examples and notes are always `context`. Everything else before the reach check is unchanged: notes, parameters, temporary lessons and rephrase come first.

Extraction proposes the reach (the model's contexts are listed in its user message) and the user confirms it before routing, as with stability. Model-wide lessons appear in every context's prompt; token history is recorded for each context a change touches.

## Storage and API

- `projects/<id>/project.json` still holds one model. It gains `contexts: [{id, name, created, archived?}]`; per-context records carry `context`; `imports` is `{context: {config: items}}`. Files written before contexts are normalised on load into one context (`context_name`, or "Default"); nothing is rewritten until the next save.
- Calls that run in a context take `context` (body or query); without it they use the model's first context, so older clients and the CLI keep working.
- New: `POST /api/projects/{id}/contexts` (add), `POST /api/projects/{id}/contexts/{cid}` (rename, archive, restore; the last context stays), `POST /api/projects/{id}/archive` (archive or restore a model), `context` on `POST /api/projects`.
- CLI: `python -m router context <model> [name]`, `--context` on generate, feedback, train, message, import and eval, `--reach` on confirm.
- Archiving is a soft delete: the file stays in git, and the Mubit task and kept calls stay on Mubit, which has no delete API.

## Checks (2026-10-24)

- Hone icons, Smooth: the Try-models message in bare, routed and full modes is byte-identical to the code before contexts, and the system prompt is unchanged, so its 40 kept calls stay in the same task.
- Scratch model with Soft and Pixel: a direction in Soft split into two `model` lessons (16 px legibility, one idea) and three `context` ones (round joins and caps, corner radii). After routing, Pixel's prompt carries the model-wide rule and none of Soft's parameters.
- Policy cases (`route()`): `context` lessons at 40 and 300 tokens route A; `model` lessons route A∧B and B; ineffective lessons route rephrase either way.

## Open

- **Measured reach.** Reach comes from extraction plus the user. A measured signal would test a lesson in the model's other contexts and ask a judge whether it conflicts with their rules.
- **Existing Hone icons lessons** keep the routes they were given before this rule: they have no reach, count as `context`, and three Weights examples and seven Both rules remain routed to the weights. Re-routing them under the rule changes the demo's numbers, so it waits for a team decision.
- **Keyed contexts.** Putting the context's name in the user message would let the adapter learn each look under its own key, so costly context lessons could retire too. It changes the message of every kept call, so it is a later experiment.
