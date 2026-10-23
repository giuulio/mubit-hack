# Task-specific small models

- **Question:** What is published about replacing a closed-model workload with a small task-adapted open model (LoRA, distillation, serving), including quality, cost and latency numbers?
- **Author:** Claude (Claude Code, Opus 5.5)
- **Date:** 2026-10-23

## Summary

- LoRA Land (Predibase, 2024): 224 of 310 LoRA fine-tunes across 10 base models and 31 tasks beat GPT-4; average gain +34 points over base and +10 over GPT-4; GPT-4 kept the lead on broad tasks (coding, MMLU). Vendor-authored. [arXiv 2405.00732](https://arxiv.org/pdf/2405.00732)
- Gains concentrate on narrow tasks such as classification; a 2024 study found fine-tuned Mistral-7B at 0.75 vs three-shot GPT-4-Turbo at 0.72 on fact-checking, but inference cost was comparable. [arXiv 2405.16820](https://arxiv.org/pdf/2405.16820)
- Many LoRA adapters can share one base model on one GPU: S-LoRA (up to 4× throughput vs PEFT/vLLM naive LoRA), Punica (12× vs prior systems, ~2 ms/token added), LoRAX (Apache 2.0). [S-LoRA](https://arxiv.org/abs/2311.03285v2), [Punica](https://proceedings.mlsys.org/paper_files/paper/2024/file/054de805fcceb78a201f5e9d53c85908-Paper-Conference.pdf), [LoRAX](https://predibase.com/blog/lorax-the-open-source-framework-for-serving-100s-of-fine-tuned-llms-in)
- NVIDIA's 2025 position paper argues small models suit narrow, repetitive agent subtasks and proposes an LLM-to-SLM conversion algorithm; it is a position paper, not an empirical proof. [arXiv 2506.02153](https://arxiv.org/pdf/2506.02153)
- Closed-model churn is current: OpenAI notified developers on 2026-10-14 that `gpt-4o-2024-08-06` and `gpt-4o-2024-11-20` leave the API on 2027-01-14, recommending `gpt-6-luna`. [OpenAI deprecations](https://developers.openai.com/api/docs/deprecations)

## Findings

### Quality of task-adapted small models

- LoRA Land: 4-bit LoRA fine-tunes; best fine-tuned models average 0.756 vs GPT-4 0.661; Mistral-7B top on the most tasks (10/31), Zephyr highest average (0.731); 25 Mistral-7B adapters fine-tuned for under $8.00 each on average and served from one A100 with LoRAX. A Hugging Face commenter called the report an advertisement. [arXiv 2405.00732](https://arxiv.org/pdf/2405.00732), [Predibase blog](https://predibase.com/blog/lora-land-fine-tuned-open-source-llms-that-outperform-gpt-4) (search summaries)
- "Laboratory-Scale AI" (2024): fine-tuned Mistral-7B-Instruct 0.75 vs three-shot GPT-4-Turbo 0.72 on fact-checking; inference with GPT-4-Turbo on the test set cost about the same as fine-tuning plus inference with an open model. [arXiv 2405.16820](https://arxiv.org/pdf/2405.16820) (search summary)
- CONSCENDI (2023, guardrail models): distilled fine-tuned GPT-3-class models were 2–4× faster and up to 200× cheaper than GPT-4 on the guardrail task. [arXiv 2304.14364](https://arxiv.org/pdf/2304.14364) (search summary)
- Distil Labs (vendor) markets fine-tuning "with just a prompt and a few dozen training examples"; a post linked to the company reports text-to-SQL with Qwen3-0.6B: base 36%, DeepSeek-V3 teacher 80%, fine-tuned 74% (LLM-as-judge). [DevWorld listing](https://app.swapcard.com/event/devworld-conference-2025-1/exhibitor/RXhoaWJpdG9yXzIxNDkzMzQ=), [Reddit snapshot](https://reddit.sentinel-team.org/posts/1qiu6jo/snapshots/2026-01-21T17%3A11%3A35.0614Z) (search summaries; vendor claim)
- Reward distillation (arXiv 2502.19557): a 3B student surpassed its teacher on GSM8K, 83.02% vs 80.97%. [arXiv 2502.19557](https://arxiv.org/pdf/2502.19557) (search summary)
- Mubit's own Banyan Sapling is a LoRA-adapted, pruned Qwen3-30B-A3B for one task (claim verification); see [mubit-ecosystem.claude.md](mubit-ecosystem.claude.md).

### Position and survey work

- "Small Language Models are the Future of Agentic AI" (NVIDIA Research and Georgia Tech, arXiv 2506.02153, June 2025): argues SLMs are sufficient, better suited and cheaper for narrow, repetitive agent subtasks; recommends heterogeneous systems where general conversation is needed; outlines an LLM-to-SLM conversion algorithm. A secondary summary attributes to it an estimate that 40–70% of queries in MetaGPT, Open Operator and Cradle are replaceable; not confirmed against the paper. [arXiv 2506.02153](https://arxiv.org/pdf/2506.02153) (search summary)

### Serving many adapters

- S-LoRA (arXiv 2311.03285): keeps all adapters in host memory and fetches active ones to GPU; Unified Paging pools adapter weights and KV cache; up to 4× throughput and orders of magnitude more adapters than Hugging Face PEFT or vLLM's naive LoRA. [arXiv](https://arxiv.org/abs/2311.03285v2) (search summary)
- Punica (MLSys 2024): SGMV CUDA kernel batches requests across different LoRAs over one base-model copy; 12× throughput vs state-of-the-art systems on a fixed cluster, ~2 ms added latency per token. [MLSys](https://proceedings.mlsys.org/paper_files/paper/2024/file/054de805fcceb78a201f5e9d53c85908-Paper-Conference.pdf) (search summary)
- LoRAX (Predibase, Apache 2.0, forked from TGI v0.9.4): dynamic adapter loading per request, tiered GPU/CPU/disk caching, SGMV kernels, TGI-compatible REST API. [Predibase](https://predibase.com/blog/lorax-the-open-source-framework-for-serving-100s-of-fine-tuned-llms-in) (search summary)
- vLLM has adopted multi-LoRA serving; with many adapters, constant loading and offloading degrades throughput. [arXiv 2407.00066](https://arxiv.org/html/2407.00066v3) (search summary)
- Pioneer (blog): with a fixed adapter cache, exceeding it turned requests into disk reads (~44× throughput drop, p95 ~100× worse); after fixes, one L4 served 1,024 GLiNER2 (~205M) adapters at ~97 req/s, p95 177 ms. [Pioneer](https://pioneer.ai/blog/the-33rd-adapter-problem-how-we-got-44x-more-throughput-from-one-l4) (search summary; vendor-reported)

### Cost references

- Fireworks: reported serverless rates $0.10/M tokens (< 4B), $0.20/M (4–16B), $0.90/M (> 16B); LoRA SFT up to 16B at $0.50 per 1M training tokens; listings say fine-tuned models are served at base-model price. [morphllm](https://www.morphllm.com/fireworks-ai-pricing), [GetApp](https://www.getapp.com/all-software/a/fireworks-ai/) (search summaries; third-party, around July 2026)
- `gpt-6-luna` reported at $0.10/M input and $0.50/M output vs GPT-4o $2.50 / $10. [cellcog](https://cellcog.ai/blog/gpt-4o-api-shutdown/) (search summary; third-party)
- Nadir reports `gpt-4o-2024-05-13` ($5 / $15 per M) retiring 2026-10-23 with suggested replacement `gpt-5.6-sol` at $5 / $30; not confirmed on OpenAI's page. [Nadir](https://getnadir.com/blog/openai-october-23-model-retirement-replacement-price-hike/) (search summary)
- Mubit pricing: $5 per 1,000 runs (≤ 8K tokens each), no token markup. [HACKATHON.md](../HACKATHON.md)

## Gaps

- No independent (non-vendor) before/after case study with cost, p50/p95 latency and accuracy on one eval set was found for replacing GPT-4o-class models with a small fine-tune.
- Together AI LoRA inference pricing: not found.
- Which base models Mubit adapters use, and their latency: not found.

## Sources

- [LoRA Land](https://arxiv.org/pdf/2405.00732) and [Predibase blog](https://predibase.com/blog/lora-land-fine-tuned-open-source-llms-that-outperform-gpt-4), accessed 2026-10-23
- [Laboratory-Scale AI](https://arxiv.org/pdf/2405.16820); [CONSCENDI](https://arxiv.org/pdf/2304.14364); [Reward distillation](https://arxiv.org/pdf/2502.19557), accessed 2026-10-23
- [Small Language Models are the Future of Agentic AI](https://arxiv.org/pdf/2506.02153), accessed 2026-10-23
- [S-LoRA](https://arxiv.org/abs/2311.03285v2); [Punica](https://proceedings.mlsys.org/paper_files/paper/2024/file/054de805fcceb78a201f5e9d53c85908-Paper-Conference.pdf); [LoRAX](https://predibase.com/blog/lorax-the-open-source-framework-for-serving-100s-of-fine-tuned-llms-in); [Compress then Serve](https://arxiv.org/html/2407.00066v3); [Pioneer](https://pioneer.ai/blog/the-33rd-adapter-problem-how-we-got-44x-more-throughput-from-one-l4), accessed 2026-10-23
- [OpenAI deprecations](https://developers.openai.com/api/docs/deprecations); [cellcog](https://cellcog.ai/blog/gpt-4o-api-shutdown/); [Nadir](https://getnadir.com/blog/openai-october-23-model-retirement-replacement-price-hike/), accessed 2026-10-23
- [Fireworks pricing (morphllm)](https://www.morphllm.com/fireworks-ai-pricing), accessed 2026-10-23
- All via web search summaries; arxiv.org and vendor sites were not opened (network policy).
