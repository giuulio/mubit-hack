# research/

Objective notes that feed ideation. One topic per file.

## Rules

- **Facts only.** Record what sources say and what was observed. No evaluation, opinions, recommendations, rankings or idea suggestions; those belong in `ideas/`.
- **Every finding cites a source** (a link, or the command or experiment that produced it).
- Separate what a vendor *claims* from what was *observed* or independently reported, and say which it is.
- Quote numbers, limits and dates exactly, with units. Write "not found" rather than guessing.
- **Stay inside your assigned topics** (table below) so agents don't overlap. A new topic that no row covers is fine: give it its own file.
- Keep each file skimmable: under about 250 lines, summary first.
- Never edit another author's file. To extend or correct one, write a new file that links to the original; the only edit allowed in the original is one line under its title: `> Corrected by [<file>](<file>)`.

## File naming

`research/<topic-slug>.<author>.md`, for example `mubit-platform.claude.md`. `<author>` is the agent or person (`claude`, `gpt`, `giulio`).

## Topics

Each row is one file, named `<slug>.<owner>.md`.

### Mubit and model-side (owner: `claude`)

| Slug | Scope |
| --- | --- |
| `mubit-platform` | Everything public about how Mubit works: proxying, tasks, sessions, adapters, when training starts and how long it takes, evaluation and grading, ratings and corrections, Try models, API, SDKs, headers, limits, pricing. Answer the open corrections question in HACKATHON.md as far as public sources allow. |
| `mubit-ecosystem` | MubitLabs' public output: Banyan Sapling, Latte Bench, the GitHub and Hugging Face orgs, blog posts, papers, founders' talks and posts, previous Mubit events and their winners. |
| `learning-from-feedback` | Research from 2024–2026 on updating model **weights** from corrections: learning from human or natural-language feedback, preference optimisation (DPO, KTO, ORPO), online and continual fine-tuning, test-time training, self-improving agents, forgetting. |
| `task-specific-small-models` | Distilling a closed-model workload into a small open model: LoRA and adapters, multi-LoRA serving (vLLM, LoRAX, S-LoRA), published quality, cost and latency comparisons (Track 2). |
| `fine-tuning-platforms` | Products that turn logs or feedback into tuned models (OpenPipe, Predibase, Fireworks, Together, OpenAI SFT/DPO/RFT, Vertex AI, Bedrock, Unsloth, Distil Labs, Arcee and similar): how data and corrections get in, minimum examples, training time, pricing. |
| `drift-and-fast-refresh` | Data and concept drift, changing workloads, how often production models are retrained, and live public data feeds usable in a demo, with rate limits and licences (Track 3). |
| `hackathon-winners-model-centric` | Winning projects, with repos, from hackathons themed on fine-tuning, evals, model training, inference or LLM infrastructure. |
| `domain-software-engineering` | Domain file (format below): coding agents, code review, CI and incident triage, logs, commit and PR text, coding-agent session logs as data. |
| `domain-finance-accounting` | Domain file: transaction categorisation, invoice and expense coding, reconciliation, KYC and AML checks. |
| `domain-legal-compliance` | Domain file: contract review, clause extraction, policy and regulatory checks. |

### Users, products and applications (owner: `gpt`)

| Slug | Scope |
| --- | --- |
| `production-llm-workloads` | Which repeated LLM tasks organisations run in production, and at what volume: industry surveys, usage reports (Anthropic Economic Index, OpenAI and others), engineering-blog case studies. |
| `correction-pain-points` | Where people repeatedly correct AI output today and say so (Hacker News, Reddit, GitHub issues, product forums, reviews), and where corrections already exist as a by-product of work (edits, relabels, overrides, rejected suggestions). |
| `feedback-and-eval-tooling` | How eval and observability tools capture human feedback and grade outputs (Langfuse, Braintrust, Pydantic Logfire, LangSmith, Arize Phoenix, Promptfoo and similar); LLM-as-judge, deterministic graders, verifier models. |
| `alternatives-to-weight-updates` | Ways to learn from corrections **without** retraining: prompt optimisation (DSPy, GEPA, TextGrad), agent memory (Mem0, Letta, Zep, LangMem, ChatGPT and Claude memory), retrieving past corrections, rules files (`CLAUDE.md`, Cursor rules). |
| `public-datasets` | Cross-domain public datasets that pair an input with a human correction or ground truth (edit histories, relabelled sets, preference data) and dataset hubs: size, licence, format, link. Domain-specific datasets go in the domain files. |
| `hackathon-winners-ai-apps` | Winning projects, with repos, from general AI and agent hackathons in 2024–2026 (Devpost, lablab.ai, Cerebral Valley, AI Tinkerers, London events, model-lab hackathons), excluding the model-centric ones above. |
| `domain-customer-support` | Domain file: ticket triage and routing, reply drafting, QA of agent replies. |
| `domain-healthcare-science` | Domain file: clinical coding, literature screening, lab and trial documents (public or synthetic data only). |
| `domain-commerce` | Domain file: product categorisation, listings, review moderation, marketing-copy compliance. |
| `domain-public-sector-education` | Domain file: marking and feedback, FOI and casework, public-service content. |

### Formats for specific topics

- **Hackathon winners files:** one entry per project with event, date, placing, repo link, what it does, stack, how it used the sponsor's product, and demo format. Include the event's judging criteria where published.
- **Domain files:** for the domain, cover the repeated LLM tasks done today and who does them how often; existing products; where corrections arise and who makes them; public datasets and APIs (size, licence, link); stated pain points with sources.

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
