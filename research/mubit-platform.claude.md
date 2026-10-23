# Mubit platform

- **Question:** How does Mubit work today (proxy, tasks, adapters, corrections, APIs, limits), as far as public sources show?
- **Author:** Claude (Claude Code, Opus 5.5)
- **Date:** 2026-10-23

## Summary

- Mubit currently has two product surfaces: an **LLM proxy** that groups calls into tasks and trains per-task adapters (launched 2026-10-23), and an older **memory and lessons SDK** (`mubit-sdk`, last release 2026-09-03) that injects distilled lessons into prompts without changing weights.
- In the proxy, a task is defined by model, instructions, tools, tool choice and output format; an adapter trains per task once it has enough kept examples (default 25, per HACKATHON.md) and each version is tested against the provider model's answers.
- The homepage claims a dedicated model replaces the current one "only when it performs better", that earlier versions stay available for rollback, and that users own what is built.
- No public source found explains how a correction or rating reaches an adapter. The SDK has a fully documented correction path (`run.outcome(good=False, label="corrected_by_user")` → server distils a lesson "a few seconds later"), but it targets lessons in memory, not adapters.
- docs.mubit.ai and api.mubit.ai could not be opened from this environment (network policy); docs facts below come from HACKATHON.md, search-engine summaries of docs pages, and the SDK source on PyPI.

## Findings

### Positioning (vendor claims)

