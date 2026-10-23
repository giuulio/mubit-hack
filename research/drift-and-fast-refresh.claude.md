# Drift and fast refresh

- **Question:** How do LLM workloads and models drift, what is known about refreshing models for changing data, and which live public data feeds could drive a demo?
- **Author:** Claude (Claude Code, Opus 5.5)
- **Date:** 2026-10-23

## Summary

- Hosted model behaviour shifts without notice: GPT-4 prime-identification accuracy went from 84% (March 2023) to 51% (June 2023) in one version of Chen, Zaharia and Zou's study. [arXiv 2307.09009](https://arxiv.org/pdf/2307.09009)
- Classical ML also "ages": Vela et al. (Scientific Reports, 2022) report quality degrading with time since last training across healthcare, transport, finance and weather datasets. [PMC9270447](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9270447/)
- For injecting new facts, retrieval beat unsupervised fine-tuning (≈0.875 vs ≈0.51 on post-cutoff questions, secondary figures), and fine-tuning on new knowledge correlates with more hallucination. [Ovadia et al.](https://arxiv.org/html/2312.05934v3), [Gekhman et al.](https://neura.market/ai-and-ml-research-papers/fine-tuning-and-hallucinations)
- No source found prescribes a retraining cadence for LLM applications; sources describe monitoring outputs against a reference set and acting on measured drift.
- Several high-volume public feeds need no key (Wikimedia EventStreams, Bluesky Jetstream) or a free key (Companies House streaming, Stack Exchange, NVD).

## Findings

### Drift in hosted models and outputs

- Chen, Zaharia, Zou (2023; NeurIPS 2023 workshop; HDSR): March vs June 2023 GPT-3.5 and GPT-4 differed substantially; GPT-4 prime vs composite 84% → 51% (another version reports 97.6% → 2.4%); GPT-4 followed chain-of-thought less; both made more code-formatting mistakes in June; GPT-4 improved on multi-hop questions. [arXiv 2307.09009](https://arxiv.org/pdf/2307.09009), [HDSR](https://hdsr.mitpress.mit.edu/pub/y95zitmz/release/1) (search summaries)
- A 2025 financial-workflow study found output drift is task-dependent: RAG tasks 56.25% consistency (mean drift 0.081); SQL generation and summarisation 100% consistency. [arXiv 2511.07585](https://arxiv.org/html/2511.07585v1) (search summary)
- Practitioner taxonomy (Fiddler-derived guide): *prompt drift* = live inputs diverge from those used in fine-tuning or validation; *performance drift* = inputs stable but outputs change, often from upstream model, tuning or retrieval changes; third-party APIs can shift without a release signal. [nhimg](https://nhimg.org/articles/llm-drift-monitoring-is-becoming-essential-for-production-ai-quality/) (search summary)
- A December 2025 preprint proposes a drift taxonomy for deployed LLMs, citing prompt sensitivity and lack of production ground truth as differences from classical ML. [ResearchGate](https://www.researchgate.net/publication/398861417_Concept_Drift_And_Data_Shift_Management_In_Deployed_Large_Language_Models) (search summary; not peer-reviewed)
- Model deprecations force migrations: OpenAI notified on 2026-10-14 that `gpt-4o-2024-08-06` and `gpt-4o-2024-11-20` leave the API on 2027-01-14 (replacement `gpt-6-luna`). [OpenAI deprecations](https://developers.openai.com/api/docs/deprecations) (search summary)

### Ageing of trained models

- Vela et al., "Temporal quality degradation in AI models" (Sci Rep 12:11654, 2022-07-08): defines "AI aging"; four industries, four model types (penalised linear regression, random forest, gradient boosting, neural networks). The widely quoted "91% of models degrade" appears in a Towards Data Science article and was not confirmed in the paper excerpts. [PMC9270447](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9270447/), [TDS](https://towardsdatascience.com/91-of-ml-models-degrade-in-time-cfd467905615) (search summaries)

### Knowledge staleness benchmarks

- LLMLagBench (arXiv 2511.12116): 1,713 news-event questions (as of October 2025) to estimate effective training cutoffs; cutoffs often diverge from release dates and models show multiple partial cutoffs. [arXiv](https://arxiv.org/html/2511.12116v1) (search summary)
- LiveSearchBench (arXiv 2511.01409): questions built from Wikidata snapshots; large drop on facts post-dating pretraining, worst on multi-hop; retrieval and larger models give partial gains but do not close the gap. [arXiv](https://arxiv.org/pdf/2511.01409v2) (search summary)
- Daily Oracle: future-event prediction from daily news; performance degrades as pretraining data ages. RecencyQA: questions whose answers change more often are harder. [LLMLagBench related work](https://arxiv.org/html/2511.12116v1) (search summary)

### Refreshing knowledge: fine-tuning vs retrieval

- Ovadia et al., "Fine-Tuning or Retrieval?" (EMNLP 2024): RAG outperformed unsupervised fine-tuning on both seen and new knowledge; paraphrase augmentation helps fine-tuning somewhat; secondary figures on 910 post-cutoff questions: RAG ≈0.875–0.876 vs fine-tuning ≈0.504–0.511 (Llama2-7B, Mistral-7B, Orca2-7B). [arXiv 2312.05934](https://arxiv.org/html/2312.05934v3), [beancount review](https://beancount.io/bean-labs/research-logs/2026/05/20/fine-tuning-or-retrieval-knowledge-injection-llms) (search summaries)
- Gekhman et al. (EMNLP 2024): new knowledge in SFT data is learned slowly and hallucination on held-out questions rises roughly linearly with its share. [summary](https://neura.market/ai-and-ml-research-papers/fine-tuning-and-hallucinations) (search summary; aggregator)
- Weight-update methods aimed at low-forgetting refresh (sparse memory fine-tuning, Doc-to-LoRA) are in [learning-from-feedback.claude.md](learning-from-feedback.claude.md).
- Mubit's CL-Bench write-up claims its memory arm held reward through a mid-task schema migration where the stateless baseline fell from 0.247 to 0.057 (vendor claim). See [mubit-ecosystem.claude.md](mubit-ecosystem.claude.md).

### Live public data feeds

| Feed | Access | Limits | Notes | Source |
| --- | --- | --- | --- | --- |
| Wikimedia EventStreams `recentchange` | SSE at `https://stream.wikimedia.org/v2/stream/recentchange`, no key in examples | not found | every edit across Wikimedia projects; content CC BY-SA | [videosdk guide](https://www.videosdk.live/developer-hub/websocket/streaming-api) |
| Bluesky Jetstream | WebSocket JSON, e.g. `wss://jetstream2.us-east.bsky.network/subscribe?wantedCollections=app.bsky.feed.post`; no key | live only; replay gated on public instances; "not officially part of the protocol" | server-side filtering by collection or account | [Simon Willison](https://simonwillison.net/2024/Nov/20/bluesky-websocket-firehose), [Jetstream docs](https://bsky.network/docs/jetstream) |
| Companies House streaming API (UK) | long-running HTTP stream; free registered key | REST 600 requests per 5 min; frequent reconnects may be rate-limited | real-time company data changes | [CH streaming guide](https://developer-specs.company-information.service.gov.uk/streaming-api/guides/overview), [rate limiting](https://developer-specs.company-information.service.gov.uk/guides/rateLimiting) |
| GitHub REST (events, issues) | public | 60 requests/hour unauthenticated, per IP | community post says limits also cover raw.githubusercontent.com | [GitHub](https://developer.github.com/changes/2012-10-14-rate-limit-changes) |
| NVD CVE API 2.0 | public; optional key | 5 requests / 30 s without key, 50 with key (NVD wording differs: rolling 60 s window) | new CVEs daily | [NVD](https://nvd.nist.gov/general/news/changes-to-feeds-and-apis) |
| Stack Exchange API | public; free app key | 300/day per IP without key, 10,000/day with key; obey `backoff` | Q&A content CC BY-SA | [apis.io](https://apis.io/rate-limits/stackexchange/stackexchange-rate-limits/) |
| Reddit API | OAuth required | free tier reported 100 queries/min per client (other figures: 600 or 996 per 10 min) | terms restrict commercial use (not checked) | [redditwarp](https://redditwarp.readthedocs.io/en/latest/user-guide/rate-limits.html) |
| Hacker News Firebase API | public | not documented | — | not found |
| GDELT 2.0, TfL Unified API, arXiv API | — | not found by search | — | not found |

## Gaps

- No study found giving a recommended retraining or adapter-refresh cadence for LLM tasks.
- Rate limits for Wikimedia EventStreams, HN, GDELT, TfL and arXiv: not confirmed.
- Licence terms for Bluesky and Reddit content in model training: not checked.

## Sources

- [Chen, Zaharia, Zou, How Is ChatGPT's Behavior Changing over Time?](https://arxiv.org/pdf/2307.09009), accessed 2026-10-23
- [Vela et al., Temporal quality degradation in AI models](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9270447/), accessed 2026-10-23
- [LLM Output Drift in financial workflows](https://arxiv.org/html/2511.07585v1); [nhimg drift article](https://nhimg.org/articles/llm-drift-monitoring-is-becoming-essential-for-production-ai-quality/); [Concept Drift in Deployed LLMs](https://www.researchgate.net/publication/398861417_Concept_Drift_And_Data_Shift_Management_In_Deployed_Large_Language_Models), accessed 2026-10-23
- [LLMLagBench](https://arxiv.org/html/2511.12116v1); [LiveSearchBench](https://arxiv.org/pdf/2511.01409v2), accessed 2026-10-23
- [Ovadia et al.](https://arxiv.org/html/2312.05934v3); [Gekhman et al. summary](https://neura.market/ai-and-ml-research-papers/fine-tuning-and-hallucinations), accessed 2026-10-23
- [OpenAI deprecations](https://developers.openai.com/api/docs/deprecations), accessed 2026-10-23
- Feed documentation linked in the table, accessed 2026-10-23
- All via web search summaries; pages were not opened (network policy).
