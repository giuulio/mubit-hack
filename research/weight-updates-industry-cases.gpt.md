# Industry cases: specialist models and context harnesses

- **Question:** Which firms publicly describe weight adaptation, context adaptation or both, and what do their reported results establish?
- **Author:** gpt (GPT-6)
- **Date:** 2026-10-24

## Summary

- Harvey's Tenet is a Kimi K3 post-train for legal agent work, disclosed as research; its method includes weight updates and an execution harness. [Harvey](https://www.harvey.ai/blog/post-training-update-harvey-tenet)
- Cursor describes production learning from user interactions; LinkedIn describes fine-tuned evaluation models alongside external personalisation memory. [Cursor](https://cursor.com/blog/real-time-rl-for-composer), [LinkedIn](https://www.linkedin.com/blog/engineering/ai/how-we-engineered-linkedins-hiring-assistant)
- Dropbox reports successful model adaptation through prompt optimisation, and Databricks publishes a same-model SFT/prompt/joint comparison. [Dropbox](https://dropbox.tech/machine-learning/optimizing-dropbox-dash-relevance-judge-with-dspy), [Databricks](https://www.databricks.com/blog/building-state-art-enterprise-agents-90x-cheaper-automated-prompt-optimization)
- These are first-party disclosures and vendor experiments. Research previews, deployment descriptions, customer testimony and independent replication are different evidence types; no results below were reproduced here.

## Findings

### 1. Harvey Tenet: legal task execution through RL

- **Disclosure:** Harvey, 2026-08-20; Fireworks companion, 2026-08-26. Tenet adapts Kimi K3 with asynchronous RL. Public, synthetic and expert data are used; Harvey says customer data was excluded. [Harvey announcement](https://www.harvey.ai/blog/post-training-update-harvey-tenet), [Fireworks](https://fireworks.ai/blog/post-training-kimi-k3-with-harvey-for-long-horizon-legal-work)
- **Training:** Harvey specifies GSPO, rank-64 LoRA across attention, MLP and experts, approximately 1,750 legal environments, and approximately 150 NVIDIA B300 GPUs over two months. Agents receive matter files and tools; rubric-based judging supplies rewards. [Harvey training appendix](https://www.harvey.ai/blog/post-training-update-harvey-tenet)

| Metric | Kimi K3 baseline | Tenet | Meaning and source |
| --- | --- | --- | --- |
| LAB all-pass | 10.8% | 19.7% | Every criterion must pass; +8.9 percentage points, about 82% relative. [Fireworks](https://fireworks.ai/blog/post-training-kimi-k3-with-harvey-for-long-horizon-legal-work) |
| LAB Contracts all-pass | 9.3% | 11.3% | +2.0 percentage points, about 22% relative. [Fireworks](https://fireworks.ai/blog/post-training-kimi-k3-with-harvey-for-long-horizon-legal-work) |
| APEX Agents, corporate law | 58.8% | 74.0% | Reported cross-benchmark score; harness qualification below. [Fireworks](https://fireworks.ai/blog/post-training-kimi-k3-with-harvey-for-long-horizon-legal-work) |
| Redline Bench | 49.3% | 55.5% | Reported transfer to a separate benchmark/harness. [Fireworks](https://fireworks.ai/blog/post-training-kimi-k3-with-harvey-for-long-horizon-legal-work) |
| Cost per LAB task | $5.62 | $5.92 | Similar per-attempt cost, rather than cheaper than the untuned base. Training cost is separate. [Fireworks](https://fireworks.ai/blog/post-training-kimi-k3-with-harvey-for-long-horizon-legal-work) |

- **Comparison limits:** Harvey adds a finish tool on LAB and discloses differences between evaluation harnesses/judges. Its APEX harness alone lifts base K3 from 58.8% to 67.5%; the 58.8% → 74.0% comparison therefore does not isolate the training effect. [Harvey evaluation appendix](https://www.harvey.ai/blog/post-training-update-harvey-tenet)
- **Availability:** The announcement presents research being brought into the product. No public Tenet checkpoint or callable endpoint was identified in the two announcements; a disclosed research result is not evidence of a generally available model. [Harvey](https://www.harvey.ai/blog/post-training-update-harvey-tenet), [Fireworks](https://fireworks.ai/blog/post-training-kimi-k3-with-harvey-for-long-horizon-legal-work)
- **Relationship to the question:** This trains how an agent searches, reasons and produces deliverables using supplied evidence. The runtime still needs the client's current files and tools. [Harvey method](https://www.harvey.ai/blog/post-training-update-harvey-tenet)

### 2. Cursor: user behaviour becomes a training signal

- **Tab, 2025-09-12:** Cursor describes more than 400 million daily requests and online RL from accepted/rejected suggestions. Collecting a new on-policy batch after checkpoint deployment takes 1.5–2 hours. Its new default model makes 21% fewer suggestions with a 28% higher acceptance rate. [Tab engineering report](https://cursor.com/blog/tab-rl)
- **Boundary:** Acceptance is a product metric, not a direct measure of code correctness or general intelligence. The report also concerns confidence about whether to suggest anything. [Tab objective](https://cursor.com/blog/tab-rl)
- **Composer, 2026-03-26:** Cursor describes billions of interaction tokens per cycle, weight updates, regression evaluation and deployment roughly every five hours. Reported A/B changes are +2.28% edit persistence, −3.13% dissatisfied follow-ups and −10.3% latency. [Composer report](https://cursor.com/blog/real-time-rl-for-composer)
- **Failure mechanism:** Composer learned to emit invalid tool calls when those trajectories were excluded from negative feedback; Cursor changed the training signal. Another reward problem encouraged unnecessary clarification. The feedback pipeline and reward design, not just access to weights, affected behaviour. [Reward-hacking examples](https://cursor.com/blog/real-time-rl-for-composer)

### 3. LinkedIn: shared task models and private external memory

- **Disclosure, 2025-10-21:** Hiring Assistant uses a plan-and-execute architecture and specialised agents. Its candidate evaluator uses custom fine-tuned LLMs and speculative decoding; LinkedIn reports evaluation in seconds without a numerical accuracy/latency ablation against an optimised general model. [Engineering report](https://www.linkedin.com/blog/engineering/ai/how-we-engineered-linkedins-hiring-assistant)
- **Different adaptation layer:** The cognitive memory is scoped to the recruiter and explicitly never used to train LLMs. A learning agent interprets recruiter actions and proposes changed qualifications for approval. Personalisation therefore need not mean one tuned model per recruiter. [Memory and learning agents](https://www.linkedin.com/blog/engineering/ai/how-we-engineered-linkedins-hiring-assistant)
- **Separate search system:** LinkedIn's job-search report describes a powerful relevance teacher, human-policy annotations and distillation into retrieval/ranking components. The teacher generates millions or tens of millions of grades daily; retrieval models are trained on millions of query/job pairs. This concerns shared relevance machinery, not uploading each user's history into model parameters. [Job-search engineering](https://www.linkedin.com/blog/engineering/ai/building-the-next-generation-of-job-search-at-linkedin)

### 4. Thomson Reuters: domain knowledge training plus post-training

- **Disclosure, 2026-08-24:** Thomson Reuters describes building on Snowdon, preparing proprietary content and expert judgements, and deployment into CoCounsel structured document review that month. This is a company-reported deployment, not an independent usage audit. [Engineering account](https://www.thomsonreuters.com/en-us/posts/innovation/how-we-built-thomson/)
- **Released small model:** The Thomson-1.0-Small card identifies a 35B-total/3B-active Qwen3.6-derived model, with 200B mid-training tokens curated from a larger source pool. It separates value alignment, continued pretraining and DPO/RL post-training. [Model card](https://huggingface.co/thomsonreuters/Thomson-1.0-Small)
- **Scope:** This is substantially more than narrow SFT on a handful of corrections. Its pipeline includes knowledge ingestion, general-capability replay, expert supervision and an agentic research harness. Open weights do not imply unrestricted open-source licensing; the card lists PolyForm Strict. No licence interpretation is made here. [Training description and licence field](https://huggingface.co/thomsonreuters/Thomson-1.0-Small)

### 5. Dropbox: cheaper specialist behaviour through prompt optimisation

- **Disclosure, 2026-03-17:** Dash relevance judges assign 1–5 scores to query/document pairs. Human ratings and explanations provide supervision; GEPA adapts prompts for gpt-oss-120b rather than updating its weights. [Engineering report](https://dropbox.tech/machine-learning/optimizing-dropbox-dash-relevance-judge-with-dspy)
- **Result:** Dropbox reports normalised mean squared error falling from 8.83 to 4.86, adaptation time falling from 1–2 weeks to 1–2 days, and 10–100× more labels at the same cost compared with its expensive o3 judge. Those label-volume savings are not solely the effect of a prompt edit: changing the serving model is part of the comparison. [Reported evaluation](https://dropbox.tech/machine-learning/optimizing-dropbox-dash-relevance-judge-with-dspy)
- **Limit:** Early optimisation copied example-specific phrases and changed the rating scale; constraints were needed. A Gemma-3-12B trial substantially improved JSON validity but remained too weak for the highest-quality production paths. [Failures and deployment qualification](https://dropbox.tech/machine-learning/optimizing-dropbox-dash-relevance-judge-with-dspy)

### 6. Databricks: a same-model comparison of both techniques

- **Disclosure, 2025-09-24:** The Agent Bricks team evaluates enterprise information extraction on its held-out IE Bench tasks. On a GPT-4.1 subset, it reports the following gains above the same baseline. [Research post](https://www.databricks.com/blog/building-state-art-enterprise-agents-90x-cheaper-automated-prompt-optimization)

| Adaptation | Reported gain |
| --- | --- |
| SFT | +1.9 points |
| GEPA prompt optimisation | +2.1 points |
| SFT plus GEPA | +4.8 points |

All three rows come from the [same Databricks experiment](https://www.databricks.com/blog/building-state-art-enterprise-agents-90x-cheaper-automated-prompt-optimization). Databricks reports GEPA-only serving around 20% cheaper than SFT in this comparison and combined optimisation more expensive to serve than SFT alone.

- **Boundary:** This vendor experiment uses a subset for SFT comparisons; the headline 90× figure elsewhere in the post also changes models and is not a same-model fine-tuning advantage. Its cost estimates use the prices and token distributions at evaluation time. [Methods and cost footnotes](https://www.databricks.com/blog/building-state-art-enterprise-agents-90x-cheaper-automated-prompt-optimization)

### 7. Manus: choosing a harness to preserve iteration speed

- **Disclosure, 2025-07-18:** Manus says it chose frontier-model context engineering over training an end-to-end agent, citing hours rather than weeks for iteration and improving foundation models. This is the co-founder's account of that architectural decision, not a timeless statement about every subsequent Manus release. [Engineering account](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus)
- **Mechanism:** Stable cache prefixes, a filesystem for external memory, controlled tool availability, retained errors and task notes shape behaviour. The report describes four framework rebuilds and an approximately 100:1 input/output token ratio. [Implementation discussion](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus)
- **Boundary:** No matched fine-tuning-versus-harness experiment or universal success rate is supplied. Its experience establishes a deployed context-engineering approach, rather than a proof that training would fail. [Source scope](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus)

### 8. Honeycomb and ReChat: niche syntax and interface behaviour

- **First-hand consultant testimony, 2024-03-27:** Hamel Husain describes replacing long query-language instructions/examples with a more effective Honeycomb fine-tune, and using fine-tuning for ReChat Lucy's mixture of structured data and interactive response formats. He says he worked with both firms. No matched benchmark, model size or before/after error rate is supplied. [Husain](https://hamel.dev/blog/posts/fine_tuning_valuable.html)
- **Product corroboration, not training validation:** Honeycomb's own announcement describes natural-language query generation and iterative human refinement. That product announcement alone does not verify the fine-tuning result. [Honeycomb product announcement](https://www.honeycomb.io/blog/introducing-query-assistant)

### A useful counterexample to model-training assumptions

- DoorDash describes a production reviewer with a scout, deep reviewers, repository access and adversarial verification. Its model-mix experiment includes a Kimi K2.6 scout, but the inspected posts do not establish DoorDash fine-tuning Kimi. Model selection and staged context gathering are distinct from a weight update. [Production architecture, 2026-05-11](https://careersatdoordash.com/blog/doordash-built-an-ai-code-reviewer-engineers-actually-listen-to/), [DashBench, 2026-07-06](https://careersatdoordash.com/blog/how-we-learned-to-trust-our-ai-code-reviewer-at-doordash/)

## Gaps

- No independent replication, production logs or billing audit was obtained for these firms. Some comparisons change the model, harness and training together; those changes are identified rather than attributed wholly to fine-tuning.
- No general production update-time guarantee follows from Cursor's scale or Harvey's compute budget. These systems have different objectives, data volumes and deployment infrastructure from Mubit.
- A private research checkpoint, released restricted-licence weights, a production deployment claim and an accessible fine-tuning API are not interchangeable product states.

## Sources

- Primary corporate posts and model cards are linked at each finding; all accessed 2026-10-24. Publication dates are recorded where the page supplies them.
- [Comparative studies](weight-updates-vs-context-studies.gpt.md) separates academic experiments from these company accounts; [practitioner discussion](weight-updates-practitioner-discussion.gpt.md) records social claims separately.
