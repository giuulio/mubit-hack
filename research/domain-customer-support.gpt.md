# Customer support: routing, drafting and quality review

- **Question:** Which repeated support tasks, human corrections and public labelled resources are documented?
- **Author:** gpt (GPT-6)
- **Date:** 2026-10-23

## Summary

- SumUp reports AI first-line answers, human escalation, translation and agent reply drafting at 600,000 monthly support conversations. [Customer account](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/sumup.mdx)
- Canva reports specialised query routing and asynchronous resolution, with 20–100 production cases manually reviewed per week. [Customer account](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/canva.mdx)
- BANKING77 has 10,003 training and 3,080 test queries across 77 intents, under CC BY 4.0. The downloaded CSV counts matched the README. [Dataset](https://github.com/PolyAI-LDN/task-specific-datasets) · [Licence](https://github.com/PolyAI-LDN/task-specific-datasets/blob/master/LICENSE)
- CLINC150 includes in-scope and out-of-scope queries; all examples are single-intent, rather than multi-intent tickets. [Dataset](https://github.com/clinc/oos-eval)

## Findings

### Tasks, operators and frequency

| Repeated task | People and correction point | Reported scale or frequency |
| --- | --- | --- |
| First-line response and escalation | Support agents receive conversations the assistant cannot handle | SumUp customer account: 600,000 conversations per month; 50% deflection and 300,000 monthly requests no longer requiring humans. [Source](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/sumup.mdx) |
| Translation, resource retrieval, reply drafting | Human support agents use translation and a copilot before responding | Described by SumUp; separate draft/translation counts not supplied. [Source](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/sumup.mdx) |
| Routing and asynchronous ticket resolution | Canva's Help Assistant routes queries; OmniAgent escalates unresolved cases | Customer account describes the workflow but gives no monthly ticket count. [Source](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/canva.mdx) |
| Reply QA, tone and market-specific checks | QA team, content designers and market/language experts | Canva reports 15–20 metrics and manual review of 20–100 production cases per week. [Source](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/canva.mdx) |

### Products and stated problems

- Chatwoot's official repository describes Captain as an AI support agent for common queries and automated responses. This is a vendor feature description; its README supplies no measured resolution rate. [Product repository](https://github.com/chatwoot/chatwoot)
- Cresta's customer account describes intent detection, retrieval, tool execution and safety checks within a support agent, and gives incorrect billing-versus-cancellation routing as an example of an upstream error affecting later steps. It is the supplier's account, not an experiment run here. [Source](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/cresta.mdx)
- SumUp identifies market-specific requirements, multi-system follow-ups and reproducing production configurations as challenges. Its customer quote reports that reproduction previously consumed engineering time and was inaccessible to non-technical staff. [Source](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/sumup.mdx)
- Canva's Japanese-market example describes a marketing manager creating a tone evaluator; this documents a quality criterion beyond factual answer correctness. [Source](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/canva.mdx)
- An AnythingLLM user requests response ratings that affect later answers. The thread is evidence of that user's request, not a population estimate or an implemented learning loop. [Issue #3565](https://github.com/Mintplex-Labs/anything-llm/issues/3565)

### Public datasets and interfaces

| Resource | Size and format | Labels/corrections | Licence and access |
| --- | --- | --- | --- |
| BANKING77 | CSV `text,category`; 10,003 train, 3,080 test; 77 categories | Human-labelled intent for online banking queries, including card arrival, broken card and cancelled transfer | CC BY 4.0; files directly retrievable without credentials. [README](https://github.com/PolyAI-LDN/task-specific-datasets) · [Licence](https://github.com/PolyAI-LDN/task-specific-datasets/blob/master/LICENSE) |
| CLINC150 full | JSON split arrays; 15,000 train, 3,000 validation and 4,500 test in-scope examples; out-of-scope counts 100/100/1,000 | 150 in-scope intents plus out-of-scope examples, elicited through crowdsourced scenarios/paraphrases | CC BY 3.0; public `data/data_full.json`. [README](https://github.com/clinc/oos-eval) · [Licence](https://github.com/clinc/oos-eval/blob/master/LICENSE) |
| τ-bench | Simulated users, domain policies, tools and task outcomes for airline/retail customer service | Evaluates an agent against task success and repeated-run reliability; not a corpus of organic support-agent edits | The original repository warns that its tasks are outdated and points to a successor. Current reuse terms and task counts were not established here. [Original benchmark](https://github.com/sierra-research/tau-bench) |

- **Observed:** Python's standard-library CSV reader counted 10,003/3,080 BANKING77 records and 77 distinct categories in each split; JSON split lengths for CLINC150 matched the table above. The files were fetched from the linked official raw GitHub paths on 2026-10-23. [BANKING77 files](https://github.com/PolyAI-LDN/task-specific-datasets/tree/master/banking_data) · [CLINC150 file](https://github.com/clinc/oos-eval/blob/master/data/data_full.json)
- These datasets supply intent ground truth, not approved replies or operational escalation outcomes. Their documented labels do not show the result of a real support intervention. [BANKING77 schema](https://github.com/PolyAI-LDN/task-specific-datasets) · [CLINC150 schema](https://github.com/clinc/oos-eval)

## Gaps

- No support organisation's private tickets, reply edits or escalation histories were accessed. Public intent data do not establish a particular organisation's queue taxonomy.
- Support case-study counts are attributed customer claims; neither model-call counts nor independently audited savings were established.
- Hosted support APIs were not exercised; no credentials or private customer data were requested.

## Sources

- [SumUp](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/sumup.mdx), [Canva](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/canva.mdx) and [Cresta](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/cresta.mdx) customer accounts, accessed 2026-10-23.
- [Chatwoot](https://github.com/chatwoot/chatwoot), accessed 2026-10-23.
- [AnythingLLM issue #3565](https://github.com/Mintplex-Labs/anything-llm/issues/3565), accessed 2026-10-23.
- [BANKING77 repository](https://github.com/PolyAI-LDN/task-specific-datasets) and [licence](https://github.com/PolyAI-LDN/task-specific-datasets/blob/master/LICENSE), accessed 2026-10-23; train/test CSV files counted locally.
- [CLINC150 repository](https://github.com/clinc/oos-eval) and [licence](https://github.com/clinc/oos-eval/blob/master/LICENSE), accessed 2026-10-23; full JSON split counts checked locally.
- [τ-bench](https://github.com/sierra-research/tau-bench), accessed 2026-10-23; benchmark not executed.
