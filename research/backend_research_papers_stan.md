# Research papers: context vs weights

Papers considered for the Night Shift (Mubit) hackathon while deciding when knowledge should live in **context** (prompt, memory, retrieval) and when it should go into **weights** (post-training / adapters). Every arXiv ID below was checked against the arXiv API on 2026-10-24.

## Recommended: Dual-Layer Agentic Memory

**Li et al., 2026, [Dual-Layer Agentic Memory with Fast Write Routing and Slow Consolidation](https://arxiv.org/abs/2608.22215)**

The paper directly addresses the problem we care about: "deciding what to externalize, update, or ultimately internalize." It does not predict this from content. It measures the model's behaviour, which matches the Mubit founder's point that the decision cannot be made from a single data point.

- **Behavioural labels:** probe the model without the knowledge, then with it in context.
  - Correct without it → `non-write`.
  - Refuses without it, correct with it → `write-new`.
  - Confidently wrong without it, correct with it → `write-update`.
- **Fast write routing:** decide whether to store or discard each incoming item, using a 1.7B → 8B cascade of learned routers.
- **Slow consolidation:** fine-tune on the stored items. An item is evicted from external memory **only if the updated model answers its probes without retrieval** (accuracy ≥ τ_flush).
- **Results (ZsRE facts, Qwen3-8B):** keeps more than 98% of store-everything accuracy while pruning up to 68% of memory. Consolidation cuts storage to 32%.
  - 10,683 facts were internalized.
  - 7,939 were only partially absorbed.
  - 1,752 previously known facts were broken by forgetting. This is why the external layer stays as an override.

**Why it fits the hackathon and Mubit:**

| Paper component | On Mubit | Status |
|---|---|---|
| Behavioural labels (Sec. 3.1, App. A) | Probe the provider with and without the rule; grade both outputs | Implement as written |
| Validated eviction (Sec. 3.4) | Run the adapter without the rule; pass rate ≥ τ → graduate it | Implement as written |
| Label transition matrix (Table 2) | Count internalized / partial / interference per rule before and after the adapter | Implement as written |
| Learned router on hidden states, plus cascade | Hidden states are not exposed through provider APIs | Replace with the behavioural probe (the paper's own ground truth) |
| SFT consolidation | Record grader-passing calls so Mubit trains the adapter | Replace |

**Our extensions:**
1. Go from facts to **skills and style on a recurring production task**.
2. Add a **never-train** label for volatile knowledge. The paper names "temporally conflicting updates" as an open limitation.
3. Measure skills vs facts empirically. Mubit's training examples include the rule in the input, so we expect output-wide rules to be internalized, while input-specific facts are mostly learned as "copy from context."

**Practical caveats:**
- Failed probes must not become training data, because a Bad rating does not exclude a call from training. Send probes with `x-middleware-record: metadata`, then replay the passing ones with recording on (temperature 0).
- Validation needs adapter calls. Confirm with staff how to call a passing adapter programmatically; Try models allows about 50 calls per day.

### Why not the others

| Paper | Feasible on Mubit? | Reason |
|---|---|---|
| Context distillation / Prompt Baking | No | Needs a stripped-prompt input paired with the prompted model's output (Mubit records the real input). Prompt Baking also needs logits. |
| Cartridges | No | Trains a KV cache directly. |
| SEAL | No | Needs an RL loop over many weight updates; we get one or two. |
| Test-time training | No | Needs per-task weight updates within minutes. |
| Auto-Dreamer | Partly | Consolidation stays in text memory only, so there is no weight update. That fails the judging criterion "show a correction turning into a model update." |
| Mallen 2023, Self-RAG, Adaptive-RAG | Partly | Per-query retrieval decisions, not what to learn into weights. |

---

## 1. Closest work: what to keep in context vs move into weights

- **Li et al. 2026**, [Dual-Layer Agentic Memory with Fast Write Routing and Slow Consolidation](https://arxiv.org/abs/2608.22215). The recommended paper above.
- **Ye et al. 2026**, [Auto-Dreamer: Learning Offline Memory Consolidation for Language Agents](https://arxiv.org/abs/2605.20616).
  - An RL-trained (GRPO) consolidator rewrites the text memory bank; the weights stay frozen.
  - ScienceWorld success: 41.1% vs 34.1%, with about 12× fewer memory tokens.
- **Pink et al. 2025**, [Position: Episodic Memory is the Missing Piece for Long-Term LLM Agents](https://arxiv.org/abs/2502.06975). Argues from Complementary Learning Systems (CLS) theory for fast episodic memory plus slow consolidation.
- **Hsing 2026**, [MIRROR: Complementary Encoding and Reconstructive Consolidation for Persistent State in LLM Systems](https://openreview.net/forum?id=IviO4bIZc7). ICLR 2026 workshop; not on arXiv.
- Background theory (not on arXiv):
  - McClelland, McNaughton & O'Reilly 1995, *Why there are complementary learning systems in the hippocampus and neocortex*.
  - Kumaran, Hassabis & McClelland 2016, *What learning systems do intelligent agents need?*

## 2. Theory: in-context vs in-weight learning

- **Chan et al. 2024 (ICLR 2025)**, [Toward Understanding In-context vs. In-weight Learning](https://arxiv.org/abs/2410.23042). Models a gate between in-context and in-weight predictors; fine-tuning can make memorized weights override context.
- [The dynamic interplay between in-context and in-weight learning in humans and neural networks](https://arxiv.org/abs/2402.08674) (2024).
- [Contrast Matters: Understanding Robustness of In-Context Fine-Tuning to Target-Context Relatedness](https://arxiv.org/abs/2604.01601) (2026). Fine-tuning with in-context examples, and how that preserves in-context ability.
- **Lampinen et al. 2025**, [On the generalization of language models from in-context learning and finetuning: a controlled study](https://arxiv.org/abs/2505.00661). In-context learning generalizes more flexibly. Augmenting fine-tuning data with in-context inferences closes the gap.
- **Berglund et al. 2023**, [The Reversal Curse: LLMs trained on "A is B" fail to learn "B is A"](https://arxiv.org/abs/2309.12288).

## 3. Per-query routing: answer from weights or retrieve?

- **Mallen et al. 2023**, [When Not to Trust Language Models: Investigating Effectiveness of Parametric and Non-Parametric Memories](https://arxiv.org/abs/2212.10511). Retrieve only for less popular (long-tail) entities.
- **Asai et al. 2023**, [Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection](https://arxiv.org/abs/2310.11511).
- **Jeong et al. 2024**, [Adaptive-RAG: Learning to Adapt Retrieval-Augmented LLMs through Question Complexity](https://arxiv.org/abs/2403.14403).
- **Labruna et al. 2024**, [When to Retrieve: Teaching LLMs to Utilize Information Retrieval Effectively](https://arxiv.org/abs/2404.19705).
- **Wu et al. 2025**, [Self-Routing RAG: Binding Selective Retrieval with Knowledge Verbalization](https://arxiv.org/abs/2504.01018).
- [RAGRouter: Learning to Route Queries to Multiple Retrieval-Augmented Language Models](https://arxiv.org/abs/2505.23052) (2025).

## 4. Mechanisms for moving context into weights

- **Askell et al. 2021**, [A General Language Assistant as a Laboratory for Alignment](https://arxiv.org/abs/2112.00861). Introduces context distillation.
- **Snell et al. 2022**, [Learning by Distilling Context](https://arxiv.org/abs/2209.15189).
- **Bhargava et al. 2024**, [Prompt Baking](https://arxiv.org/abs/2409.13697).
- **Eyuboglu et al. 2025**, [Cartridges: Lightweight and general-purpose long context representations via self-study](https://arxiv.org/abs/2506.06266).
- **Zweiger et al. 2025**, [Self-Adapting Language Models (SEAL)](https://arxiv.org/abs/2506.10943).
- **Charakorn et al. 2025**, [Text-to-LoRA: Instant Transformer Adaption](https://arxiv.org/abs/2506.06105).
- **Akyürek et al. 2024**, [The Surprising Effectiveness of Test-Time Training for Few-Shot Learning](https://arxiv.org/abs/2411.07279). Abstract reasoning (ARC).

## 5. Empirical comparisons: fine-tuning vs context

**Where post-training wins:**
- **Liu et al. 2022**, [Few-Shot Parameter-Efficient Fine-Tuning is Better and Cheaper than In-Context Learning](https://arxiv.org/abs/2205.05638) (T-Few).
- **Mosbach et al. 2023**, [Few-shot Fine-tuning vs. In-context Learning: A Fair Comparison and Evaluation](https://arxiv.org/abs/2305.16938).
- **Bucher & Martini 2024**, [Fine-Tuned 'Small' LLMs (Still) Significantly Outperform Zero-Shot Generative AI Models in Text Classification](https://arxiv.org/abs/2406.08660).
- **Zhao et al. 2024**, [LoRA Land: 310 Fine-tuned LLMs that Rival GPT-4](https://arxiv.org/abs/2405.00732).
- **Hsieh et al. 2023**, [Distilling Step-by-Step!](https://arxiv.org/abs/2305.02301).
- **DeepSeek-AI 2025**, [DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via RL](https://arxiv.org/abs/2501.12948).
- **Patil et al. 2023**, [Gorilla: Large Language Model Connected with Massive APIs](https://arxiv.org/abs/2305.15334).
- **Zhang et al. 2024**, [RAFT: Adapting Language Model to Domain Specific RAG](https://arxiv.org/abs/2403.10131).
- **Gururangan et al. 2020**, [Don't Stop Pretraining: Adapt Language Models to Domains and Tasks](https://arxiv.org/abs/2004.10964).

**Where context wins, or the evidence is mixed:**
- **Ovadia et al. 2023**, [Fine-Tuning or Retrieval? Comparing Knowledge Injection in LLMs](https://arxiv.org/abs/2312.05934).
- **Gekhman et al. 2024**, [Does Fine-Tuning LLMs on New Knowledge Encourage Hallucinations?](https://arxiv.org/abs/2405.05904)
- **Soudani et al. 2024**, [Fine Tuning vs. Retrieval Augmented Generation for Less Popular Knowledge](https://arxiv.org/abs/2403.01432).
- **Balaguer et al. 2024**, [RAG vs Fine-tuning: Pipelines, Tradeoffs, and a Case Study on Agriculture](https://arxiv.org/abs/2401.08406).
- **Bertsch et al. 2024**, [In-Context Learning with Long-Context Models: An In-Depth Exploration](https://arxiv.org/abs/2405.00200).
- **Agarwal et al. 2024**, [Many-Shot In-Context Learning](https://arxiv.org/abs/2404.11018).
- **Nori et al. 2023**, [Can Generalist Foundation Models Outcompete Special-Purpose Tuning? Case Study in Medicine](https://arxiv.org/abs/2311.16452) (Medprompt).
- **Zhou et al. 2023**, [LIMA: Less Is More for Alignment](https://arxiv.org/abs/2305.11206).
- **Lin et al. 2023**, [The Unlocking Spell on Base LLMs: Rethinking Alignment via In-Context Learning](https://arxiv.org/abs/2312.01552) (URIAL).
- **Yue et al. 2025**, [Does Reinforcement Learning Really Incentivize Reasoning Capacity in LLMs Beyond the Base Model?](https://arxiv.org/abs/2504.13837)

**Caveats for both approaches:**
- **Liu et al. 2023**, [Lost in the Middle: How Language Models Use Long Contexts](https://arxiv.org/abs/2307.03172). Long contexts degrade.
- **Qi et al. 2023**, [Fine-tuning Aligned Language Models Compromises Safety](https://arxiv.org/abs/2310.03693).

## 6. Icon / SVG generation evaluation (alternative task idea)

- **Rodriguez et al. 2023 (CVPR 2025)**, [StarVector: Generating Scalable Vector Graphics Code from Images and Text](https://arxiv.org/abs/2312.11556). Includes the SVG-Bench benchmark.
- **Rodriguez et al. 2025**, [Rendering-Aware Reinforcement Learning for Vector Graphics Generation](https://arxiv.org/abs/2505.20793) (RLRF). Render feedback used as the reward.
- **Wu et al. 2023**, [IconShop: Text-Guided Vector Icon Synthesis with Autoregressive Transformers](https://arxiv.org/abs/2304.14400).
- **Yang et al. 2025**, [OmniSVG: A Unified Scalable Vector Graphics Generation Model](https://arxiv.org/abs/2504.06263) (MMSVG dataset).
- **Zou et al. 2024**, [VGBench: Evaluating LLMs on Vector Graphics Understanding and Generation](https://arxiv.org/abs/2407.10972).
- **Qiu et al. 2024**, [Can Large Language Models Understand Symbolic Graphics Programs?](https://arxiv.org/abs/2408.08313) (SGP-Bench).
- [SVGenius: Benchmarking LLMs in SVG Understanding, Editing and Generation](https://arxiv.org/abs/2506.03139) (2025).
