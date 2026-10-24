# Comparative studies of weight and context adaptation

- **Question:** What do controlled studies show about fine-tuning, in-context learning, retrieval, prompt optimisation and their combinations?
- **Author:** gpt (GPT-6)
- **Date:** 2026-10-24

## Summary

- Matched-model comparisons do not establish an inherent out-of-domain generalisation advantage for ICL over fine-tuning. [Mosbach et al., Findings of ACL 2023](https://arxiv.org/abs/2305.16938v2)
- RAG beats unsupervised fine-tuning in a knowledge-injection study; training with retrieval can improve a separate model's use of evidence. These experiments optimise different things. [Ovadia et al.](https://arxiv.org/html/2312.05934v3), [RAFT](https://arxiv.org/html/2403.10131)
- Prompt optimisation is a substantive competitor: GEPA reports outperforming GRPO on six tasks; BetterTogether finds joint prompt/weight optimisation best in seven of nine model/task pairs. [GEPA](https://arxiv.org/abs/2507.19457v2), [BetterTogether](https://arxiv.org/html/2407.10930v2)
- More context is not uniformly helpful, and fine-tuning is not uniformly harmless: position effects, extra instruction overhead, hallucination and forgetting are measured in different studies. [Lost in the Middle](https://arxiv.org/abs/2307.03172v3), [AGENTS.md](https://arxiv.org/html/2602.11988v3), [Gekhman et al.](https://aclanthology.org/2024.emnlp-main.444/), [Biderman et al.](https://arxiv.org/abs/2405.09673v2)

## Findings

### 1. Few-shot PEFT can amortise repeated demonstrations

- **Paper:** Liu et al., *Few-Shot Parameter-Efficient Fine-Tuning is Better and Cheaper than In-Context Learning*, NeurIPS 2022. Introduces T-Few with learned activation scaling, (IA)³, and compares accuracy and computational requirements with ICL. [Proceedings](https://proceedings.neurips.cc/paper_files/paper/2022/hash/0cde695b83bd186c1fd456302888454c-Abstract-Conference.html)
- **Result and boundary:** The authors report better accuracy and lower computation on their few-shot tasks, including the RAFT classification benchmark, distinct from retrieval-augmented fine-tuning below. The 2022 setup predates current frontier models and production prompt caching; it does not supply a current API-price comparison. [Paper](https://arxiv.org/abs/2205.05638)

### 2. A matched comparison changes the generalisation claim

- **Paper/setup:** Mosbach et al., *Few-shot Fine-tuning vs. In-context Learning: A Fair Comparison and Evaluation*, Findings of ACL 2023; OPT models from 125M to 30B, controlling model size and examples, with in-domain and challenge-set evaluation. [Paper, v2](https://arxiv.org/abs/2305.16938v2)
- **Result:** Both approaches can generalise out of domain and show substantial variability. The methods/results inspect pattern-based fine-tuning and multiple data seeds; the abstract's conclusion is similar generalisation, not universal equality on every task. [Full text](https://arxiv.org/html/2305.16938)
- **Boundary:** These classification/NLI experiments do not compare modern end-to-end agents, retrieval stacks or an arbitrary small model with a much larger frontier model. [Study scope](https://arxiv.org/html/2305.16938)

### 3. Many-shot ICL can reach fine-tuning-like task performance

- **Paper/setup:** Agarwal et al., *Many-Shot In-Context Learning*, NeurIPS 2024; hundreds or thousands of examples across generative and discriminative tasks. [Paper, v3](https://arxiv.org/abs/2404.11018v3)
- **Result:** Reports large gains over few-shot ICL, overriding some pretraining biases and performance comparable to fine-tuning in studied settings. Human examples, generated rationales and question-only contexts are investigated separately. [Abstract](https://arxiv.org/abs/2404.11018v3)
- **Boundary:** Gains vary by model; longer demonstrations increase inference cost in their setup. This establishes that context can teach patterns, rather than merely expose facts, without proving that all task learning fits efficiently in context. [Abstract](https://arxiv.org/abs/2404.11018v3)

### 4. Retrieval beats raw-text fine-tuning for factual injection

- **Paper/setup:** Ovadia et al., *Fine-Tuning or Retrieval? Comparing Knowledge Injection in LLMs*, EMNLP 2024; Llama2-7B, Mistral-7B and Orca2-7B, MMLU subjects and a current-events task. Training uses unsupervised language modelling on text chunks, with a paraphrase variant. [Published record](https://aclanthology.org/2024.emnlp-main.15/), [inspected arXiv v3](https://arxiv.org/html/2312.05934v3)
- **Result:** Table 2 gives Mistral-7B accuracy of 0.481 base, 0.875 with RAG, 0.504 with ordinary fine-tuning and 0.588 with paraphrase fine-tuning. For that row, FT-plus-RAG scores 0.810 or 0.830, below RAG alone. [Table 2](https://arxiv.org/html/2312.05934v3)
- **Boundary:** Answers are multiple choice, scored through log probabilities; current-events questions correspond closely to source documents. This is not a comparison against supervised behavioural training or long-horizon RL. The older research note's approximate figures should not be read as applying to every tested model. [Methods/results](https://arxiv.org/html/2312.05934v3), [older note](drift-and-fast-refresh.claude.md)

### 5. New facts during SFT can increase hallucination

- **Paper/setup:** Gekhman et al., *Does Fine-Tuning LLMs on New Knowledge Encourage Hallucinations?*, EMNLP 2024; controlled closed-book QA with varying proportions of known and unknown factual training examples. [Published paper](https://aclanthology.org/2024.emnlp-main.444/)
- **Result:** Unknown facts are learned more slowly; fitting them can increase hallucination and reduce held-out performance on previously available knowledge. [Paper text](https://arxiv.org/html/2405.05904)
- **Boundary:** The result identifies a failure mode of this SFT setup. It does not prove that parameters cannot learn facts, that all post-training causes hallucination, or that retrieval removes hallucination. [Paper](https://aclanthology.org/2024.emnlp-main.444/)

### 6. Training can improve the use of retrieved documents

- **Paper/setup:** Zhang et al., *RAFT: Adapting Language Model to Domain Specific RAG*, 2024; trains Llama2-7B with questions, relevant documents, distractors and evidence-bearing answers. Evaluations include PubMed, HotPotQA and Gorilla APIBench domains. [Paper](https://arxiv.org/html/2403.10131)
- **Result:** Table 1 reports PubMed 58.8 for base-plus-RAG, 71.6 for domain-SFT-plus-RAG and 73.30 for RAFT. On HuggingFace APIBench, corresponding values are 26.43, 42.59 and 74.00. [Table 1](https://arxiv.org/html/2403.10131)
- **Boundary:** Domain access and prepared training data are part of the setup; this is evidence for a trained reader within RAG. It does not establish that every combination of RAG and fine-tuning improves performance. [Method and evaluation](https://arxiv.org/html/2403.10131)

### 7. Long context and RAG trade quality against cost

- **Paper/setup:** Li et al., *Retrieval Augmented Generation or Long-Context LLMs? A Comprehensive Study and Hybrid Approach*, EMNLP Industry 2024; evaluates three models and introduces Self-Route. [Published paper](https://aclanthology.org/2024.emnlp-industry.66/)
- **Result:** Long context generally has higher average performance when sufficiently resourced; RAG costs less. Figure 1 reports GPT-4o performance of 48.67 with long context, 32.60 with RAG and 48.89 with Self-Route, with relative costs 100%, 17% and 61%. [Figure 1](https://aclanthology.org/2024.emnlp-industry.66.pdf)
- **Boundary:** This compares two context strategies, not weight training. Retrieval quality, models, document lengths and billing assumptions are specific to the experiment. [Paper](https://arxiv.org/abs/2407.16833)

### 8. Context capacity does not guarantee context use

- **Paper/setup:** Liu et al., *Lost in the Middle: How Language Models Use Long Contexts*, TACL 2024; varies evidence position in multi-document QA and key-value retrieval. [Published record](https://aclanthology.org/2024.tacl-1.9/)
- **Result:** Performance often peaks when relevant information is at the beginning or end, and degrades in the middle, including for explicitly long-context models. [Paper](https://arxiv.org/abs/2307.03172v3)
- **Boundary:** Tested models include 2023-era systems. The finding motivates a positional evaluation protocol; it does not measure the size of that effect in every 2026 model. [Methods](https://aclanthology.org/2024.tacl-1.9.pdf)

### 9. Prompt search can outperform a particular RL baseline

- **Paper/setup:** Agrawal et al., *GEPA: Reflective Prompt Evolution Can Outperform Reinforcement Learning*, ICLR 2026 oral; uses textual reflection over trajectories to propose and select prompt changes. [Paper, v2](https://arxiv.org/abs/2507.19457v2)
- **Result:** The abstract reports outperforming GRPO by 6% on average and up to 20% across six tasks, using up to 35× fewer rollouts; also outperforms MIPROv2. These are the paper's reported units, not a newly calculated pooled effect. [Abstract](https://arxiv.org/abs/2507.19457v2)
- **Boundary:** The comparison is against the tested GRPO configuration and task budgets. Prompt search uses reflection-model computation; unchanged task-model weights do not imply zero optimisation cost. [Author implementation](https://github.com/gepa-ai/gepa)

### 10. Persistent playbooks can learn from execution feedback

- **Paper/setup:** Zhang et al., *Agentic Context Engineering: Evolving Contexts for Self-Improving Language Models*, ICLR 2026; modular generation, reflection and curation maintain structured contexts. [Paper, v3](https://arxiv.org/abs/2510.04618v3)
- **Result:** The abstract reports +10.6% on agent benchmarks and +8.6% on finance against its baselines, with reduced adaptation latency and rollout cost. It also reports adaptation from execution feedback without labelled supervision. [Abstract](https://arxiv.org/abs/2510.04618v3)
- **Boundary:** These are context-adaptation results, not weight updates or a direct proof of superiority to every fine-tuning pipeline. [Mechanism](https://arxiv.org/abs/2510.04618v3)

### 11. Prompt and weight optimisation can compound

- **Paper/setup:** Soylu, Potts and Khattab, *Fine-Tuning and Prompt Optimization: Two Great Steps that Work Better Together*, EMNLP 2024; HotPotQA, GSM8K and Iris with Mistral-7B, Llama2-7B and Llama3-8B, three seeds. [Paper](https://aclanthology.org/2024.emnlp-main.597/)
- **Result:** Strategies combining prompt and weight optimisation perform best in seven of nine task/model pairs. Alternation can improve the prompts generating training data and then adapt prompts to the tuned model. [Results, arXiv v2](https://arxiv.org/html/2407.10930v2)
- **Boundary:** Only three tasks, three models and LoRA weight optimisation are tested; the authors explicitly leave generality and the interaction's explanation open. [Limitations](https://arxiv.org/html/2407.10930v2#S6)

### 12. Repository instruction files have measurable overhead

- **Paper/setup:** Gloaguen et al., *Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents?*, arXiv v3, revised 2026-09-29; SWE-bench plus CTXbench, with generated and developer-committed instructions. [Current paper](https://arxiv.org/html/2602.11988v3)
- **Result:** Reports no general task-success improvement and over 20% higher inference cost on average. Agents follow the added instructions and perform more exploration/testing. Human files outperform generated ones in the analysed setting. [Abstract and Section 4](https://arxiv.org/html/2602.11988v3)
- **Boundary:** Python issue resolution is the main scope; security, efficiency and non-standard organisational requirements are not fully captured by task resolution. The current version explicitly recognises a role for instructions describing non-standard practices. This is not an instruction to ignore this repository's rules. [Limitations and conclusion](https://arxiv.org/html/2602.11988v3)

### 13. Distillation can change the serving model's size

- **Paper/setup:** Hsieh et al., *Distilling Step-by-Step!*, Findings of ACL 2023; teacher-generated rationales supervise smaller students across four NLP benchmarks. [Paper, v2](https://arxiv.org/abs/2305.02301v2)
- **Result:** A 770M T5 student outperforms few-shot 540B PaLM on one benchmark using 80% of the available dataset, while ordinary fine-tuning of that student fails to match it even with the full dataset. [Abstract](https://arxiv.org/abs/2305.02301v2)
- **Boundary:** This is bounded-task transfer, not equivalence to the teacher on arbitrary tasks or a measured current hosting-price ratio. [Paper and author code](https://github.com/google-research/distilling-step-by-step)

### 14. Context can itself be distilled into weights

- **Paper:** Snell et al., *Learning by Distilling Context*, 2022, proposes training a model to internalise improvements obtained with additional context. [Paper](https://arxiv.org/abs/2209.15189)
- **Boundary:** This makes the two adaptation routes connected: a context-rich teacher can generate a training signal for a context-poor student. It does not establish lossless storage of arbitrary documents. Only the primary abstract was inspected in this pass. [Abstract](https://arxiv.org/abs/2209.15189)

### 15. Small weight updates can have learning/forgetting trade-offs

- **Paper/setup:** Biderman et al., *LoRA Learns Less and Forgets Less*, TMLR 2024; Llama2-7B, code/maths, approximately 100K instruction pairs and 20B continued-pretraining tokens. [Author repository and accepted-version history](https://github.com/danbider/lora-tradeoffs)
- **Result:** Typical low-rank LoRA configurations underperform full fine-tuning on target tasks, while better preserving performance outside the target domain. Freezing base parameters therefore does not guarantee unchanged effective model behaviour. [Paper, v2](https://arxiv.org/abs/2405.09673v2)
- **Related result:** Thinking Machines' 2025 lab study reports matching full fine-tuning with properly configured LoRA on its post-training workloads. It explicitly studies rank, learning rate, layer coverage and data scale. These differently scoped results do not establish that a default LoRA configuration always matches full training. [LoRA Without Regret](https://thinkingmachines.ai/blog/lora/)

### 16. User edits contain several different training signals

- **Paper/setup:** Misra et al., *Principled Fine-tuning of LLMs from User-Edits: A Medley of Preference, Supervision, and Reward*, accepted NeurIPS 2025, arXiv posted 2026-01-27; context, initial response and user edit. [Primary record](https://arxiv.org/abs/2601.19055)
- **Result:** Analyses supervised targets, preferences and edit costs; reports an ensemble outperforming individual-feedback methods on two domains and adapting to differing edit distributions. [Abstract](https://arxiv.org/abs/2601.19055)
- **Boundary:** An edit is richer than a bare thumbs-down. These experiments do not show that a single unstructured complaint automatically becomes a useful gradient update in any commercial product. [Defined data and scope](https://arxiv.org/abs/2601.19055)

### 17. Learned weight adaptation is an active research area

- **SEAL:** Zweiger et al., *Self-Adapting Language Models*, 2025, generates self-edits/training directives, applies SFT, and uses downstream improvement as an RL signal for learning better edits. The persistent change is in weights. Knowledge-incorporation and few-shot experiments are research demonstrations. [Paper, v2](https://arxiv.org/abs/2506.10943v2)
- **Doc-to-LoRA:** Charakorn et al., 2026, trains a hypernetwork that produces a LoRA from new context in one forward pass; subsequent target-model queries need not reread that context. Reports needle retrieval beyond 4× the target model's native window and real-world QA improvements over conventional context distillation. [Paper](https://arxiv.org/abs/2602.15902), [author implementation](https://github.com/SakanaAI/doc-to-lora)
- **Boundary:** Hypernetwork pretraining, supported target models and benchmark-specific generalisation are part of the setup. This is not evidence that Mubit uses these methods or that arbitrary company memory is solved. [Doc-to-LoRA method](https://arxiv.org/abs/2602.15902)

## Evidence limits and reading status

- Methods/results sections were inspected for Mosbach, Ovadia, Gekhman, RAFT, BetterTogether and AGENTS.md; the published long-context paper's abstract and Figure 1 and Lost in the Middle's abstract/method description were inspected. The remaining entries use primary abstracts and/or author documentation, as linked. GEPA's arXiv HTML exceeded the fetch tool's size limit; its abstract and official implementation were available.
- This is a scoped literature search, not a systematic review or meta-analysis. Results use different tasks, models, data rights, training sets, rewards and inference budgets; their percentages cannot be averaged into one advantage for fine-tuning or context.
- None of these experiments was reproduced here. Benchmark gains do not establish error-free outputs, causal production ROI or performance on the team's eventual task.
- Google Scholar search pages were inaccessible through the research tool. ACL Anthology, arXiv and NeurIPS primary records supplied the paper evidence; no citation counts were used as quality measures.

## Sources

- All primary papers, publication records and author implementations are linked within their numbered entries; accessed 2026-10-24. Publication years and inspected arXiv versions are stated separately where they differ.
- See the [evidence map](weight-updates-vs-context.gpt.md) for definitions and Mubit-specific limits, and [industry cases](weight-updates-industry-cases.gpt.md) for deployments rather than benchmark experiments.
