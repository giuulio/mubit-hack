# Practitioner discussion of fine-tuning and context engineering

- **Question:** What do practitioners say on X and other platforms, and which statements have supporting measurements?
- **Author:** gpt (GPT-6)
- **Date:** 2026-10-24

## Summary

- X discussion includes advocacy for context engineering and explicit defences of task-specific fine-tuning; a verified technical claim is different from a popular post. [Karpathy post mirror](https://bird.makeup/users/karpathy/statuses/1937902205765607626), [Husain's own response to his X discussion](https://hamel.dev/blog/posts/fine_tuning_valuable.html)
- Hacker News and Reddit discussions contain conflicting first-person reports, including narrow-task improvements, failed internal-document tuning and benefits disappearing as base models improve. These are anecdotes, not measured adoption rates. [HN](https://news.ycombinator.com/item?id=44242737), [Reddit](https://www.reddit.com/r/LocalLLaMA/comments/1ov7ogq/stop_finetuning_your_model_for_every_little_thing/)
- Disagreement often concerns different training objectives: factual recall, response format, task execution and private deployment are repeatedly mixed together. The papers and firm disclosures supporting specific distinctions are recorded in [comparative studies](weight-updates-vs-context-studies.gpt.md) and [industry cases](weight-updates-industry-cases.gpt.md).

## Findings

### X: context engineering as a larger engineering discipline

- **Andrej Karpathy, 2025-06-25:** Endorses the term context engineering and describes assembling the information a model needs in its context window. The mirror also shows Tobi Lütke's 2025-06-19 post promoting the term. Neither post is a controlled comparison with task fine-tuning. [Original Karpathy permalink](https://x.com/karpathy/status/1937902205765607626), [retrieved mirror](https://bird.makeup/users/karpathy/statuses/1937902205765607626)
- **Access qualification:** Fetching the original X permalink returned HTTP 403. Attribution/content above rely on the retrieved mirror; no likes, impressions or representative-sentiment estimate is used. The corresponding HN thread independently links the original discussion but does not independently test its technical proposition. [HN discussion, 2025-06-25](https://news.ycombinator.com/item?id=44379538)

### X and an author follow-up: fine-tuning for bounded tasks

- **Hamel Husain, X discussion 2024-03-26, article 2024-03-27:** His own article embeds the X post asking about disillusionment with fine-tuning and gives his subsequent view: domain evaluation is a prerequisite, prompt work can expose evaluation weaknesses, and fine-tuning remains useful for some specialised syntax/rule tasks. [Author's article and embedded post](https://hamel.dev/blog/posts/fine_tuning_valuable.html)
- **What is established:** This is an identifiable practitioner's opinion and first-hand consulting account, not a controlled study. The named Honeycomb/ReChat examples are recorded once in [industry cases](weight-updates-industry-cases.gpt.md); no unsupported market-wide success rate is inferred.

### LinkedIn: a training engineer describes the work behind Tenet

- **Scott Gee, Fireworks engineer, Tenet announcement discussion:** Describes three months of trial and error, 400,000 GPU hours and billions of rollout tokens for a custom RL loop with Harvey. The retrieved post does not expose an absolute posting date; its contents were accessed 2026-10-24. [First-person LinkedIn post](https://www.linkedin.com/posts/scott-gee-sw_so-excited-to-show-the-world-what-fireworks-activity-7496246343955386368-160T)
- **Scope difference:** Harvey's technical appendix describes approximately 150 GPUs over two months. The social account's larger effort may include experimentation, but that reconciliation is not verified. The two numbers are kept separate. [Harvey appendix](https://www.harvey.ai/blog/post-training-update-harvey-tenet)

### Hacker News: benefits on narrow tasks, and reasons to stop tuning

- **Thread, 2025-06-11 to 2025-06-17:** In *Fine-tuning LLMs is a waste of time*, `rybosome` describes hardware/HDL tasks benefiting from tuning; `itake` cites scale, latency and cost; `BenGosub` reports no noticeable improvement in their firm's attempt. Firm identities, datasets and evaluations are not provided. [Original thread](https://news.ycombinator.com/item?id=44242737)
- In the same thread, `rickcarlino` says sentence-equivalence grading previously needed fine-tuning, but newer models removed that need. Others dispute the factual-knowledge claim and point out that LoRA is itself fine-tuning. These are attributed statements; the LoRA mechanism is independently described in the [original paper](https://arxiv.org/abs/2106.09685). [HN discussion](https://news.ycombinator.com/item?id=44242737)
- **Simon Willison, 2025-06-02:** Expresses scepticism about continuously training company knowledge into models and prefers long context plus tools; he names Jane Street's OCaml work as the nearest success he had heard of. This records his information at that date, not proof that no later successes exist. [Original comment](https://news.ycombinator.com/item?id=44158759)

### Reddit: divergent outcomes and data-quality complaints

- **r/LocalLLaMA, 2025-11-12:** A poster reports spending three weeks tuning for internal-API questions with disappointing results and hallucinations; replies report both good and bad outcomes and emphasise data quality, variation and hyperparameters. The thread's unsourced 80% heuristic is not treated as evidence. [Original thread](https://www.reddit.com/r/LocalLLaMA/comments/1ov7ogq/stop_finetuning_your_model_for_every_little_thing/)
- **r/LocalLLaMA, 2026-06-27:** Participants describe a shift from fixing weak base models to specialist adapters, practical memory/compute constraints and mixed results on MCP tool-decision training. Claimed hardware timings and model quality were not independently checked. [Original thread](https://www.reddit.com/r/LocalLLaMA/comments/1uh8e0r/anyone_still_doing_finetunes_on_consumer_grade/)
- **r/Rag, 2026-09-09:** The opening post favours fine-tuning for behaviour and RAG for changing facts. Replies include an unsupported claim that fine-tuning cannot add data, support for hybrids and an explicit request for data/methodology before trusting advice. This documents disagreement; no scientific consensus is inferred from votes. [Original thread](https://www.reddit.com/r/Rag/comments/1wbhsdi/rag_vs_finetuning_what_actually_works_better_in/)
- **r/Rag, 2026-10-22:** A new practical question receives advice to distinguish access to information from repeated format/classification/execution errors. It offers no experimental result. [Original thread](https://www.reddit.com/r/Rag/comments/1xceab6/rag_vs_finetuning/)

### Claims that can be checked against primary evidence

| Statement found in discussions | What primary evidence establishes |
| --- | --- |
| Fine-tuning cannot add knowledge | Too absolute: Ovadia observes some learning; Doc-to-LoRA generates parameters encoding unseen context. Neither makes arbitrary document tuning reliable. [Ovadia](https://arxiv.org/html/2312.05934v3), [Doc-to-LoRA](https://arxiv.org/abs/2602.15902) |
| RAG is for facts; fine-tuning is only for style | Incomplete: RAFT trains evidence use; Cursor trains agent behaviour from interaction signals. [RAFT](https://arxiv.org/html/2403.10131), [Cursor](https://cursor.com/blog/real-time-rl-for-composer) |
| An adapter leaves the model unaffected | The base checkpoint can stay frozen while the effective computation changes; forgetting can still occur. [LoRA](https://arxiv.org/abs/2106.09685), [Biderman](https://arxiv.org/abs/2405.09673v2) |
| Better prompts cannot substitute for training | GEPA and Databricks give counterexamples under specified tasks and budgets. Neither proves universal dominance. [GEPA](https://arxiv.org/abs/2507.19457v2), [Databricks](https://www.databricks.com/blog/building-state-art-enterprise-agents-90x-cheaper-automated-prompt-optimization) |
| Accepted output is correct output | DoorDash explains why acceptance lacks missed-issue information and can disagree with correctness. [DashBench](https://careersatdoordash.com/blog/how-we-learned-to-trust-our-ai-code-reviewer-at-doordash/) |

## Gaps

- This is a purposive sample of public discussions, not a social-media survey. Search ranking, community selection, pseudonyms, commercial incentives and publication bias limit interpretation.
- Several X pages and the Harvey account mirror were inaccessible directly. Author-embedded X content and a labelled Karpathy mirror were usable; no complete X thread/reply analysis was possible. Unretrieved reposts and generated X trending summaries were excluded as technical evidence.
- Social discussion is used to identify claims and reported experiences; papers and corporate methods/results are used to assess technical propositions. No anecdote establishes a workload's expected success rate or financial return.

## Sources

- Original posts/threads, author follow-up and the explicitly labelled mirror are linked above; accessed 2026-10-24. Technical verification sources are linked in the claim table and expanded in the companion notes.
