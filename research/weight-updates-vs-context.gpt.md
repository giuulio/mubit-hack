# Weight updates versus context: evidence map and terminology

- **Question:** What differs between adapting model weights and developing a context harness, why do organisations use either, and where does post-training fit?
- **Author:** gpt (GPT-6)
- **Date:** 2026-10-24

## Summary

- Weight training and context engineering can be combined: BetterTogether tests joint optimisation, and RAFT trains a model to use retrieved documents. Neither mechanism removes the other from the system. [BetterTogether](https://arxiv.org/html/2407.10930v2), [RAFT](https://arxiv.org/html/2403.10131)
- Controlled results differ by task: Mosbach et al. find similar out-of-domain generalisation for fine-tuning and in-context learning; Ovadia et al. find retrieval substantially better than unsupervised fine-tuning for factual knowledge injection. [Mosbach](https://arxiv.org/abs/2305.16938), [Ovadia](https://arxiv.org/html/2312.05934v3)
- Training can change task behaviour, including tool use and when to abstain, and can transfer a larger model's task performance to a smaller student. These are different objectives from storing a document collection. [Harvey](https://www.harvey.ai/blog/post-training-update-harvey-tenet), [Distilling Step-by-Step](https://arxiv.org/abs/2305.02301)
- Context adaptation also learns from feedback: GEPA changes prompts using execution traces; ACE maintains evolving playbooks. A correction changing future behaviour does not by itself identify a weight update. [GEPA](https://arxiv.org/abs/2507.19457v2), [ACE](https://arxiv.org/abs/2510.04618v3)
- Mubit explicitly tests a prompt baseline: its `Prompt only` result means the adapter's open base model did as well when given the task prompt. [Current documentation, first-adapter section](https://docs.mubit.ai/llms-full.txt)

## Reading map

| New note | Contents |
| --- | --- |
| [Comparative studies](weight-updates-vs-context-studies.gpt.md) | Paper-by-paper setups, findings, numerical results and limits, including evidence favouring context adaptation |
| [Industry cases](weight-updates-industry-cases.gpt.md) | Harvey Tenet, Cursor, LinkedIn, Thomson Reuters, Dropbox, Databricks, Manus and Honeycomb |
| [Practitioner discussion](weight-updates-practitioner-discussion.gpt.md) | Attributed X, Hacker News, Reddit and LinkedIn statements, with access and evidence limits |

These notes extend [alternatives to weight updates](alternatives-to-weight-updates.gpt.md), [learning from feedback](learning-from-feedback.claude.md), [small models](task-specific-small-models.claude.md), [drift](drift-and-fast-refresh.claude.md) and [legal applications](domain-legal-compliance.claude.md). Existing files and the folder README are unchanged. (Observed: repository files read with `cat`; additions checked with `git status --short`.)

## Findings

### What changes, and what persists

| Mechanism | What changes | What is supplied at inference | Primary reference |
| --- | --- | --- | --- |
| Instructions and few/many-shot examples | Input text; underlying model parameters stay fixed | Instructions and selected examples must be available in the current context | [Many-Shot ICL](https://arxiv.org/abs/2404.11018v3) |
| Retrieval and agent memory | External documents, notes, indexes and retrieval policy | Retrieved material enters the model's context; stored memory can persist across sessions | [ACE](https://arxiv.org/abs/2510.04618v3), [LinkedIn memory](https://www.linkedin.com/blog/engineering/ai/how-we-engineered-linkedins-hiring-assistant) |
| Prompt optimisation | Instructions or demonstrations selected against feedback/evaluations | The selected prompt is used in subsequent calls | [GEPA](https://arxiv.org/abs/2507.19457v2) |
| Supervised fine-tuning (SFT) | Trainable parameters, using target outputs or trajectories | The adapted model still receives a prompt and task-specific inputs | [RAFT](https://arxiv.org/html/2403.10131) |
| Preference optimisation | Parameters, using preferred/rejected outputs | An adapted policy generates later responses | [DPO](https://arxiv.org/abs/2305.18290v3) |
| Reinforcement learning (RL) | Parameters, using rewards for sampled behaviour | An adapted policy operates inside an inference harness | [DeepSeek-R1](https://arxiv.org/abs/2501.12948), [Cursor](https://cursor.com/blog/real-time-rl-for-composer) |
| LoRA | Small trainable low-rank matrices; original base weights can stay frozen | Base model plus adapter, or merged effective weights | [LoRA](https://arxiv.org/abs/2106.09685v2) |
| Distillation | Student parameters trained from a teacher's outputs, rationales or distributions | Student performs the selected task; it need not be the teacher's size | [Distilling Step-by-Step](https://arxiv.org/abs/2305.02301v2) |

- A harness includes orchestration, context assembly, tools, state and execution controls; an `AGENTS.md`-style file is one input to that larger system. Manus describes filesystem memory, cache management, tool control and error retention as parts of its context-engineering approach. [Manus engineering account](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus)
- Persistence is possible on either side: a saved rule can be reloaded tomorrow without training; a saved adapter can be reloaded tomorrow without replaying all its training examples. The persistence mechanisms differ. [ACE](https://arxiv.org/abs/2510.04618v3), [LoRA](https://arxiv.org/abs/2106.09685v2)

### How this relates to post-training

- In the usage adopted here, post-training adapts an already pretrained model's behaviour or capabilities through additional training. SFT, preference optimisation, RL and student distillation can all participate; LoRA specifies how parameters are represented and updated, rather than a competing training objective. [Thinking Machines](https://thinkingmachines.ai/blog/lora/), [DPO](https://arxiv.org/abs/2305.18290v3), [DeepSeek-R1](https://arxiv.org/abs/2501.12948)
- General instruction and reasoning training can be followed by another organisation's task-specific training. Harvey's training starts from an existing Kimi K3 checkpoint; it does not train a foundation model from scratch. [Fireworks](https://fireworks.ai/blog/post-training-kimi-k3-with-harvey-for-long-horizon-legal-work)
- Continued pretraining or mid-training on domain text is distinguishable from training on demonstrations, preferences or rewards. Thomson Reuters explicitly separates corpus-based knowledge training from behavioural post-training. Terminology across organisations is not completely uniform. [Thomson model card](https://huggingface.co/thomsonreuters/Thomson-1.0-Small)
- An inference harness using a frozen model is not a model-weight training stage. It can nevertheless contain its own optimisation loop over prompts or memory. [GEPA](https://arxiv.org/abs/2507.19457v2), [ACE](https://arxiv.org/abs/2510.04618v3)

### Documented reasons for using weights or context

| Requirement or observed problem | Weight-based evidence | Context-based evidence or boundary |
| --- | --- | --- |
| Repeated specialised decisions | LinkedIn uses fine-tuned models for qualification evaluation | Its recruiter-specific memory is external and explicitly excluded from LLM training. [LinkedIn](https://www.linkedin.com/blog/engineering/ai/how-we-engineered-linkedins-hiring-assistant) |
| Learning a niche output language or response structure | Husain reports fine-tuning improvements for Honeycomb's query syntax and ReChat's interface format | This is consultant testimony, without a published controlled comparison. [Husain](https://hamel.dev/blog/posts/fine_tuning_valuable.html) |
| Tool strategy and execution efficiency | Cursor trains from user interactions and reports latency improvements | Dropbox reports cheaper model use after prompt optimisation alone. [Cursor](https://cursor.com/blog/real-time-rl-for-composer), [Dropbox](https://dropbox.tech/machine-learning/optimizing-dropbox-dash-relevance-judge-with-dspy) |
| Lower inference cost at repeated volume | Distillation can replace a large teacher on a bounded task | Prompt optimisation can also enable cheaper models; savings are not exclusive to weight updates. [Hsieh](https://arxiv.org/abs/2305.02301), [Databricks](https://www.databricks.com/blog/building-state-art-enterprise-agents-90x-cheaper-automated-prompt-optimization) |
| Fresh, attributable facts | Unsupervised fine-tuning underperforms RAG in Ovadia's experiments | Retrieval supplies current evidence directly; this result concerns knowledge injection, not every kind of training. [Ovadia](https://arxiv.org/html/2312.05934v3) |
| Fast iteration and changing base models | An adapted model must be re-evaluated when its training or base changes | Manus reports choosing context engineering for rapid iteration and access to improving frontier models. [Manus](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus) |
| Learning to use retrieved evidence | RAFT trains with relevant and distracting documents | The trained model still uses context; training and retrieval address different parts of the pipeline. [RAFT](https://arxiv.org/html/2403.10131) |

### Economics: costs that belong in the comparison

- The older T-Few paper counts repeated ICL example processing as an inference cost. Modern prefix caching can reuse that processing; vLLM documents that caching helps prefill, but not generation of new output tokens. Consequently, uncached long prompts are a different baseline from a cached production harness. [T-Few](https://proceedings.neurips.cc/paper_files/paper/2022/hash/0cde695b83bd186c1fd456302888454c-Abstract-Conference.html), [vLLM prefix caching](https://docs.vllm.ai/en/latest/features/automatic_prefix_caching/)
- LoRA reduces trainable parameters, not the size of the base network required at inference. A smaller model, shorter prompt, fewer generated tokens, fewer tool calls and cheaper serving are separate potential sources of savings. [LoRA](https://arxiv.org/abs/2106.09685v2), [Fireworks cost discussion](https://fireworks.ai/blog/post-training-kimi-k3-with-harvey-for-long-horizon-legal-work)
- For a fixed comparison period, define total cost as `F + N × c`, where `F` includes preparation, optimisation, evaluation and deployment, `N` is completed-task volume and `c` includes inference, retrieval, tools, retries and review per task. This is an accounting identity, not a measured price. Databricks separately analyses optimisation and serving costs as volume changes. [Databricks lifetime-cost analysis](https://www.databricks.com/blog/building-state-art-enterprise-agents-90x-cheaper-automated-prompt-optimization)
- Under equal task quality and fixed costs, tuning breaks even against a harness when `N × (c_harness − c_tuned) > F_tuned − F_harness`. If per-task costs are not lower, volume alone does not create savings. Refresh costs and changed error rates alter those assumptions. (Derived algebraically from the preceding cost identity; no Mubit break-even volume was measured.)
- Hosting control and training are separate choices: Manus describes caching for self-hosted and API models alike. Having weights available permits local serving, but does not by itself show that task fine-tuning is necessary or that confidential data cannot be memorised. [Manus](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus), [LoRA training mechanism](https://arxiv.org/abs/2106.09685v2)

### What is established for Mubit

- Current docs describe recorded calls grouped by task, kept examples, a task-specific adapter and tests against the provider's answers. The exposed term `adapter` does not identify a published base architecture or training objective. [Concepts in full documentation](https://docs.mubit.ai/llms-full.txt)
- `Prompt only` compares the adapter with its own open base model given the task prompt; it does not mean a frontier provider with an extensively optimised harness was beaten. `Passed` means sufficiently close to the provider's answers under Mubit's tests. [First-adapter results](https://docs.mubit.ai/llms-full.txt)
- Try models adds the task instructions and marks comparison calls as not stored and not used for training. The docs do not promise that one correction yields an immediate successful update. [First-adapter workflow](https://docs.mubit.ai/llms-full.txt)
- The team's newer staff-Q&A record says a Bad rating does not remove a training example, direct adapter IDs are unavailable, and the exact replacement-answer-to-weight-update path remains unresolved. This supersedes the older platform note's statement that all those questions are unanswered. [Current team record](../HACKATHON.md), [older note](mubit-platform.claude.md)

## Search method and gaps

- All 21 existing Markdown files under `research/`, plus `AGENTS.md` and `HACKATHON.md`, were read before adding these notes. (Observed: `rg --files`, `wc -l -w` and `cat`, 2026-10-24.)
- Searches covered fine-tuning versus ICL, knowledge injection, long context, prompt optimisation, distillation, agent training, forgetting, corporate deployments and practitioner disagreement. Direct Google Scholar search access failed; Scholar-targeted web searches were attempted, and papers were located through arXiv, ACL Anthology, NeurIPS proceedings, author repositories and company research pages. No Scholar citation-count or exhaustive Scholar-coverage claim is made.
- Primary sources support technical findings. Company results are attributed; social statements remain testimony. Paper abstracts are distinguished from methods/results inspected in the [study note](weight-updates-vs-context-studies.gpt.md). No experiments were reproduced.
- No retrieved study measures the best current frontier-model harness against a Mubit adapter on the same task, data, tools and budget. No universal correction count, accuracy ceiling, retraining cadence or savings percentage follows from the collected evidence.
- No customer datasets were accessed, and no model training, external posting or project inference was performed. The collected results concern specific mechanisms and tasks; no universal winner was established.

## Sources

- Technical and economic primary sources are linked at each finding; all accessed 2026-10-24. Detailed bibliographic and reading-status records are in [comparative studies](weight-updates-vs-context-studies.gpt.md); dated corporate sources are in [industry cases](weight-updates-industry-cases.gpt.md).