- Homepage headline: "Reliable agents. A model for every task." Mubit "calibrates every call at runtime, then builds and refreshes a dedicated model for each task your agents repeat, switching over only when it does better"; frontier models stay in use. [mubit.ai](https://mubit.ai/) (search summary; page not opened)
- Homepage workflow: connect the runtime → capture traces and outcomes → generate candidate improvements → test before rollout; earlier versions kept for rollback; "you own what gets built". [mubit.ai](https://mubit.ai/) (search summary)
- The Banyan model family is "built on open-source and open-weight bases and trained through Mubit using task experience and evaluated outcomes". [mubit.ai](https://mubit.ai/) (search summary)
- A Digg post dated 2026-10-23 is titled "Mubit announces platform for agents' recurring tasks, Banyan Sapling and latte/bench" and says the poster offered $100 credits to commenters and a free first month to enterprises. [Digg](https://digg.com/ai/96i9loxr) (search summary)

### Proxy: calls, tasks, adapters

- Swap the SDK base URL and use a Mubit key (`mbt_…`); model IDs unchanged. Base URLs: Anthropic `https://api.mubit.ai/anthropic`, OpenAI `https://api.mubit.ai/openai/v1`, Gemini `https://api.mubit.ai/gemini`, OpenAI-on-Gemini `…/gemini/v1beta/openai`, OpenRouter/Groq/Together/Mistral `…/compat/{service}/v1`. [HACKATHON.md](../HACKATHON.md); docs home confirms the Anthropic URL has no `/v1` and says to use the base URL on the console's Connect page. [docs.mubit.ai](https://docs.mubit.ai/) (search summary)
- Sending any other credential alongside the Mubit key returns `401`. [HACKATHON.md](../HACKATHON.md)
- Task identity = instructions (system prompt), tools, tool choice, output format, model. Messages, temperature and max_tokens do not count; numbers, dates and IDs in instructions do not split a task, other changing words do. [HACKATHON.md](../HACKATHON.md); [docs.mubit.ai](https://docs.mubit.ai/) (search summary confirms the five fields)
- Sessions come from `metadata.user_id` (Anthropic) or `metadata.session_id` / `thread_id` / `conversation_id` (OpenAI); test cases are held out by session. [HACKATHON.md](../HACKATHON.md)
- Adapter training starts per task at a default of **25** kept examples; each version is tested against the provider model's answers; passing versions can be compared in the console's **Try models**. An adapter cannot be called by model ID. [HACKATHON.md](../HACKATHON.md); [docs.mubit.ai](https://docs.mubit.ai/) (search summary)
- Console sections: Requests, Tasks, Adapters, Try models, Provider keys, Connect. API is server-side only (no CORS). [HACKATHON.md](../HACKATHON.md)
- Headers: request `x-middleware-record: full | metadata | off`; response `x-middleware-request-id` (`mreq_…`). [HACKATHON.md](../HACKATHON.md)
- Pricing: $5 per 1,000 runs (run = ≤ 8K tokens), no token markup. Starter credit serves a fixed model list (for example `gpt-6-luna`); otherwise add a provider key. [HACKATHON.md](../HACKATHON.md)
- Imports from Langfuse, Braintrust and Pydantic Logfire; Claude Code, Codex, Gemini CLI and Aider can route through Mubit (Claude Code needs an Anthropic API key, not a Pro/Max login). [HACKATHON.md](../HACKATHON.md)
- Latte Bench's README configures `MUBIT_BASE_URL=https://api.mubit.ai/openai/v1/` and a `MUBIT_EXTRA_BODY` variable for "documented gateway-specific fields", and warns that "provider-side memory, routing and weight updates remain outside this benchmark's control" and "gateway-side memory is not reset". (observed: `README.md` of [MubitLabs/latte-bench](https://github.com/MubitLabs/latte-bench) at commit `3828bd8`, 2026-10-21)

### Corrections and ratings (the open question)

- Requests has a `Rating` column and the docs mention "grading"; nothing public says how a correction or rule reaches an adapter, whether a Bad rating removes a call from training, whether one adapter version can be called directly, or whether a deterministic check can replace the grading model. An unanswered #support thread asks these. [HACKATHON.md](../HACKATHON.md)
- Search restricted to docs.mubit.ai for "rating", "feedback", "correction", "kept examples" and "grading" returned no page describing them. (observed: three searches, 2026-10-23)
- The homepage's "capture traces and outcomes" step implies outcome signals feed candidate generation; the mechanism is not described. [mubit.ai](https://mubit.ai/) (search summary)

### Memory and lessons SDK (`mubit-sdk`)

- PyPI `mubit-sdk`: stable 0.13.2 (2026-08-09), pre-release 0.14.0rc1 (2026-09-03); npm `@mubit-ai/sdk` same versions. Description: "run-scoped memory and continual learning for AI agents". (observed: `https://pypi.org/pypi/mubit-sdk/json`, `https://registry.npmjs.org/@mubit-ai%2fsdk`)
- HACKATHON.md notes that `/sdk/…` docs links are stale and 404, so it is unknown whether this SDK is still supported alongside the proxy. [HACKATHON.md](../HACKATHON.md)
- Quickstart: `mubit.init(agent=…)` patches `openai`, `anthropic`, `litellm` and `google-genai`; inside `with mubit.run("…") as run:` a user correction followed by `run.outcome(good=False, label="corrected_by_user")` makes the server "distil a lesson a few seconds later"; a later run injects the lesson into the system message when the last user message is related "by wording or by meaning". (observed: SDK README in the 0.14.0rc1 sdist)
- Lessons have statuses `pending`, `active`, `rejected`, `retired`; types include `preference`; scopes run → session → global, promoted by the server over time. (observed: SDK README; [docs changelog](https://docs.mubit.ai/changelog) and [agent-memory-skill recipe](https://docs.mubit.ai/recipes/agent-memory-skill), search summaries)
- `run.outcome` / `step.outcome` accept `good` (bool), `score` (−1..1), `label`, `rationale`, `verified_in_production`. (observed: `src/mubit/_loop.py`)
- HTTP routes in the SDK include `/v2/loop/{capabilities,context,events,lessons,policy,policy/promote,proposals,snapshots,kill,jobs,runs,transitions,audit,skills}`, `/v2/control/{ingest,outcome,reflect,lessons,query,step_outcome,skills/optimize}` and `/v2/core/{memory,search,session,acl/keys}`; default endpoint `https://api.mubit.ai`, gRPC first with HTTP fallback. (observed: grep of SDK source)
- The SDK also exposes prompt management: `control.set_prompt`, `control.optimize_prompt`, `control.activate_prompt_version`. (observed: SDK README)
- No string `adapter`, `fine-tune` or `x-middleware` appears in the SDK source except one unrelated `run_adapter` event source. (observed: grep)
- `recall` in `agent_routed` mode runs two server-side model calls (several seconds each); `direct_bypass` with `evidence_only=True` returns "in well under 200 ms". (observed: SDK README) The docs recipe quotes 30–250 ms vs 4–9 s. [agent-memory-skill](https://docs.mubit.ai/recipes/agent-memory-skill) (search summary)
- Changelog: Runtime/SDKs v0.11.0 on 2026-07-15 enabled seven continual-learning features by default on hosted instances; v0.12.0 on 2026-07-16 is the latest entry seen. [docs changelog](https://docs.mubit.ai/changelog) (search summary)

## Gaps

- How a correction, rating or rule reaches an adapter: not found.
- How long adapter training takes after the 25th kept example, and what "kept" means: not found.
- What the grading model is and whether it can be replaced: not found.
- Whether `mubit-sdk` works against the current api.mubit.ai or with the proxy: not verified (no key; host blocked).
- `x-middleware-record` and `MUBIT_EXTRA_BODY` field documentation: not found by search.
- docs.mubit.ai/llms.txt and llms-full.txt were not read: the environment's network policy blocks docs.mubit.ai, mubit.ai and api.mubit.ai.

## Sources

- [HACKATHON.md](../HACKATHON.md) (team notes from Luma, Discord and docs), accessed 2026-10-23
- [mubit.ai](https://mubit.ai/) via web search summary, accessed 2026-10-23
- [docs.mubit.ai](https://docs.mubit.ai/), [changelog](https://docs.mubit.ai/changelog), [agent-memory-skill](https://docs.mubit.ai/recipes/agent-memory-skill) via web search summaries, accessed 2026-10-23
- [mubit-sdk on PyPI](https://pypi.org/project/mubit-sdk/) 0.14.0rc1 sdist, source read locally, accessed 2026-10-23
- [@mubit-ai/sdk on npm](https://www.npmjs.com/package/@mubit-ai/sdk), accessed 2026-10-23
- [MubitLabs/latte-bench](https://github.com/MubitLabs/latte-bench) README, accessed 2026-10-23
- [Digg post](https://digg.com/ai/96i9loxr) via web search summary, accessed 2026-10-23
