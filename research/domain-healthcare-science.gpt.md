# Healthcare and science: text review and evidence screening

- **Question:** Which repeated scientific and medical-text tasks have documented human corrections and public or synthetic data paths?
- **Author:** gpt (GPT-6)
- **Date:** 2026-10-23

## Summary

- MEDEC specifies medical-text error detection, error-sentence identification and sentence correction across 3,848 clinical texts; its UW collection requires approval and a data-use agreement. [Dataset](https://github.com/abachaa/MEDEC)
- SYNERGY contains 169,288 records from 26 systematic reviews, including 2,834 inclusion labels, and declares CC0 1.0. [Dataset](https://github.com/asreview/synergy-dataset)
- ASReview is an existing interactive screening product that saves and permits changes to reviewers' inclusion/exclusion labels. Its active-learning workflow is not evidence of an LLM weight update. [Project](https://github.com/asreview/asreview)
- Merck describes scientific retrieval and medical response-document drafting in a customer case study; per-task inference volumes are not provided. [Customer account](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/merckgroup.mdx)

## Findings

### Workflows, people and existing products

- **Medical text:** MEDEC's task asks a system to identify whether a text contains an error, locate the erroneous sentence and produce a corrected sentence. Its paper abstract, reproduced by the authors, reports comparison with two medical doctors and says the evaluated LLMs were outperformed by those doctors. It does not establish error rates in clinical deployment. [Author account, ACL 2025](https://github.com/abachaa/MEDEC)
- **Clinical concept linking:** MedCAT documents extracting information from EHRs and linking concepts to SNOMED-CT/UMLS. Its legacy repository now points to CogStack NLP; some model downloads require NIH/UMLS authentication. This is an existing clinical NLP tool, not proof of current LLM-based coding throughput. [Project and access conditions](https://github.com/CogStack/MedCAT)
- **Literature screening:** ASReview imports bibliographic records, asks reviewers for Relevant/Not Relevant labels, prioritises further records and exports decisions. Its documented label management permits changes; the unit of repeated work is a candidate record. [Product workflow](https://github.com/asreview/asreview)
- **Laboratory knowledge:** Merck's supplier case study describes an Electronics Lab Assistant connected to 80k+ documents and experimental data, and a medical-information application drafting and updating response documents to healthcare-professional questions. These are customer claims; neither daily request counts nor measured clinical outcomes are given. [Case study](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/merckgroup.mdx)

### Public datasets and access boundaries

| Resource | Size, labels and format | Licence/access evidence |
| --- | --- | --- |
| MEDEC | 3,848 texts: 2,189 MS train, 574 MS validation, 597 MS test, 160 UW validation and 328 UW test. Correct/error flag, error sentence and corrected sentence | Authors declare CC BY 4.0. MEDEC-MS is public on GitHub; MEDEC-UW needs pre-approval and a signed DUA. [README](https://github.com/abachaa/MEDEC) |
| SYNERGY | 169,288 academic works from 26 reviews; 2,834 included. OpenAlex-style metadata, plaintext abstracts for ML and `label_included` | CC0 1.0 declared for the dataset. Per-review eligibility criteria are supplied; labels refer to inclusion after full-text screening. [README](https://github.com/asreview/synergy-dataset) |
| PubMedQA labelled subset | Observed 1,000 records in `data/ori_pqal.json`; question, abstract contexts, long answer and `final_decision` (`yes`, `no`, `maybe`) | Public file retrieved without credentials. A dataset licence was not established from the inspected README; public access is not recorded as a reuse grant. [README](https://github.com/pubmedqa/pubmedqa) · [File](https://github.com/pubmedqa/pubmedqa/blob/master/data/ori_pqal.json) |
| SciFact | Scientific claims paired with evidence documents, labels and rationale sentences; BEIR lists 5,183 corpus documents and 300 test queries | Schemas and download links are public; a dataset-specific licence was not established in the inspected SciFact README. [SciFact](https://github.com/allenai/scifact) · [BEIR table](https://github.com/beir-cellar/beir) |

- **Observed:** A local Python JSON load counted 1,000 labelled PubMedQA entries and confirmed `QUESTION`, `CONTEXTS`, `LONG_ANSWER` and `final_decision` fields on 2026-10-23. This checked file structure, not annotation correctness. [Source file](https://github.com/pubmedqa/pubmedqa/blob/master/data/ori_pqal.json)
- SYNERGY includes medicine reviews with different class distributions: its table lists 258 records/15 inclusions for Donners_2021 and 7,216 records/583 inclusions for Leenaars_2020. These are complete-review counts, not daily workload estimates. [Dataset table](https://github.com/asreview/synergy-dataset)
- MEDEC's authors distinguish publicly available MS texts from the 488 UW notes requiring controlled access. The presence of a public repository does not make the UW subset anonymously downloadable. [Access section](https://github.com/abachaa/MEDEC)

### Where corrections arise and stated difficulties

- Review authors' include/exclude decisions are existing labels in SYNERGY; its README reports only 1.67% of records as included. ASReview describes using reviewers' labels to prioritise subsequent records. [SYNERGY](https://github.com/asreview/synergy-dataset) · [ASReview](https://github.com/asreview/asreview)
- MEDEC spans diagnosis, management, treatment, pharmacotherapy and causal-organism errors, and explicitly documents formatting issues in the original MS release. Its authors identify limitations of current evaluation metrics in their abstract. [Dataset and author discussion](https://github.com/abachaa/MEDEC)
- Merck's case study identifies auditable prompts, responses, cost and latency as requirements for enterprise trust and describes feedback entering scientific application development. This is attributed customer testimony. [Source](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/merckgroup.mdx)

## Gaps

- No real patient records, controlled UW notes, MIMIC data or terminology model packs were retrieved or sent to any model. No API calls or clinical model evaluations were run.
- Production throughput for clinical coding and trial-document review was not found in the inspected sources. Dataset sizes do not supply that throughput.
- Public trial-registry API availability, rate limits and document-reuse terms were not verified. The literature-screening resources above are not a trial-registry integration.
- SYNERGY's final full-text inclusion label can depend on information absent from an abstract; it is not proof that every title/abstract alone determines eligibility. [Label definition](https://github.com/asreview/synergy-dataset)

## Sources

- [MEDEC, including the ACL 2025 paper abstract and access conditions](https://github.com/abachaa/MEDEC), accessed 2026-10-23.
- [MedCAT legacy repository](https://github.com/CogStack/MedCAT), accessed 2026-10-23.
- [SYNERGY](https://github.com/asreview/synergy-dataset) and [ASReview](https://github.com/asreview/asreview), accessed 2026-10-23.
- [PubMedQA](https://github.com/pubmedqa/pubmedqa) and [labelled JSON](https://github.com/pubmedqa/pubmedqa/blob/master/data/ori_pqal.json), accessed and counted 2026-10-23.
- [SciFact](https://github.com/allenai/scifact) and [BEIR](https://github.com/beir-cellar/beir), accessed 2026-10-23.
- [Merck customer case study](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/merckgroup.mdx), accessed 2026-10-23.
