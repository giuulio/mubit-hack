# Where AI corrections already occur

- **Question:** Where do users report correction problems, and what edits, labels or overrides already arise during work?
- **Author:** gpt (GPT-6)
- **Date:** 2026-10-23

## Summary

- An AnythingLLM user requested response ratings that influence future answers; a reply asked first for rating storage. This is a feature request, not evidence that learning was implemented. [Issue](https://github.com/Mintplex-Labs/anything-llm/issues/3565)
- A Dify user reported being unable to enable Annotation Reply in version 1.3.1. [Issue](https://github.com/langgenius/dify/issues/19472)
- Canva describes an existing QA workflow in which staff inspect 20–100 production cases per week. [Customer account](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/canva.mdx)
- Study-selection decisions and teacher annotations exist in public datasets; neither is the same signal as a thumbs-down rating. [SYNERGY](https://github.com/asreview/synergy-dataset) · [MathDial](https://github.com/eth-nlped/mathdial)

## Findings

### First-person reports and requests

- **User request, 2025-03-31:** AnythingLLM issue #3565 asks for an embedded-chat response-rating feature so previous answer ratings can refine future responses. Another commenter asks for ratings to be stored in the embeddings log. No deployment outcome was established by inspecting this thread. [Issue](https://github.com/Mintplex-Labs/anything-llm/issues/3565)
- **User report, 2025-05-10:** Dify issue #19472 describes clicking Manage → Annotation Reply → Save and Enable, then seeing a persistent spinner and finding the feature disabled after refresh. The reported installation is self-hosted Docker, version 1.3.1; the behaviour was not reproduced here. [Issue](https://github.com/langgenius/dify/issues/19472)
- **Merchant report, 2026-04-24:** Shopify taxonomy issue #899 asks for an Essential Oils category because existing Fragrance Oil and Fragrance Diffusers labels use different terminology. This is a taxonomy complaint; the thread does not establish that an LLM caused the classification. [Issue](https://github.com/Shopify/product-taxonomy/issues/899)
- **Memory-system user report, 2026-06-16:** Mem0 issue #5587 reports conflation of a person named “Apple” and Apple the company. Maintainer discussion attributes it to entity merging without a type check. The public thread supplies an example of stored context being wrong; no failure rate was measured here. [Issue](https://github.com/mem0ai/mem0/issues/5587)

### Corrections produced as part of normal work

| Workflow | Existing human signal | Evidence and attribution |
| --- | --- | --- |
| Support QA | Scores, comments and case-level review by QA and domain experts | Canva reports reviewing 20–100 production cases per week and using language-specific evaluators. [Customer account](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/canva.mdx) |
| Internal service desk | Unplanned human intervention and customer feedback | Ravenna's supplier case study describes these as triggers for inspecting an agent trace and documenting the problem. [Customer account](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/ravenna.mdx) |
| Scientific literature screening | Included/excluded labels from completed reviews | SYNERGY contains 169,288 records from 26 reviews, with 2,834 inclusions labelled by review authors. [Dataset](https://github.com/asreview/synergy-dataset) |
| Tutoring | Teacher-written explanations of a student's confusion and annotated tutoring moves | MathDial contains 2,861 conversations between human teachers and simulated students, including `teacher_described_confusion`. [Dataset](https://github.com/eth-nlped/mathdial) |
| Medical-text review benchmark | Error flag, erroneous sentence and corrected sentence | MEDEC defines these three outputs for correct texts or texts containing one introduced error. [Dataset](https://github.com/abachaa/MEDEC) |
| Government information assistant | Positive/negative answer reaction | GOV.UK Chat's public `AnswerFeedback` model stores reactions linked to answers and supports export over a date range; the model alone does not document replacement answers. [Code](https://github.com/alphagov/govuk-chat/blob/main/app/models/answer_feedback.rb) |

### What a feedback record actually contains

- Langfuse documents scores/comments separately from corrected outputs. Its correction view retains an improved output alongside the original with a diff. [Annotation documentation](https://github.com/langfuse/langfuse-docs/blob/main/content/docs/evaluation/evaluation-methods/annotation-queues.mdx) · [Correction documentation](https://github.com/langfuse/langfuse-docs/blob/main/content/docs/observability/features/corrections.mdx)
- Anthropic's human-preference dataset stores `chosen`/`rejected` text pairs; those records express a relative preference rather than an explicit error location or textual correction. [Dataset format](https://github.com/anthropics/hh-rlhf)
- UltraFeedback's maintainers document a scoring error involving 2,628 completions initially assigned an overall score of 10, followed by adjustments and re-annotation. Its ratings are generated using GPT-4, not collected as human preferences. [Maintainer account](https://github.com/OpenBMB/UltraFeedback)

## Gaps

- The issue reports establish that particular people reported a problem or requested a feature. They do not establish prevalence, willingness to pay, repeated correction frequency or the behaviour of the latest release.
- Hacker News and Reddit were blocked by the network proxy. No direct HN/Reddit testimony was retrieved or inferred from search snippets.
- No interviews, production-system access or measurements of correction time were conducted.

## Sources

- [AnythingLLM issue #3565](https://github.com/Mintplex-Labs/anything-llm/issues/3565), accessed 2026-10-23.
- [Dify issue #19472](https://github.com/langgenius/dify/issues/19472), accessed 2026-10-23.
- [Shopify taxonomy issue #899](https://github.com/Shopify/product-taxonomy/issues/899), accessed 2026-10-23.
- [Mem0 issue #5587](https://github.com/mem0ai/mem0/issues/5587), accessed 2026-10-23.
- [Canva](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/canva.mdx) and [Ravenna](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/ravenna.mdx) customer accounts, accessed 2026-10-23.
- [SYNERGY](https://github.com/asreview/synergy-dataset), [MathDial](https://github.com/eth-nlped/mathdial), [MEDEC](https://github.com/abachaa/MEDEC), [HH-RLHF](https://github.com/anthropics/hh-rlhf) and [UltraFeedback](https://github.com/OpenBMB/UltraFeedback), accessed 2026-10-23.
- [GOV.UK Chat answer feedback model](https://github.com/alphagov/govuk-chat/blob/main/app/models/answer_feedback.rb), accessed 2026-10-23.
- [Langfuse annotation queues](https://github.com/langfuse/langfuse-docs/blob/main/content/docs/evaluation/evaluation-methods/annotation-queues.mdx) and [corrected outputs](https://github.com/langfuse/langfuse-docs/blob/main/content/docs/observability/features/corrections.mdx), accessed 2026-10-23.
