# Mubit ecosystem

- **Question:** What has Mubit (MubitLabs) published or done publicly: models, benchmarks, repos, company facts and past events?
- **Author:** Claude (Claude Code, Opus 5.5)
- **Date:** 2026-10-23

## Summary

- Mubit launched three things on 2026-10-23: the recurring-task platform (proxy and adapters), the **Banyan Sapling** verification model, and the **latte/bench** benchmark. [Digg](https://digg.com/ai/96i9loxr) (search summary)
- Banyan Sapling: Qwen3-30B-A3B-Instruct-2507, pruned to 96 experts per layer, attention LoRA plus a verification head; four labels; Apache 2.0 weights; abstains on most hard cases (779 of 1,731 answered). [model card](https://huggingface.co/MubitLabs/banyan-sapling) (search summary)
- latte/bench tests whether models improve a simulated latte pour across attempts using their own notes; only GPT-6 Astra passed (5/15 with notes, 2/15 without) and the authors state results "do not establish learning or transfer". (observed: repo)
- `mubit-ai/mubit-cl-bench` (MIT, 2026-08-23) is Mubit's self-reported submission to CL-Bench, claiming the top three leaderboard places with its memory product and 83.5% fewer input tokens than in-context replay. (observed: repo; vendor claim)
- Company: founded November 2025, Aberdeen, Scotland; founders reported as Anil Peri and Shankha Dutta; Hoxton Ventures is a confirmed investor. [Dealroom](https://app.dealroom.co/companies/mubit), [Hoxton Ventures](https://hoxtonventures.com/portfolio/mubit/) (search summaries)

## Findings

### Banyan Sapling (model)

- "Research preview", first model in the Banyan family; judges whether a claim holds against a supplied policy and evidence. [model card](https://huggingface.co/MubitLabs/banyan-sapling) (search summary)
- Base `Qwen3-30B-A3B-Instruct-2507`; pruned MoE backbone keeping 96 experts per layer; attention LoRA plus a verification head producing four class logits. [model card](https://huggingface.co/MubitLabs/banyan-sapling) (search summary)
- Labels: `supported`, `violation`, `insufficient_information`, `inconsistent_context`. Output exposes the preferred class and calibrated uncertainty. [model card](https://huggingface.co/MubitLabs/banyan-sapling) (search summary)
- Inputs capped at 16,384 encoded tokens; evaluated in English only; retrieval and source authentication are left to the surrounding workflow. [model card](https://huggingface.co/MubitLabs/banyan-sapling) (search summary)
- Reported evaluation: 94.22% raw accuracy on 1,731 cases; calibrated output answers 779 cases, all matching reference labels, and leaves 952 unresolved; 0 false `supported` decisions calibrated vs 14 raw. The card says real-world accuracy is not established. [model card](https://huggingface.co/MubitLabs/banyan-sapling), [Digg](https://digg.com/ai/96i9loxr) (search summaries; vendor-reported)
- Licence: weights Apache 2.0 (Qwen attribution retained); bundled code MIT. [model card](https://huggingface.co/MubitLabs/banyan-sapling) (search summary)

### latte/bench (benchmark)

- Repo [MubitLabs/latte-bench](https://github.com/MubitLabs/latte-bench), last commit 2026-10-21 by Anil Peri; JavaScript (Bun) simulator with Python report scripts; 346 files. (observed: shallow clone)
- Task: a model returns `{"parameters": [33 numbers]}` in [0,1] (strict JSON Schema) describing a pour; a 32×32 foam simulator scores shape overlap, contour fit and concavity, 0–100. Up to two format corrections per attempt. (observed: README)
- Memory ablations: `no-notes`, `raw-history`, `notes` (model writes a ≤ 4,000-character replacement note after each attempt), and a CMA-ES `optimizer` baseline. (observed: README)
- Multi-model study (`latte-bench-v0.7-multimodel-freeze`): 12 model routes, 330 valid pours, conservative cost $116.29 of a $500 cap. GPT-6 Astra: 2/15 passes no-notes, 5/15 with notes; every other route 0 passes; GPT-5.5 Pro produced no valid plan within a 4,096-token output limit (cost $86.17). (observed: `docs/model-study/methodology.md`)
- Selected mean best scores (no-notes → notes): Claude Opus 5.5 38.8 → 67.0; GPT-6.1 Sol 71.8 → 76.9; GPT-6 Astra 78.7 → 74.7; GPT-6 Luna 38.6 → 42.3. (observed: same file)
- Authors' stated limits: "Notes help some models, but not all; these results do not establish learning or transfer"; "neither mode changes model weights"; gateway-side memory is not reset between conditions. (observed: README)
- Runs route through `https://api.mubit.ai/openai/v1/` (`MUBIT_BASE_URL`), with optional `MUBIT_EXTRA_BODY` for gateway-specific fields. (observed: README)

### mubit-cl-bench (memory product benchmark)

- Repo [mubit-ai/mubit-cl-bench](https://github.com/mubit-ai/mubit-cl-bench), MIT, last commit 2026-08-23 by "Shankha"; plugs Mubit into [CL-Bench](https://github.com/pgasawa/continual-learning-bench) as `ContinualLearningSystem` subclasses using `mubit-sdk`. (observed: clone)
- Claimed results (vendor, self-run): Mubit with Gemini 3.7 Flash +0.255 aggregate reward (rank 1), Gemini 3.5 Flash +0.238, Gemini 3.1 Pro +0.230; best non-Mubit entry ICL · Claude Sonnet 4.6 +0.196; Mem0 · GPT-5.4 +0.148; ACE · GPT-5.4 +0.066. (observed: README)
- Claimed token use: GPT-5.4 full suite 7.2M input tokens with Mubit vs 43.4M with in-context replay (−83.5%) at similar reward (+0.190 vs +0.189). (observed: README)
- Claimed drift result: on CL-Bench's database task with a mid-run schema migration, the stateless Gemini 3.7 baseline falls 0.247 → 0.057 while Mubit goes 0.203 → 0.155. (observed: README)
- Mechanism: retrieve top-k lessons before each action and inject them into the prompt; after each instance distil "prompt + action + outcome" into a lesson via `remember(intent="lesson")`. (observed: README)
- Six CL-Bench tasks: sales prediction, blind spectrum monitoring, cohort studies, codebase adaptation, exploitable poker, database exploration. (observed: README)

### Other public output

- `mubit-sdk` (PyPI) and `@mubit-ai/sdk` (npm), 0.13.2 stable (2026-08-09), 0.14.0rc1 (2026-09-03); README links `github.com/mubit-ai/ricedb`, which is not publicly accessible. (observed: registries; `add_repo` refused access)
- A Claude Code skill installs into `.claude/skills/mubit-memory` for cross-session memory with a non-LLM retrieval path by default. [agent-memory-skill](https://docs.mubit.ai/recipes/agent-memory-skill) (search summary)
- Docs changelog shows SDK and runtime releases through v0.12.0 on 2026-07-16, including "learn loop closed in the JavaScript and Rust SDKs" (June 2026) and reranking by default (Runtime v0.7.0). [changelog](https://docs.mubit.ai/changelog) (search summary)
- The memory product is described as a four-step loop: Write, Retrieve, Reflect, Reinforce. [Dealroom](https://app.dealroom.co/companies/mubit), [Simplify](https://simplify.jobs/c/Mubit) (search summaries)

### Company

- Founded November 2025; headquartered in Aberdeen, Scotland; founders Shankha Dutta and Anil Peri per Dealroom; Hoxton Ventures and Nordic9 list Anil Peri. [Dealroom](https://app.dealroom.co/companies/mubit), [Hoxton Ventures](https://hoxtonventures.com/portfolio/mubit/), [Beacon Stone](https://beaconstonevc.com/company/mubit) (search summaries)
- Funding: Dealroom reports a seed of about $2.1M with Hoxton Ventures and Heavybit; Hoxton is confirmed by its portfolio page; Heavybit published an article on agent memory ("Long-Horizon Agents, Part 2: Memory Is More than Recall") that describes Mubit's learning loop. [Dealroom](https://app.dealroom.co/companies/mubit), [Heavybit](https://www.heavybit.com/library/article/long-horizon-agents-part-2-memory-is-more-than-recall) (search summaries)
- Anil Peri's site describes him as building "the continual learning infrastructure for AI agents". [anilperi.me](https://anilperi.me/) (search summary)
- Hiring: "Founding Engineer" listing on Ashby. [Ashby](https://jobs.ashbyhq.com/mubit/77a5ea32-5012-4073-b9a8-c53642a940b1) (search summary)

### Events

- Night Shift London (this event): Luma lists "42 hours, 500 builders", $65K prizes ($15K / $10K / $5K) plus $1.5M Mubit credits. [Luma](https://luma.com/nightshift-london) (search summary)
- Mubit is listed as a sponsor of an OpenAI-run London hackathon and of the {Tech: Europe} London Hackathon (LinkedIn posts by Eldar Utiushev, who lists Mubit on his profile), and of Pop the Bubble (Hackhouse London, 5–7 June 2026). [LinkedIn](https://www.linkedin.com/in/eldaru/), [Pop the Bubble](https://www.popthebubblehack.co.uk/) (search summaries)
- No previous Mubit-run hackathon or list of Mubit prize winners was found.

## Gaps

- Hugging Face model card not opened directly (huggingface.co blocked); figures come from search summaries.
- MubitLabs GitHub org repo list: not found (api.github.com blocked; search returned nothing).
- Founders' roles and Eldar Utiushev's role: not confirmed.
- Winners of earlier Mubit-sponsored events: not found.

## Sources

- [MubitLabs/latte-bench](https://github.com/MubitLabs/latte-bench), cloned 2026-10-23
- [mubit-ai/mubit-cl-bench](https://github.com/mubit-ai/mubit-cl-bench), cloned 2026-10-23
- [MubitLabs/banyan-sapling](https://huggingface.co/MubitLabs/banyan-sapling) via web search summary, accessed 2026-10-23
- [Digg: Mubit announces platform…](https://digg.com/ai/96i9loxr) via web search summary, accessed 2026-10-23
- [Dealroom](https://app.dealroom.co/companies/mubit), [Hoxton Ventures](https://hoxtonventures.com/portfolio/mubit/), [Beacon Stone](https://beaconstonevc.com/company/mubit), [Simplify](https://simplify.jobs/c/Mubit), [anilperi.me](https://anilperi.me/) via web search summaries, accessed 2026-10-23
- [Heavybit article](https://www.heavybit.com/library/article/long-horizon-agents-part-2-memory-is-more-than-recall) via web search summary, accessed 2026-10-23
- [Luma: Night Shift](https://luma.com/nightshift-london), [Pop the Bubble](https://www.popthebubblehack.co.uk/), [LinkedIn: Eldar Utiushev](https://www.linkedin.com/in/eldaru/) via web search summaries, accessed 2026-10-23
- [mubit-sdk on PyPI](https://pypi.org/project/mubit-sdk/), accessed 2026-10-23
