# Domain: legal and compliance

- **Question:** Which repeated LLM tasks exist in legal and compliance work (contract review, clause extraction, policy and regulatory checks), who corrects them, and what public data exists?
- **Author:** Claude (Claude Code, Opus 5.5)
- **Date:** 2026-10-23

## Summary

- Purpose-built legal research tools still hallucinate: Stanford RegLab found Lexis+ AI and Thomson Reuters' tools hallucinated on 17–33% of 200+ preregistered queries (HAI reports Westlaw > 34%), fewer than GPT-4. [Stanford RegLab](https://reglab.stanford.edu/?p=3154), [Stanford HAI](https://hai.stanford.edu/news/ai-trial-legal-models-hallucinate-1-out-6-queries)
- Courts are seeing the errors: Damien Charlotin's database counted ~712 decisions worldwide dealing with hallucinated content by late December 2025, ~90% of them from 2025, rising by 5–6 a day. [Bloomberg Law](https://news.bloomberglaw.com/litigation/ai-faked-cases-become-core-issue-irritating-overworked-judges)
- Contract review accuracy is said to depend on the firm's **playbook** (approved positions), and no vendor publishes independent benchmarks. [AI Frontier Post](https://aifrontierpost.com/articles/ai-legal-tools-reviewed/), [alicelabs](https://alicelabs.ai/en/insights/ai-contract-analysis)
- NDAs are high-volume: reported 25–35% of in-house contracts (ACC 2024, secondary), ~2 hours each at one 12-lawyer firm (vendor case study). [vaquill](https://www.vaquill.ai/blog/most-in-house-legal-work-is-not-legal-risk), [lawve](https://lawve.ai/guides/ai-contract-review-case-study)
- Public data is good: CUAD (510 contracts, 41 clause types, CC BY 4.0), ContractNLI (~607 NDAs, CC BY 4.0 reported), LegalBench, UK Find Case Law (Open Justice Licence; computational analysis needs a licence). Mubit's Banyan Sapling targets policy-vs-evidence verification (see [mubit-ecosystem.claude.md](mubit-ecosystem.claude.md)).

## Findings

### Repeated LLM tasks today

| Task | Input → output | Who, how often | Example products |
| --- | --- | --- | --- |
| NDA / contract triage | contract → accept / review / reject + issues | in-house legal; 15–40 NDAs/month cited as typical AI buyers (vendor) | Spellbook, Luminance, LegalOn, Anthropic NDA Triage skill |
| Clause extraction and classification | contract → clauses by type | diligence, contract management | Luminance, Harvey, Ironclad |
| Playbook redlining | clause + playbook position → redline | per negotiation | Spellbook (Word add-in, redlines in document formatting) |
| Legal research with citations | question → answer + cited authorities | lawyers, litigants (incl. pro se) | Lexis+ AI, Westlaw AI-Assisted Research, CoCounsel, Harvey |
| Policy / regulatory compliance check | document or claim + policy → compliant / violation / missing info | compliance teams | Mubit Banyan Sapling (research preview) |

Sources: [guptadeepak](https://guptadeepak.com/tools/top-5-ai-legal-contract-tools-2026/), [lawve NDA guide](https://lawve.ai/guides/nda-review), [AI Frontier Post](https://aifrontierpost.com/articles/ai-legal-tools-reviewed/) (search summaries)

### Where corrections arise and who makes them

- Lawyers verify and edit AI redlines against the firm playbook; sources describe the playbook as "the real accuracy lever", and clauses describable in advance (confidentiality, termination, governing law) as easiest; clauses whose meaning depends on facts outside the document as hardest. [AI Frontier Post](https://aifrontierpost.com/articles/ai-legal-tools-reviewed/), [alicelabs](https://alicelabs.ai/en/insights/ai-contract-analysis) (search summaries)
- One comparison reports 90–95% accuracy on standard clauses (indemnification, limitation of liability, governing law) without citing a study. [legalfly](https://www.legalfly.com/post/best-ai-contract-review-software) (search summary)
- LawGeex (vendor-run, older): on issue-spotting in five NDAs, lawyers averaged 85% accuracy in 92 minutes vs 94% for the AI. [LawGeex](https://blog.lawgeex.com/20-top-lawyers-were-beaten-by-legal-ai-here-are-their-surprising-responses) (search summary)
- Judges and opposing counsel catch fabricated citations; many come from pro se litigants. [Bloomberg Law](https://news.bloomberglaw.com/litigation/ai-faked-cases-become-core-issue-irritating-overworked-judges) (search summary)

### Stated pain points

- Stanford RegLab (preregistered, 200+ queries across general research, jurisdiction/time-specific, false-premise and factual recall): vendor claims of "hallucination-free" citations were overstated. [Stanford HAI](https://hai.stanford.edu/news/ai-trial-legal-models-hallucinate-1-out-6-queries) (search summary)
- Turnaround mismatch: sales teams most often expect NDA turnaround in 3–5 days, legal departments in 1–2 days (Lexion survey). [Legal Dive](https://www.legaldive.com/news/sales-teams-view-about-legal-departments-lexion-legal-tech-survey/704796/) (search summary)
- 58% of surveyed lawyers had used AI for contract review in the prior 12 months (self-selected sample). [lawve](https://lawve.ai/guides/ai-contract-review-case-study) (search summary)
- Regulation is moving: an EU "Digital Omnibus" amendment reportedly published 2026-07-24 moves stand-alone Annex III high-risk AI obligations from 2026-08-02 to 2027-12-02 and Annex I product-embedded AI to 2028-08-02; Article 50 transparency duties largely keep their original dates. [Gibson Dunn](https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/), [CASRAI](https://www.casrai.org/news/eu-ai-act-digital-omnibus-deadline-delay), [Sidley](https://datamatters.sidley.com/2026/06/22/eu-lawmakers-reach-provisional-agreement-to-delay-key-eu-ai-act-obligations/) (search summaries; Official Journal publication confirmed by one source only)

### Public datasets and APIs

| Dataset / API | Size | Licence / access | Link |
| --- | --- | --- | --- |
| CUAD | 510 commercial contracts, 41 clause categories, 13,000+ labels | CC BY 4.0 | [Hugging Face](https://huggingface.co/datasets/theatticusproject/cuad), [TFDS](https://tensorflow.google.cn/datasets/community_catalog/huggingface/cuad?hl=en) |
| ContractNLI | ~607 contracts, mainly NDAs; NLI labels per hypothesis | CC BY 4.0 (secondary source) | [arXiv 2511.00340 refs](https://arxiv.org/pdf/2511.00340) |
| LegalBench | collaboratively built legal reasoning tasks; includes 38 binary CUAD clause tasks; "162 tasks" not confirmed | not confirmed | [arXiv 2308.11462](https://arxiv.org/pdf/2308.11462), [Hugging Face](https://huggingface.co/datasets/nguha/legalbench) |
| CLAUSE discrepancy benchmark | audits LLM legal reasoning on contract discrepancies | not checked | [arXiv 2511.00340](https://arxiv.org/pdf/2511.00340) |
| UK Find Case Law (The National Archives) | court judgments, API | Open Justice Licence (commercial reuse allowed); computational analysis requires applying for a licence; bulk downloads prohibited | [terms](https://caselaw.nationalarchives.gov.uk/terms-of-use), [re-use](https://caselaw.nationalarchives.gov.uk/re-use-find-case-law-records) |
| legislation.gov.uk API | UK legislation | not confirmed by search | not found |
| AI hallucination cases database (Charlotin) | ~712 decisions (Dec 2025) | not checked | via [Bloomberg Law](https://news.bloomberglaw.com/litigation/ai-faked-cases-become-core-issue-irritating-overworked-judges) |

## Gaps

- Independent accuracy benchmarks for Harvey, Spellbook, Luminance: not found.
- LegalBench task count and licence; legislation.gov.uk API terms: not confirmed.
- UK-specific regulator guidance on AI use by solicitors (SRA): not searched.

## Sources

- [Stanford RegLab](https://reglab.stanford.edu/?p=3154); [Stanford HAI](https://hai.stanford.edu/news/ai-trial-legal-models-hallucinate-1-out-6-queries), accessed 2026-10-23
- [Bloomberg Law: AI-faked cases](https://news.bloomberglaw.com/litigation/ai-faked-cases-become-core-issue-irritating-overworked-judges), accessed 2026-10-23
- [AI Frontier Post](https://aifrontierpost.com/articles/ai-legal-tools-reviewed/); [alicelabs](https://alicelabs.ai/en/insights/ai-contract-analysis); [legalfly](https://www.legalfly.com/post/best-ai-contract-review-software); [guptadeepak](https://guptadeepak.com/tools/top-5-ai-legal-contract-tools-2026/), accessed 2026-10-23
- [LawGeex](https://blog.lawgeex.com/20-top-lawyers-were-beaten-by-legal-ai-here-are-their-surprising-responses); [Legal Dive / Lexion](https://www.legaldive.com/news/sales-teams-view-about-legal-departments-lexion-legal-tech-survey/704796/); [vaquill](https://www.vaquill.ai/blog/most-in-house-legal-work-is-not-legal-risk); [lawve](https://lawve.ai/guides/ai-contract-review-case-study), accessed 2026-10-23
- [Gibson Dunn](https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/); [CASRAI](https://www.casrai.org/news/eu-ai-act-digital-omnibus-deadline-delay); [Sidley](https://datamatters.sidley.com/2026/06/22/eu-lawmakers-reach-provisional-agreement-to-delay-key-eu-ai-act-obligations/), accessed 2026-10-23
- [CUAD](https://huggingface.co/datasets/theatticusproject/cuad); [LegalBench](https://arxiv.org/pdf/2308.11462); [CLAUSE](https://arxiv.org/pdf/2511.00340); [Find Case Law terms](https://caselaw.nationalarchives.gov.uk/terms-of-use), accessed 2026-10-23
- All via web search summaries; pages were not opened (network policy).
