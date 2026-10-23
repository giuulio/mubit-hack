# Night Shift London — event & Mubit notes

Collected 23 Oct 2026 from Luma, the Mubit Discord, mubit.ai and docs.mubit.ai. Where Discord and Luma disagree, Discord (Max) wins — it is newer.

## Event

- **Where:** WeWork, 9th floor, 30 Churchill Pl, Canary Wharf, London E14 5RE
- **When:** Fri 23 Oct 17:00 → Sun 25 Oct 14:00. Hacking starts Fri 19:30.
- **Clocks go back** Sun 02:00 → 01:00.

### Deadlines (Discord / Max)

| When | What |
| --- | --- |
| Fri 19:30 | Coding may start (no code before this) |
| Sat by 12:00 | Check-in 1 (`/checkin`) |
| Sat 12:00–18:00 | Check-in 2 (`/checkin`) |
| Sat 20:00 | Submissions open (`/submit`); aim to submit by midnight |
| **Sun 05:00** | **Code freeze — hard deadline for code and submissions** |
| Sun 10:30 | Judging round 1 (expo) |
| Sun 12:30 | Finalist demos on stage |
| Sun 13:30 | Awards |

Luma says code freeze is Sun 10:00; Max's rules say 05:00. Plan for 05:00. Late check-ins count until the freeze. Resubmitting is allowed; the latest counts.

### Submission

- Upload only: **video (MP4/MOV, ≤ 3 min)** + **PDF deck**. No YouTube links.
- Repo URL is captured at `/team create`.

### Rules

- All project code written during the event. OSS libraries and personal tooling are fine.
- **Every LLM call must route through Mubit.** Closed models are fine. Image/video models (e.g. GPT Image, Seedance) are called directly — Mubit only proxies LLM APIs.
- Teams of 1–4; at least one member present at Sunday demos to win. 18+, in person.

### Max (the event's AI on Discord)

- `/team create <name> <repo>` → join code; teammates `/team join <code>`; everyone `/team accept`.
- Talk to Max by DM or in the team's `#max` channel (no @ needed). Team `#chat` is private from Max.
- Max posts feedback on check-ins in `#max`.

### Prizes

- $15K / $10K / $5K cash (top 3, judged across all tracks) + $35K AI credits
- $10K+ extra prizes announced on launch day; winners get an interview with the co-founders
- $1.5M Mubit credits across accepted hackers
- Mubit is hiring and will invite people met at the event to interview

### Tracks

1. **Recurring tasks** — turn corrections into model updates for a repeated task
2. **Own your intelligence layer** — move a closed-model workload to a task-adapted open model; compare quality, cost, latency
3. **Fast refresh** — keep model updates current for changing workloads

### Judging (equal weight)

- **Use of Mubit** — a correction becomes a model update *in the demo*
- **Usefulness** — a real recurring task
- **Technical execution** — works, holds up under questions
- **Demo** — clear, live, within time

### Side quests

- **#1 Model Card:** `/upload you@email` in Discord, then upload Claude Code (`~/.claude/projects/`) or Codex (`~/.codex/sessions/`) JSONL logs. Mubit emails a model card. Post on X (@MubitLabs) + LinkedIn, drop links in `#modelcards`. One entry per person. A subset of logs is fine. Prizes: Switch 2, $100, $25 Mubit credits.
- Staff hinted that sessions created during Night Shift feed a separate, unannounced quest.

### Launched today

- **Banyan Sapling** — open-weight model that verifies claims against policies/evidence and abstains when evidence is insufficient: https://huggingface.co/MubitLabs/banyan-sapling
- **Latte Bench** — benchmark of whether models improve from feedback across attempts: https://github.com/MubitLabs/latte-bench

## Mubit

### What it is

A proxy in front of OpenAI / Anthropic / Gemini. Swap the base URL and use a Mubit key (`mbt_…`); model IDs stay the same. Mubit records every call, groups calls into **tasks**, and trains an **adapter** (small task-specific model) per task once it has enough kept examples (default **25**). Each adapter version is tested against the provider model's answers; passing versions can be compared in the console's **Try models**.

- Console: https://app.mubit.ai (Requests, Tasks, Adapters, Try models, Provider keys, Connect)
- API: https://api.mubit.ai — server-side only (no CORS)
- Account invites arrive by email at the start of the event.

### Base URLs

| SDK | Base URL |
| --- | --- |
| Anthropic | `https://api.mubit.ai/anthropic` (no `/v1`) |
| OpenAI | `https://api.mubit.ai/openai/v1` |
| Gemini (google-genai) | `https://api.mubit.ai/gemini` (no `/v1beta`) |
| OpenAI SDK on Gemini | `https://api.mubit.ai/gemini/v1beta/openai` |
| OpenRouter / Groq / Together / Mistral | `https://api.mubit.ai/compat/{service}/v1` |

Send only the Mubit key (`x-api-key` or `Authorization: Bearer` for Anthropic). Any other credential alongside it → `401`. Unset `ANTHROPIC_API_KEY` / `ANTHROPIC_AUTH_TOKEN` if they hold something else.

```python
import os
from anthropic import Anthropic

client = Anthropic(base_url="https://api.mubit.ai/anthropic", api_key=os.environ["MUBIT_API_KEY"])
```

### What makes a task

Calls share a task when they share **instructions (system prompt), tools, tool choice, output format and model**. Messages, temperature, max_tokens don't count. Numbers, dates and IDs in the instructions don't split a task; other changing words do — keep per-call variation in the user message.

Sessions come from `metadata.user_id` (Anthropic) or `metadata.session_id` / `thread_id` / `conversation_id` (OpenAI). Test cases are held out by session.

You cannot call an adapter by model ID; compare it in Try models.

### Useful headers

- `x-middleware-record: full | metadata | off` — how much of a call Mubit keeps
- Response `x-middleware-request-id` (`mreq_…`) — quote it when asking for help

### Other

- Starter credit serves a fixed model list (e.g. `gpt-6-luna`); otherwise add your own provider key in the console.
- Claude Code / Codex / Gemini CLI / Aider can route through Mubit (docs: guides/claude-code). Claude Code needs an Anthropic API key in the console, not a Pro/Max login.
- Import past calls from Langfuse, Braintrust, Pydantic Logfire.
- Pricing: $5 per 1,000 runs (run = ≤ 8K tokens), no token markup.

### Open question: corrections

Judging needs "a correction becomes a model update", but the public docs don't explain how corrections/rules reach an adapter. Only a `Rating` column in Requests and "grading" are mentioned. An unanswered #support thread asks: how to write a correction/rule (API or console), whether a Bad rating removes a call from training, whether one adapter version can be called directly, and whether a deterministic check can replace the grading model. **Ask the Mubit team early.**

### Docs

- Index: https://docs.mubit.ai/llms.txt — append `.md` to any docs path for markdown
- Full dump: https://docs.mubit.ai/llms-full.txt
- Links on mubit.ai/llms.txt and the agent-skills SKILL.md (`/getting-started`, `/sdk/…`, `/patterns/…`) are stale and 404.
