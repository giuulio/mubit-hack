# Public cross-domain feedback and ground-truth datasets

- **Question:** Which public resources pair varied inputs with preferences, feedback or labelled outputs, and what are their access and licence conditions?
- **Author:** gpt (GPT-6)
- **Date:** 2026-10-23

## Summary

- HH-RLHF supplies human `chosen`/`rejected` text pairs; UltraFeedback supplies model-generated critiques and scores. They have different annotation provenance. [HH-RLHF](https://github.com/anthropics/hh-rlhf) · [UltraFeedback](https://github.com/OpenBMB/UltraFeedback)
- UltraFeedback reports 63,967 sampled instructions and four generated responses per instruction; its introduction rounds these to 64k prompts and 256k responses. [Author documentation](https://github.com/OpenBMB/UltraFeedback)
- MASSIVE 1.1 covers more than 1M utterances across 52 languages, with intent and slot labels; MASSIVE 1.0 covers 51 languages. [Author documentation](https://github.com/alexa/massive)
- A dataset hub's software licence does not state every hosted dataset's terms: the Hugging Face Datasets library is Apache-2.0, while individual datasets have their own licences. [Library documentation](https://github.com/huggingface/datasets)

## Findings

### Preferences and critiques across tasks

| Resource | Size stated in inspected source | Pairing and format | Licence and access evidence |
| --- | --- | --- | --- |
| Anthropic HH-RLHF | Total record count not found in the inspected README; helpfulness data have multiple collection tranches and train/test files | JSONL records containing `chosen` and `rejected` strings, including multi-turn conversation text; separate human red-team transcripts have additional ratings/metadata | Repository has an MIT licence; README now points to the Hugging Face-hosted dataset. [README](https://github.com/anthropics/hh-rlhf) · [Licence](https://github.com/anthropics/hh-rlhf/blob/master/LICENSE) |
| UltraFeedback | 63,967 instructions sampled from six sources; four responses per instruction; introduction says about 64k prompts/256k responses | Instructions, model completions, numerical scores and textual critiques; feedback generated using GPT-4 | Repository is MIT; its instructions originate in other datasets, whose terms are not established by the repository licence alone. [README](https://github.com/OpenBMB/UltraFeedback) · [Licence](https://github.com/OpenBMB/UltraFeedback/blob/main/LICENSE) |
| MASSIVE 1.1 | More than 1M utterances, 52 languages, 60 intents and 55 slot types | JSONL with utterance text, intent, annotated slots, locale, partition and annotation metadata | Dataset CC BY 4.0 according to the explicit dataset notice; downloadable archives linked in README. [README](https://github.com/alexa/massive) · [Dataset notice](https://github.com/alexa/massive/blob/main/NOTICE.md) |

- HH-RLHF's human-preference format records a preferred and rejected answer rather than an explicit replacement edit; its red-team records additionally include attack descriptions and success ratings. [Schema description](https://github.com/anthropics/hh-rlhf)
- UltraFeedback includes dimensions such as instruction following, truthfulness, honesty and helpfulness. Its maintainers document revisions after an overall-score computation problem affected 2,628 completions initially scored 10. [Construction and update](https://github.com/OpenBMB/UltraFeedback)
- MASSIVE records the relation between localised utterances and their source examples. Its documentation describes fluency and annotation-judgement fields; these are annotations of assistant requests, not edits to generated assistant answers. [Schema](https://github.com/alexa/massive)

### Evaluation collections and discovery

- BEIR describes heterogeneous information-retrieval datasets, standard query/corpus/qrels formats and train/dev/test availability. Relevance labels are ground truth for retrieval rather than textual corrections to a generative model. [Project documentation](https://github.com/beir-cellar/beir)
- RewardBench's official repository provides reward-model and generative-judge evaluation code, with separate documentation for RewardBench and RewardBench 2. Its current README links separate evaluation datasets, so the version identifier is part of the resource identity. [Project](https://github.com/allenai/reward-bench)
- Hugging Face Datasets documents loading, processing and sharing datasets with dataset-specific metadata and licences. The library can read supported formats such as JSON/CSV; no dataset download was executed through its Python API here. [Library documentation](https://github.com/huggingface/datasets)

### Domain-specific resources recorded elsewhere

- Support intent datasets and their inspected file counts are recorded in [customer support](domain-customer-support.gpt.md); scientific review, medical-text and biomedical QA resources are in [healthcare/science](domain-healthcare-science.gpt.md).
- Product relevance and taxonomy resources are in [commerce](domain-commerce.gpt.md); tutoring and narrative-comprehension datasets are in [public sector/education](domain-public-sector-education.gpt.md).

## Gaps

- The HH-RLHF raw-file URL returned a Git LFS pointer rather than dataset contents. Its record count was not measured; no count is inferred from a pointer's byte size.
- Direct Hugging Face access was blocked by the network proxy. Dataset cards, current mirrors and downstream redistribution conditions were not all retrievable.
- No cross-domain corpus of human-written replacement edits with independently checked source-level reuse rights was established in this pass. Preference pairs, model critiques and task labels above are identified separately.
- Public availability alone does not establish that every included source grants the same rights; mixed-source resources have the provenance limits stated above.

## Sources

- [HH-RLHF README](https://github.com/anthropics/hh-rlhf) and [MIT licence](https://github.com/anthropics/hh-rlhf/blob/master/LICENSE), accessed 2026-10-23.
- [UltraFeedback README](https://github.com/OpenBMB/UltraFeedback) and [MIT licence](https://github.com/OpenBMB/UltraFeedback/blob/main/LICENSE), accessed 2026-10-23.
- [MASSIVE README](https://github.com/alexa/massive) and [dataset notice](https://github.com/alexa/massive/blob/main/NOTICE.md), accessed 2026-10-23.
- [BEIR](https://github.com/beir-cellar/beir), [RewardBench](https://github.com/allenai/reward-bench) and [Hugging Face Datasets](https://github.com/huggingface/datasets), accessed 2026-10-23.
