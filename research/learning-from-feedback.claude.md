# Learning from feedback (weight updates)

- **Question:** What does 2024–2026 research say about updating model weights from corrections, ratings and feedback, and about forgetting?
- **Author:** Claude (Claude Code, Opus 5.5)
- **Date:** 2026-10-23

## Summary

- User edits can be used three ways for training: as supervised targets, as preference pairs (edited ≻ original), and as a reward via edit distance; a NeurIPS 2025 paper reports that ensembling all three beats any one. [Misra et al.](https://arxiv.org/html/2601.19055)
- Binary good/bad feedback is enough for preference training: KTO reports matching or beating DPO at 1B–30B without paired data. [KTO](https://arxiv.org/html/2402.01306v3)
- LoRA "learns less and forgets less" than full fine-tuning; Thinking Machines (2025) reports LoRA matches full fine-tuning on small datasets and, for RL, even at rank 1 (lab blog, partly replicated). [Biderman et al.](https://mlanthology.org/tmlr/2024/biderman2024tmlr-lora), [LoRA Without Regret](https://huggingface.co/docs/trl/main/en/lora_without_regret)
- Forgetting is the main measured risk of sequential updates: learning a stream of new facts dropped NaturalQuestions F1 by 89% (full fine-tuning), 71% (LoRA) and 11% (sparse memory fine-tuning). [Lin et al.](https://arxiv.org/pdf/2510.15103)
- Hypernetworks can now produce a LoRA from a task description or document in one forward pass (Text-to-LoRA, Doc-to-LoRA, Drag-and-Drop LLMs), with sub-second update latency claimed. [Sakana](https://sakana.ai/doc-to-lora/), [DnD](https://arxiv.org/pdf/2506.16406)

## Findings

### Turning corrections into training signal

- "Principled Fine-tuning of LLMs from User-Edits" (Misra, Pacchiano, Chi, Gao; NeurIPS 2025; arXiv 2601.19055): treats an edit y′ of model output y as (1) a supervised target, (2) a preference y′ ≻ y, (3) a cost via edit distance; an ensemble of the three outperforms single-signal methods and adapts when the edit distribution shifts at test time. [paper](https://arxiv.org/html/2601.19055), [NeurIPS](https://proceedings.neurips.cc/paper_files/paper/2025/file/f6d8ecbfd29e7ad87627758fadf8a7c6-Paper-Conference.pdf) (search summary)
- "Aligning LLM Agents by Learning Latent Preference from User Edits" (2024) learns a latent preference description from edits. [arXiv 2404.15269](https://arxiv.org/pdf/2404.15269) (search result; details not read)
- Fine-grained natural-language critiques and span-level feedback have been used as training data: arXiv 2407.02397 (targeted refinement edits) and arXiv 2512.23693 (annotators mark liked and disliked spans and explain why). [2407.02397](https://arxiv.org/pdf/2407.02397), [2512.23693](https://awesomepapers.io/llm-papers/papers/2512.23693) (search summaries)
- A TACL 2024 survey of self-correction notes that self-corrective learning selects model-generated feedback that successfully refines responses as training data. [TACL](https://direct.mit.edu/tacl/article/doi/10.1162/tacl_a_00713/125177/When-Can-LLMs-Actually-Correct-Their-Own-Mistakes) (search summary)

### Preference and reward objectives

- DPO (Rafailov et al., 2023) optimises directly on chosen/rejected pairs without a separate reward model. [arXiv 2305.18290](https://arxiv.org/abs/2305.18290)
- KTO (Ethayarajh et al., ICML 2024) needs only a binary desirable/undesirable label per output; reports matching or exceeding DPO from 1B to 30B parameters; a third-party review reports it holds up with up to 90% fewer desirable examples. [arXiv 2402.01306](https://arxiv.org/html/2402.01306v3), [review](https://liner.com/review/kto-model-alignment-as-prospect-theoretic-optimization) (search summaries)
- ORPO (Hong et al., 2024) folds a preference penalty into the SFT loss with no reference model. [arXiv 2403.07691](https://arxiv.org/abs/2403.07691)
- GRPO (DeepSeekMath, 2024) is the group-relative policy optimisation used for RL with verifiable rewards. [arXiv 2402.03300](https://arxiv.org/abs/2402.03300)

### How much data and what rank

- OpenAI's SFT guide: minimum 10 examples; "50–100 examples" typically produce improvements; start with about 50 and evaluate. The same page says OpenAI is winding down its fine-tuning platform: no new users, existing users can create jobs "for the coming months". [OpenAI SFT guide](https://developers.openai.com/api/docs/guides/supervised-fine-tuning) (search summary)
- "LoRA Without Regret" (Thinking Machines, 2025-09-29): LoRA matches full fine-tuning when data is small and not pretraining-scale; for RL, rank-1 LoRA matches full fine-tuning because policy gradients carry about one bit per episode; best LoRA learning rate ≈ 10× full fine-tuning (≈ 15× for ~100-step runs); attention-only LoRA underperforms, so include MLP/MoE layers. A Hugging Face replication on Qwen3-0.6B only partly held. [TRL docs](https://huggingface.co/docs/trl/main/en/lora_without_regret), [summary](https://www.beri.net/learning/thinking-machines-lora-without-regret) (search summaries; lab blog, not peer reviewed)
- "LoRA Learns Less and Forgets Less" (Biderman et al., TMLR 2024; Llama-2 7B/13B, code and maths): LoRA substantially underperforms full fine-tuning at standard low ranks, most in continued pretraining; full fine-tuning learns perturbations of 10–100× higher rank; LoRA better preserves out-of-domain performance. [TMLR](https://mlanthology.org/tmlr/2024/biderman2024tmlr-lora) (search summary)

### Forgetting and sequential updates

- Sparse memory fine-tuning (Meta FAIR and UC Berkeley, arXiv 2510.15103, 2025-10-16; 1.3B model): updates only memory-layer slots accessed more on the new batch than on background data (TF-IDF ranking); NaturalQuestions F1 drop after learning TriviaQA facts: full fine-tuning −89%, LoRA −71%, sparse memory −11% at the same new-fact retention. [arXiv 2510.15103](https://arxiv.org/pdf/2510.15103) (search summary)
- "RL's Razor" (Shenfeld, Pari, Agrawal; MIT; ICLR 2026): on-policy RL forgets less than SFT at equal new-task performance; forgetting tracks KL divergence from the base model, and RL tends towards the KL-closest solution. [arXiv 2509.04259](https://arxiv.org/pdf/2509.04259) (search summary)
- On-policy distillation (Thinking Machines, 2025): matched RL on AIME'24 with about 1,800 vs 17,920 GPU hours; in a personalisation run, mid-training on internal documents dropped IF-eval 85% → 79%, and on-policy distillation recovered it to 83% while internal QA rose to 41%. Requires a stronger teacher. [Maginative](https://www.maginative.com/article/thinking-machines-claims-30x-cost-cut-for-training-ai-models/) (search summary; lab-reported)
- Continual LoRA methods in 2026 include ProCL (library of specialist adapters, arXiv 2605.13162) and ReCoLoRA (spectrum-aware consolidation, arXiv 2607.07719, six-task GLUE sequence). [ProCL](https://arxiv.org/abs/2605.13162), [ReCoLoRA](https://arxiv.org/abs/2607.07719) (search summaries)
- A self-adaptive continual instruction-tuning framework keeps the deployed checkpoint when a candidate does not beat it (a promotion gate). [arXiv 2503.15924](https://arxiv.org/pdf/2503.15924) (search summary)
- Google's Nested Learning / HOPE (NeurIPS 2025) frames a model as nested optimisation problems to reduce catastrophic forgetting; claims come from Google's announcement. [Google Research](https://research.google/blog/introducing-nested-learning-a-new-ml-paradigm-for-continual-learning) (search summary)

### Fast or self-directed weight updates

- Test-time training (Akyürek et al., MIT, 2024; v2 March 2025): per-instance LoRA training at inference reaches 53.0% on ARC public validation with an 8B model (up to 6× over the fine-tuned baseline) and 61.9% ensembled with program synthesis. [arXiv 2411.07279](https://arxiv.org/abs/2411.07279v2) (search summary)
- SEAL (MIT, arXiv 2506.10943, 2025): the model generates its own fine-tuning data ("self-edits"), applies them by SFT, and is trained with RL to produce edits that improve downstream performance. [arXiv 2506.10943](https://arxiv.org/pdf/2506.10943) (search summary; benchmark numbers not confirmed)
- Text-to-LoRA (Sakana, ICML 2025): hypernetwork maps a natural-language task description to a LoRA; compresses hundreds of LoRAs and generalises zero-shot to unseen tasks. [Sakana](https://sakana.ai/text-to-lora/) (search summary)
- Doc-to-LoRA (Sakana, ICML 2026): hypernetwork turns a document into a LoRA in one forward pass with sub-second latency; beats context distillation with lower peak memory; near-perfect needle-in-a-haystack beyond 4× the native context; base model in slides Gemma-2-2b-it; code at `SakanaAI/doc-to-lora`. [Sakana](https://sakana.ai/doc-to-lora/), [PMLR](https://proceedings.mlr.press/v306/charakorn26a.html) (search summaries)
- Drag-and-Drop LLMs (NeurIPS 2025): maps a handful of unlabelled task prompts to LoRA weights; claims up to 12,000× lower overhead than full fine-tuning and up to 30% gains over the strongest trained LoRAs on unseen benchmarks. [arXiv 2506.16406](https://arxiv.org/pdf/2506.16406) (search summary)

## Gaps

- No 2026 paper found that measures online LoRA updates driven by live user corrections in production.
- Number of corrections needed before an adapter measurably changes behaviour on a narrow task: not found beyond OpenAI's "50–100" guidance.
- Papers were not opened directly (arxiv.org blocked from this environment); figures come from search summaries of abstracts and project pages.

## Sources

- [Misra et al., Principled Fine-tuning of LLMs from User-Edits](https://arxiv.org/html/2601.19055), accessed 2026-10-23
- [Ethayarajh et al., KTO](https://arxiv.org/html/2402.01306v3), accessed 2026-10-23
- [Rafailov et al., DPO](https://arxiv.org/abs/2305.18290); [Hong et al., ORPO](https://arxiv.org/abs/2403.07691); [DeepSeekMath / GRPO](https://arxiv.org/abs/2402.03300)
- [Thinking Machines, LoRA Without Regret (via TRL docs)](https://huggingface.co/docs/trl/main/en/lora_without_regret), accessed 2026-10-23
- [Biderman et al., LoRA Learns Less and Forgets Less](https://mlanthology.org/tmlr/2024/biderman2024tmlr-lora), accessed 2026-10-23
- [Continual Learning via Sparse Memory Finetuning](https://arxiv.org/pdf/2510.15103), accessed 2026-10-23
- [RL's Razor](https://arxiv.org/pdf/2509.04259), accessed 2026-10-23
- [Maginative on on-policy distillation](https://www.maginative.com/article/thinking-machines-claims-30x-cost-cut-for-training-ai-models/), accessed 2026-10-23
- [ProCL](https://arxiv.org/abs/2605.13162), [ReCoLoRA](https://arxiv.org/abs/2607.07719), [Self-adaptive CIT](https://arxiv.org/pdf/2503.15924), accessed 2026-10-23
- [Google Research: Nested Learning](https://research.google/blog/introducing-nested-learning-a-new-ml-paradigm-for-continual-learning), accessed 2026-10-23
- [Akyürek et al., Test-Time Training](https://arxiv.org/abs/2411.07279v2); [SEAL](https://arxiv.org/pdf/2506.10943); [Text-to-LoRA](https://sakana.ai/text-to-lora/); [Doc-to-LoRA](https://sakana.ai/doc-to-lora/); [Drag-and-Drop LLMs](https://arxiv.org/pdf/2506.16406), accessed 2026-10-23
- [OpenAI supervised fine-tuning guide](https://developers.openai.com/api/docs/guides/supervised-fine-tuning), accessed 2026-10-23
