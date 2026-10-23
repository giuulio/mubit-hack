# Feedback capture and evaluation tooling

- **Question:** How do existing tools store human feedback, corrected outputs and automated evaluations?
- **Author:** gpt (GPT-6)
- **Date:** 2026-10-23

## Summary

- Langfuse documents annotation queues, numeric/categorical feedback, comments and corrected outputs attached to recorded executions. [Documentation](https://github.com/langfuse/langfuse-docs/blob/main/content/docs/evaluation/evaluation-methods/annotation-queues.mdx)
- LangSmith's SDK distinguishes a feedback score, value, comment, correction and feedback source. [SDK](https://github.com/langchain-ai/langsmith-sdk/blob/main/python/langsmith/client.py)
- Pydantic Evals and Promptfoo support deterministic checks and LLM judges. [Pydantic documentation](https://github.com/pydantic/pydantic-ai/blob/main/docs/evals/quick-start.md) · [Promptfoo documentation](https://github.com/promptfoo/promptfoo/blob/main/site/docs/configuration/expected-outputs/index.md)
- Braintrust and Phoenix provide datasets and experiment/evaluation workflows; their documentation is evidence of supported interfaces, not an independent product benchmark. [Braintrust](https://github.com/braintrustdata/braintrust-sdk-javascript) · [Phoenix](https://github.com/Arize-ai/phoenix)

## Findings

### Human feedback and replacement answers

| Tool | Documented capture or evaluation mechanism | Source |
| --- | --- | --- |
| Langfuse | Queues of traces, observations or sessions for domain experts to score and comment on; reviewer assignment and completion workflow | [Annotation queues](https://github.com/langfuse/langfuse-docs/blob/main/content/docs/evaluation/evaluation-methods/annotation-queues.mdx) |
| Langfuse corrections | One corrected output per trace or observation, original/corrected diff, plain text or validated JSON; SDK representation uses `data_type="CORRECTION"`, `name="output"` | [Corrected outputs](https://github.com/langfuse/langfuse-docs/blob/main/content/docs/observability/features/corrections.mdx) |
| LangSmith | `create_feedback` accepts a run identifier, feedback key, score, value, comment, correction and source metadata; SDK schemas distinguish human/API/model feedback sources | [Client](https://github.com/langchain-ai/langsmith-sdk/blob/main/python/langsmith/client.py) · [Schemas](https://github.com/langchain-ai/langsmith-sdk/blob/main/python/langsmith/schemas.py) |
| Braintrust | `Eval` declares input/expected-output data, a task function and scorers; the SDK README demonstrates a Levenshtein scorer | [SDK quickstart](https://github.com/braintrustdata/braintrust-sdk-javascript) |
| Phoenix | Versioned example datasets, experiments for comparing changes and response/retrieval evaluations | [Project documentation](https://github.com/Arize-ai/phoenix) |

- Langfuse also documents a custom-review-UI workflow: fetch recorded executions and write reviewer judgements back as scores validated against a shared score configuration. [Guide](https://github.com/langfuse/langfuse-docs/blob/main/content/guides/human-in-the-loop-scoring.mdx)
- Canva's customer account describes QA reviewers, content designers, product managers and market/language experts contributing to evaluations. It reports 15–20 metrics and manual inspection of 20–100 production cases per week. These are customer claims. [Case study](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/canva.mdx)

### Deterministic graders

- Pydantic Evals represents test cases as typed inputs plus optional expected outputs; evaluators include `EqualsExpected`, `Contains`, custom evaluators and duration checks. A dataset can evaluate an ordinary function as well as an LLM application. [Quickstart](https://github.com/pydantic/pydantic-ai/blob/main/docs/evals/quick-start.md)
- Promptfoo's documented assertions include equality, text containment, JSON validation, custom JavaScript/Python checks, similarity and model-graded rubrics. Each assertion can carry a threshold or weight. [Assertion reference](https://github.com/promptfoo/promptfoo/blob/main/site/docs/configuration/expected-outputs/index.md)
- Braintrust's quickstart separates the task function from `expected` values and scorers. The demonstrated string-distance scorer does not require another LLM call. [SDK quickstart](https://github.com/braintrustdata/braintrust-sdk-javascript)

### LLM judges and verifier models

- Pydantic Evals documents `LLMJudge` alongside deterministic evaluators; its integration with Logfire records evaluation activity for inspection. [Quickstart](https://github.com/pydantic/pydantic-ai/blob/main/docs/evals/quick-start.md)
- Langfuse describes comparing human annotation with LLM-as-a-judge scores and calibrating the judge against reviewers' labels. This is documented tooling, not proof of judge correctness. [Annotation queues](https://github.com/langfuse/langfuse-docs/blob/main/content/docs/evaluation/evaluation-methods/annotation-queues.mdx)
- SciFact provides a separate scientific-verification task with document evidence and rationales; its project supplies rationale-selection and label-prediction components. It is a domain benchmark, not a general human-preference oracle. [Project](https://github.com/allenai/scifact)
- UltraFeedback's maintainers report that some low-quality completions received an overall score of 10 and describe re-annotation and score corrections. The report documents a concrete automated-label failure. [Dataset update](https://github.com/OpenBMB/UltraFeedback)

## Gaps

- Interfaces and documentation were inspected; no hosted accounts, SDK integration runs, billing tests or evaluator-accuracy experiments were performed.
- Direct hosted documentation was restricted by the network policy; linked official repository documentation supplied the product evidence.
- Whether a particular external correction format is accepted by Mubit is outside this file's scope and was not established by these tools' support for it.

## Sources

- [Langfuse annotation queues](https://github.com/langfuse/langfuse-docs/blob/main/content/docs/evaluation/evaluation-methods/annotation-queues.mdx), [corrections](https://github.com/langfuse/langfuse-docs/blob/main/content/docs/observability/features/corrections.mdx) and [custom human-scoring guide](https://github.com/langfuse/langfuse-docs/blob/main/content/guides/human-in-the-loop-scoring.mdx), accessed 2026-10-23.
- [LangSmith SDK client](https://github.com/langchain-ai/langsmith-sdk/blob/main/python/langsmith/client.py) and [schemas](https://github.com/langchain-ai/langsmith-sdk/blob/main/python/langsmith/schemas.py), accessed 2026-10-23.
- [Braintrust JavaScript SDK](https://github.com/braintrustdata/braintrust-sdk-javascript), accessed 2026-10-23.
- [Arize Phoenix](https://github.com/Arize-ai/phoenix), accessed 2026-10-23.
- [Pydantic Evals quickstart](https://github.com/pydantic/pydantic-ai/blob/main/docs/evals/quick-start.md), accessed 2026-10-23.
- [Promptfoo assertions](https://github.com/promptfoo/promptfoo/blob/main/site/docs/configuration/expected-outputs/index.md), accessed 2026-10-23.
- [SciFact](https://github.com/allenai/scifact) and [UltraFeedback](https://github.com/OpenBMB/UltraFeedback), accessed 2026-10-23.
