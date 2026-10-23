# Fine-tuning platforms

- **Question:** Which products turn logs or feedback into tuned models, how do data and corrections get in, and what are their minimums, training times and prices as of October 2026?
- **Author:** Claude (Claude Code, Opus 5.5)
- **Date:** 2026-10-23

## Summary

- The managed fine-tuning market contracted in 2025–2026: OpenAI is winding down its fine-tuning platform (no new users; existing customers can create jobs until 2027-01-06); OpenPipe stopped new training and inference on 2026-07-30 after CoreWeave bought it; Predibase was acquired by Rubrik; Mistral's fine-tuning API is listed as deprecated; the Gemini API has had no tunable model since May 2025. [OpenAI SFT guide](https://developers.openai.com/api/docs/guides/supervised-fine-tuning), [developersdigest](https://www.developersdigest.tech/blog/openai-fine-tuning-shutdown-alternatives), [Google](https://ai.google.dev/docs/model_tuning_guidance)
- Still offering tuning: Vertex AI, Amazon Bedrock, Microsoft Foundry, Together AI, Fireworks AI, W&B Training (CoreWeave, includes OpenPipe's ART), Thinking Machines Tinker, Nebius, Alibaba Cloud. [developersdigest](https://www.developersdigest.tech/blog/openai-fine-tuning-shutdown-alternatives) (search summary)
- Corrections enter these products as (a) labelled SFT rows, (b) preference pairs for DPO, or (c) a grader / evaluator / reward function for RFT; none found ingests free-form corrections from a proxy log automatically, except the discontinued OpenPipe log-capture flow.
- Stated minimums are small: OpenAI 10 examples (gains at 50–100); Predibase markets RFT with "10 rows"; Distil Labs "a few dozen". [OpenAI](https://developers.openai.com/api/docs/guides/supervised-fine-tuning), [Predibase](https://predibase.com/blog/introducing-reinforcement-fine-tuning-on-predibase)
- LoRA SFT list prices for ≤ 16B models are about $0.34–0.50 per 1M training tokens (Together, Fireworks, Tinker). [costbench](https://www.costbench.com/software/fine-tuning-apis/together-ai-fine-tuning/), [morphllm](https://www.morphllm.com/fireworks-ai-pricing), [Beam](https://www.beam.cloud/blog/tinker-model-pricing)

## Findings

### Platforms

| Product | Status (Oct 2026) | How data / corrections get in | Minimum | Price (reported) | Source |
| --- | --- | --- | --- | --- | --- |
| OpenAI fine-tuning (SFT, DPO, RFT) | Winding down; no new users; job creation until 2027-01-06; tuned models serve until base model retires; o4-mini (only RFT base) and GPT-4.1 nano shut down 2026-10-23 | JSONL examples; preference pairs; RFT uses a "programmable grader that scores every candidate response" | 10 examples; 50–100 for gains | not checked | [SFT guide](https://developers.openai.com/api/docs/guides/supervised-fine-tuning), [RFT guide](https://developers.openai.com/api/docs/guides/reinforcement-fine-tuning), [developersdigest](https://www.developersdigest.tech/blog/openai-fine-tuning-shutdown-alternatives) |
| OpenPipe (legacy) | Acquired by CoreWeave (Sept 2025); stopped new training and inference 2026-07-30 | SDK captured production prompts and responses as training data; served OpenAI-compatible endpoints | n/a | n/a | [Investing.com](https://www.investing.com/news/company-news/coreweave-to-acquire-openpipe-expanding-ai-reinforcement-learning-capabilities-93CH-4222672), [hokai](https://hokai.io/hub/tools/openpipe), [overmind](https://www.overmindlab.ai/compare/overmind-vs-openpipe) |
| W&B Training (Serverless RL, Serverless SFT) | Public preview | ART framework + RULER verifier; trains LoRAs, stored as W&B artifacts, hosted on W&B Inference | not found | "up to 40%" cheaper, ~1.4× faster (vendor); per-token, rates not published | [W&B docs](https://docs.wandb.ai/training/serverless-rl), [W&B announcement](https://wandb.ai/wandb_fc/product-announcements-fc/reports/Introducing-Serverless-RL--VmlldzoxNDY0MDIzOQ) |
| ART (OpenPipe, open source) | Maintained; Apache 2.0 | GRPO for multi-step agents; client/server split | n/a | free | [hokai](https://hokai.io/hub/tools/openpipe) |
| Predibase | Acquired by Rubrik (reported June 2025, $100M+); pricing page redirects to Rubrik | SFT; RFT with reward functions (SFT warm-up then GRPO) | "10 rows" (marketing) | not found | [Predibase RFT](https://predibase.com/blog/introducing-reinforcement-fine-tuning-on-predibase), [yespress](https://yespress.io/predibase.md) |
| Fireworks AI | Active; Series D, "$1B ARR" (blog title) | SFT; RFT = prompt dataset + evaluator scoring 0.0–1.0 + agent with tools; Fireworks Agent can generate an evaluator from a dataset | not found | LoRA SFT ≤ 16B $0.50/M training tokens; tuned models served at base price | [docs](https://docs.fireworks.ai/fine-tuning/how-rft-works), [evaluators](https://docs.fireworks.ai/fine-tuning/agent/evaluators), [blog](https://fireworks.ai/blog/reinforcement-fine-tuning), [morphllm](https://www.morphllm.com/fireworks-ai-pricing) |
| Together AI | Active; per-model repricing 2026-09-20 | LoRA or full SFT; DPO | not found; per-job minimum charge $4–60 | Qwen3.5 9B $0.34, Gemma 4 31B $1.05, Llama 3.3 70B $2.03 per M (SFT LoRA); DPO 2–4× | [costbench](https://www.costbench.com/software/fine-tuning-apis/together-ai-fine-tuning/), [usagepricing](https://www.usagepricing.com/blueprint/activity/together-ai-2026-09-20-fine-tuning-per-model-repricing), [Together support](https://support.together.ai/articles/7922061943-fine-tuning-pricing) |
| Thinking Machines Tinker | GA since 2025-12-12 | Python API for LoRA SFT and RL on open models; bills prefill, sample and train tokens | n/a | Qwen3-8B train $0.40 → $0.44/M after 2026-07-17 (third-party); $0.10/GB-month adapter storage | [SiliconAngle](https://siliconangle.com/2025/12/12/thinking-machines-makes-tinker-ai-fine-tuning-service-generally-available/), [Tinker](https://www.thinkingmachines.ai/tinker), [Beam](https://www.beam.cloud/blog/tinker-model-pricing) |
| Vertex AI (Gemini tuning) | Active | Supervised tuning on labelled JSONL; Gemini 2.5 Flash up to 1M text examples, 1 GB file, 5,000 validation; Gemini 3.5 Flash 131,072 tokens per example | not found | not checked | [Vertex docs](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini-tuning), [supervised tuning](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/tuning/supervised-tuning) |
| Gemini API (AI Studio) | No tunable model since Gemini 1.5 Flash-001 deprecation (May 2025) | n/a | n/a | n/a | [Google](https://ai.google.dev/docs/model_tuning_guidance) |
| Amazon Bedrock | Active | Fine-tuning for Nova 2 Lite, Nova Lite/Micro/Pro/Canvas, Claude 3 Haiku (us-west-2) | not found | not checked | [Bedrock docs](https://docs.aws.eu/bedrock/latest/userguide/custom-model-fine-tuning.html) |
| Mistral fine-tuning API | Listed as deprecated, "no longer actively supported"; `mistral-finetune` repo reported archived 2026-06-16 | n/a | n/a | n/a | [developersdigest](https://www.developersdigest.tech/models/fine-tuning/mistral) |
| Unsloth (open source) | Active | Local/Colab LoRA SFT and GRPO notebooks | n/a | free; claims ~2× faster, 70% less VRAM; Qwen3-14B fits a free 16 GB T4 | [Unsloth Qwen3 docs](https://unsloth.ai/docs/models/qwen) |
| Distil Labs | Active (vendor claim) | "a prompt and a few dozen training examples"; teacher–student distillation | "a few dozen" | not found | [DevWorld listing](https://app.swapcard.com/event/devworld-conference-2025-1/exhibitor/RXhoaWJpdG9yXzIxNDkzMzQ=) |

### How feedback is represented

- SFT: corrected outputs become target completions (all platforms above).
- DPO: chosen/rejected pairs; Together prices DPO at 2–4× SFT. [costbench](https://www.costbench.com/software/fine-tuning-apis/together-ai-fine-tuning/)
- RFT / RL: a grader (OpenAI), evaluator (Fireworks, 0.0–1.0), reward function (Predibase) or verifier (W&B RULER) replaces labels; Fireworks suggests exact-match on expected function calls, fuzzy match, or LLM-as-judge for tool-using agents. [Fireworks blog](https://fireworks.ai/blog/reinforcement-fine-tuning)
- Log capture: only OpenPipe (now discontinued) and Mubit's proxy (see [mubit-platform.claude.md](mubit-platform.claude.md)) were found to build training sets directly from production traffic.

### Reported results (vendor)

- Fireworks: RFT alpha users "matched or beat closed frontier models" with "10×–40× speedups"; supported bases include Llama, Phi 3/4, Qwen 2.5/3, DeepSeek V3/R1. [Fireworks blog](https://fireworks.ai/blog/reinforcement-fine-tuning) (search summary)

## Gaps

- Training wall-clock times per platform for a ~25–100 example LoRA job: not found.
- Minimum example counts for Together, Fireworks, Vertex and Bedrock: not found.
- OpenAI fine-tuning prices: not checked.
- Third-party OpenAI Evals shutdown claim (read-only 2026-10-31, shutdown 2026-11-30): not confirmed on OpenAI's pages.
- All vendor pages were read via search summaries; vendor sites were not opened (network policy).

## Sources

- [OpenAI supervised fine-tuning guide](https://developers.openai.com/api/docs/guides/supervised-fine-tuning); [RFT guide](https://developers.openai.com/api/docs/guides/reinforcement-fine-tuning); [OpenAI deprecations](https://developers.openai.com/api/docs/deprecations), accessed 2026-10-23
- [developersdigest: OpenAI fine-tuning shutdown alternatives](https://www.developersdigest.tech/blog/openai-fine-tuning-shutdown-alternatives); [Mistral page](https://www.developersdigest.tech/models/fine-tuning/mistral), accessed 2026-10-23
- [Investing.com: CoreWeave to acquire OpenPipe](https://www.investing.com/news/company-news/coreweave-to-acquire-openpipe-expanding-ai-reinforcement-learning-capabilities-93CH-4222672); [hokai](https://hokai.io/hub/tools/openpipe); [overmind](https://www.overmindlab.ai/compare/overmind-vs-openpipe), accessed 2026-10-23
- [W&B Serverless RL docs](https://docs.wandb.ai/training/serverless-rl); [announcement](https://wandb.ai/wandb_fc/product-announcements-fc/reports/Introducing-Serverless-RL--VmlldzoxNDY0MDIzOQ), accessed 2026-10-23
- [Predibase RFT](https://predibase.com/blog/introducing-reinforcement-fine-tuning-on-predibase); [yespress](https://yespress.io/predibase.md), accessed 2026-10-23
- [Fireworks RFT docs](https://docs.fireworks.ai/fine-tuning/how-rft-works); [evaluators](https://docs.fireworks.ai/fine-tuning/agent/evaluators); [blog](https://fireworks.ai/blog/reinforcement-fine-tuning); [morphllm](https://www.morphllm.com/fireworks-ai-pricing), accessed 2026-10-23
- [costbench: Together](https://www.costbench.com/software/fine-tuning-apis/together-ai-fine-tuning/); [usagepricing](https://www.usagepricing.com/blueprint/activity/together-ai-2026-09-20-fine-tuning-per-model-repricing), accessed 2026-10-23
- [SiliconAngle: Tinker GA](https://siliconangle.com/2025/12/12/thinking-machines-makes-tinker-ai-fine-tuning-service-generally-available/); [Beam: Tinker pricing](https://www.beam.cloud/blog/tinker-model-pricing), accessed 2026-10-23
- [Vertex AI Gemini tuning](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini-tuning); [Google model tuning guidance](https://ai.google.dev/docs/model_tuning_guidance); [Bedrock fine-tuning](https://docs.aws.eu/bedrock/latest/userguide/custom-model-fine-tuning.html), accessed 2026-10-23
- [Unsloth Qwen3 docs](https://unsloth.ai/docs/models/qwen), accessed 2026-10-23
