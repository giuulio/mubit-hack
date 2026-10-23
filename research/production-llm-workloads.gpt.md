# Repeated LLM workloads in production

- **Question:** Which repeated tasks do organisations run with LLMs, and what volumes are publicly documented?
- **Author:** gpt (GPT-6)
- **Date:** 2026-10-23

## Summary

- SumUp reports 600,000 monthly support conversations and 300,000 monthly requests deflected from human support; these are customer claims in a supplier case study. [Source](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/sumup.mdx)
- Canva describes support routing, account actions, asynchronous ticket resolution and manual review of 20–100 production cases per week. [Source](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/canva.mdx)
- Anthropic's September 2025 report states that 77% of business API uses involve automation patterns; its API observations are distinct from Claude.ai conversations. [Report copy, page 4](https://github.com/EruditionHerta/AEIRD/blob/master/report_print.pdf)
- Merck reports more than 300 GenAI use cases across proof of concept, development and production; this is not a count of 300 production deployments. [Source](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/merckgroup.mdx)

## Findings

### Merchant and consumer support

- **Customer claim, 2025-08-11:** SumUp's assistant answers first-line merchant questions and routes conversations to humans; internal tools translate messages, retrieve resources and draft replies for support agents. [Source](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/sumup.mdx)
- The same case study reports growth from 1,000 to 600,000 monthly conversations, a 50% deflection rate and 300,000 monthly requests no longer requiring human support, also expressed by the customer as 10,000 per day. These figures describe conversations or requests, not model-call counts. [Source](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/sumup.mdx)
- **Customer claim, 2026-01-12:** Canva's Help Assistant routes queries to specialised agents; OmniAgent handles asynchronous tickets and escalates unresolved cases to humans. The article gives no monthly ticket total. [Source](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/canva.mdx)
- Canva reports 15–20 evaluation metrics and manual inspection of 20–100 production cases per week by its QA team; domain experts also assess market- and language-specific behaviour. [Source](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/canva.mdx)
- **Customer claim, 2026-03-26:** Cresta describes repeated intent detection, retrieval, tool execution, response generation and safety validation within a single support interaction. Its article does not quantify daily interactions. [Source](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/cresta.mdx)

### Scientific knowledge and education

- **Customer claim, 2025-09-02:** Merck's Electronics Lab Assistant retrieves knowledge from 80k+ documents and experimental data; its Medical Information application drafts and updates response documents for healthcare professionals. [Source](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/merckgroup.mdx)
- Merck reports approximately 80 use cases on Langfuse, more than 200 regular platform users and 27,000 regular users of its internal myGPT suite. These are use-case and user counts; request volumes are not supplied. [Source](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/merckgroup.mdx)
- **Customer claim, 2025-08-01:** Khan Academy describes Khanmigo as a student tutor and teaching assistant. Langfuse adoption spans more than 100 users across 7 product and 4 infrastructure teams; no daily inference count is disclosed. [Source](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/khan-academy.mdx)

### Usage studies and what their denominators mean

- **Publisher claim, report dated 2025-09-15:** Anthropic's report distinguishes first-party API traffic from Claude.ai use. It reports 77% automation patterns for business API uses, compared with about 50% for Claude.ai users. The copy inspected is hosted by an independent GitHub mirror, not Anthropic. [Report copy, page 4](https://github.com/EruditionHerta/AEIRD/blob/master/report_print.pdf) · [Mirror provenance](https://github.com/EruditionHerta/AEIRD)
- The report says API use has a greater share of coding and office/administrative tasks, while Claude.ai has a greater share of education and writing tasks. These are relative usage shares, not an estimate of all organisations' workload. [Report copy, page 4](https://github.com/EruditionHerta/AEIRD/blob/master/report_print.pdf)
- Its data dictionary identifies the API observation period as 2025-08-04 to 2025-08-11 and describes privacy-preserving aggregated task and request metrics. [Source copy](https://github.com/EruditionHerta/AEIRD/blob/master/data_documentation.md)
- A third-party transcription of the 2025 OpenAI study *How People Use ChatGPT* records separate work/non-work, Asking/Doing/Expressing and conversation-topic classifiers. It includes writing, practical guidance, technical help and information seeking; it does not itself establish enterprise request volumes. [Transcription](https://github.com/hanfang/chatgpt-usage-taxonomies)

## Gaps

- Customer figures above were not independently audited; registered users, active users, review samples, conversations and model calls are different units.
- Direct Anthropic and OpenAI pages returned proxy CONNECT 403 responses in this environment. The Anthropic findings were read from the linked report copy; OpenAI population percentages were not verified and are not reproduced here.
- A representative independent cross-industry survey with verified sample size was not retrieved; these named cases do not establish market-wide adoption rates.

## Sources

- [SumUp customer case study, dated 2025-08-11](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/sumup.mdx), accessed 2026-10-23.
- [Canva customer case study, dated 2026-01-12](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/canva.mdx), accessed 2026-10-23.
- [Cresta customer case study, dated 2026-03-26](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/cresta.mdx), accessed 2026-10-23.
- [Merck customer case study, dated 2025-09-02](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/merckgroup.mdx), accessed 2026-10-23.
- [Khan Academy customer case study, dated 2025-08-01](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/khan-academy.mdx), accessed 2026-10-23.
- [Anthropic September 2025 report, independent mirror](https://github.com/EruditionHerta/AEIRD/blob/master/report_print.pdf), pages 2–4 visually inspected 2026-10-23; [data dictionary](https://github.com/EruditionHerta/AEIRD/blob/master/data_documentation.md), accessed 2026-10-23.
- [ChatGPT study taxonomy transcription](https://github.com/hanfang/chatgpt-usage-taxonomies), accessed 2026-10-23.
