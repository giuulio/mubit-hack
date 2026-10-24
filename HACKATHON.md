# Night Shift London — event & Mubit notes

Collected 2026-10-23 from Luma, the Mubit Discord, mubit.ai and docs.mubit.ai; updated 2026-10-24 from the logged-in Discord channels, Luma and current public docs. Where Discord and Luma disagree, Discord (Max) wins — it is newer. All event times are Europe/London.

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
- The [official team instructions](https://discord.com/channels/1531252044885921872/1562531784523120760/1562532028610642052) explicitly request a **public GitHub repo**. This conflicts with our private-repo constraint: obtain an organiser-approved arrangement; do not change visibility or share this repo's link without a human changing that instruction.

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

### Access and redeeming credits (checked 2026-10-24)

- **Mubit access:** find the email titled **“Early Access”**, including spam/junk. Eldar says this email grants platform access; missing or late-added invites should be raised with Eldar/the organisers. No public redemption code or self-service claim link was found in the event channels or Luma. [Staff reply](https://discord.com/channels/1531252044885921872/1531279500715888731/threads/1563248599947812964)
- **Mubit allocation:** $1.5M is the total across accepted hackers, not a verified per-person entitlement. A participant reports $25 starter credit, but their question about using it despite the Connect page's provider-key warning remains unanswered; neither a universal amount nor a top-up procedure was confirmed. Use the starter-credit models listed in the console or add a provider key as documented. [Unanswered access question](https://discord.com/channels/1531252044885921872/1531279500715888731/threads/1563447108432830494)
- **OpenAI early bird:** the **first 50 accepted hackers get $50 in OpenAI API credits at check-in**. Ask the check-in desk to fulfil the offer if eligible. This is separate from Mubit starter credit and the $35K prize-credit pool. Luma does not give a redemption URL/code, expiry or a list of other sponsor credits. [Luma](https://luma.com/nightshift-london)

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

- **#1 Model Card:** `/upload your@email.com` in Discord using your own email, then upload Claude Code (`~/.claude/projects/`) or Codex (`~/.codex/sessions/`) JSONL logs. Mubit emails a model card describing the model the data would train and repeated patterns that could become a model or skill. Post on X (@MubitLabs) + LinkedIn (tag Mubit), then drop both links in `#modelcards`. Registered Night Shift hackers only; one entry per person. A subset of logs is fine. Max reviews entries against internal criteria. Prizes: Nintendo Switch 2, $100, $25 Mubit inference credits. The organiser says API keys and secrets are redacted before processing and never stored; this is an organiser claim, not a security test.
- **The Policy Challenge (Banyan Sapling):** announced 2026-10-24 at 02:16 BST; **extended to 2026-10-24 at 14:00 BST**, replacing 10:30, in Eldar's 10:42 announcement. Every registered team may enter once; the main project or a side build counts. Prize: Nintendo Switch 2; winner announced at Sunday's awards. Judged on the best use case: Sapling must do substantive work on realistic input; likes do not count. Post the task and a demo video (≤ 2 min) or screenshots on both X (@MubitLabs) and LinkedIn (tag Mubit), then submit the team name, one-line task, both post links and repo link in `#side-quests` by the deadline. Our private-repo constraint still applies; this announcement does not authorise publishing this repo or sharing its link. [Extension](https://discord.com/channels/1531252044885921872/1531279845365907478/1563487817911504957)
- Staff hinted that sessions created during Night Shift feed a separate, unannounced quest.

### Launched 2026-10-23

- **Banyan Sapling** — open-weight model that verifies claims against policies/evidence and abstains when evidence is insufficient: https://huggingface.co/MubitLabs/banyan-sapling
- **Sapling API quickstart (organiser attachment read 2026-10-24):** POST JSON `{"inputs":{"policy":"...","evidence":"...","claim":"..."}}` with `Content-Type: application/json`, no authentication, to `https://6adbee0669a00298cd4774c9.endpoints.huggingface.cloud`; [playground](https://huggingface.co/spaces/MubitLabs/banyan-sapling-demo). All three fields must be nonempty; combined limit **16,384 tokens**, rejected rather than truncated. Reply contains `status`, `raw_label`, `prediction_set`, `probabilities` and `timing_ms`. Statuses include the four labels plus `unsure`, which should go to a human. It returns labels/scores, **no explanations or external source checks**; accuracy varies by domain. No inference was performed in this review. This is the organiser's side-quest endpoint; main-project routing compatibility is still unconfirmed. [Quickstart attachment](https://discord.com/channels/1531252044885921872/1531279845365907478/1563359526315499644)
- **Latte Bench** — benchmark of whether models improve from feedback across attempts: https://github.com/MubitLabs/latte-bench

## Mubit

### What it is

A proxy in front of OpenAI / Anthropic / Gemini. Swap the base URL and use a Mubit key (`mbt_…`); model IDs stay the same. Mubit records every call, groups calls into **tasks**, and trains an **adapter** (small task-specific model) per task once it has enough kept examples (default **25**). Each adapter version is tested against the provider model's answers; passing versions can be compared in the console's **Try models**.

- Console: https://app.mubit.ai (Requests, Tasks, Adapters, Try models, Provider keys, Connect)
- API: https://api.mubit.ai — server-side only (no CORS)
- Account invites arrive by email at the start of the event; search for **“Early Access”**.

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
- `x-middleware-store: false` — keeps metadata without request/reply content; `x-middleware-record: metadata` is equivalent. Use for evaluation calls that must not become training examples. [API reference](https://docs.mubit.ai/reference/api)
- Response `x-middleware-request-id` (`mreq_…`) — quote it when asking for help
- The console's **Request** ID under **Details** differs from the `mreq_…` header ID; do not assume an internal console endpoint accepts the header ID. [Requests guide](https://docs.mubit.ai/guides/requests)

### Other

- Starter credit serves a fixed model list (e.g. `gpt-6-luna`); otherwise add your own provider key in the console.
- Claude Code / Codex / Gemini CLI / Aider can route through Mubit (docs: guides/claude-code). Claude Code needs an Anthropic API key in the console, not a Pro/Max login.
- Import past calls from Langfuse, Braintrust, Pydantic Logfire.
- Pricing: $5 per 1,000 runs (run = ≤ 8K tokens), no token markup.

### Corrections and adapter access (staff Q&A)

Eldar answered the original support thread on **2026-10-23 at 20:44 BST**; it is no longer unanswered. [Staff reply](https://discord.com/channels/1531252044885921872/1563250824082231380/1563276986393305238)

- Corrections are made in the console; **no corrections API** and no switch to disable one for a single call. Try models adds only the task's instructions to the supplied message.
- **A Bad rating does not remove a call from training.** Exclude a call at request time with `x-middleware-record: metadata`.
- **No direct adapter/version model ID:** the only supported place to run one is Try models. Read-only keys read project records and cannot make calls.
- Internal grading measures agreement with provider answers; **teams cannot select a different grading check**. Separate external evaluation remains possible, but does not replace the internal promotion test.

The precise path from a replacement answer/correction to changed weights is still not specified by that reply. A [2026-10-24 follow-up](https://discord.com/channels/1531252044885921872/1531279500715888731/threads/1563447108432830494) asks whether corrections change training or only supplied instructions, and whether app-plus-Try-models is an acceptable judged demo; no reply was visible when checked. Do not infer that a Bad comment is a supervised target or that a local feedback ledger proves a model update.

The [first-adapter guide](https://docs.mubit.ai/guides/first-adapter) confirms training must be enabled, calls are not necessarily kept, and daily limits or pauses can delay training. Failed training needs new examples; there is no retry button. A passing version becomes available in Try models, whose comparisons train nothing. A `Prompt only` result means the prompted base model did as well as the adapter. No fixed correction-to-update time is promised.

### Observed support issues (2026-10-24)

- Shankha acknowledged update-related downtime at 03:19 BST; later said the reported embedding-service warning was unrelated. At 10:29 a participant still reported seven failed jobs with `adapter job queue unavailable`; no resolution was visible. These are attributed reports, not an independent platform-health test. [Thread](https://discord.com/channels/1531252044885921872/1531279500715888731/threads/1563373882465984672)
- Another participant reported a two-hour training stall at 10:10; Eldar replied “On it!” at 10:19. Daily review-limit increase requests were also unanswered. Build the demo around a completed, timestamped update rather than assuming a fixed live training duration. [Training task](https://discord.com/channels/1531252044885921872/1531279500715888731/threads/1563479790768357486), [limits](https://discord.com/channels/1531252044885921872/1531279500715888731/threads/1563364928604078140)

### Docs

- Index: https://docs.mubit.ai/llms.txt — append `.md` to any docs path for markdown
- Full dump: https://docs.mubit.ai/llms-full.txt
- Links on mubit.ai/llms.txt and the agent-skills SKILL.md (`/getting-started`, `/sdk/…`, `/patterns/…`) are stale and 404.
