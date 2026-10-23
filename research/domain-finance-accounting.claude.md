# Domain: finance and accounting

- **Question:** Which repeated LLM tasks exist in finance and accounting (categorisation, invoice and expense coding, reconciliation, KYC/AML), who corrects them, and what public data exists?
- **Author:** Claude (Claude Code, Opus 5.5)
- **Date:** 2026-10-23

## Summary

- Transaction categorisation is a measured weak spot for general LLMs: zero-shot GPT-4o ~60% vs a fine-tuned classifier ~73% on SME bank transactions; an LLM matched expert labels 80% of the time on 14,799 transactions in 24 categories, failing most on rare and ambiguous categories. [arXiv 2508.05425](https://arxiv.org/html/2508.05425v1), [ICAIF workshop](https://www.sea.dev/assets/ICAIF_workshop_paper-llms.pdf)
- Accounts payable vendors claim per-company learning from coding history: Ramp says accounting fields are right 85% of the time on first pass, up to 99% for extraction and coding (vendor claims). [Ramp](https://ramp.com/blog/accounts-payable/ai-in-accounts-payable)
- AML monitoring is dominated by false positives: vendor and industry figures put 85–99% of alerts as false; an LLM-only triage baseline scored PR-AUC 0.52 / F1 0.41, below classical ML. [arXiv 2604.19755](https://arxiv.org/pdf/2604.19755)
- UK context: Making Tax Digital for Income Tax started April 2026 for ~864,000 sole traders and landlords over £50,000 qualifying income (quarterly digital updates); thresholds fall to £30,000 (2027) and £20,000 (2028). [AAT Comment](https://www.aatcomment.org.uk/?p=57957), [Price Bailey](https://www.pricebailey.co.uk/guides/mtd-guide/)
- Public data is thinner than in software: no open, labelled bank-transaction dataset was confirmed; receipts (CORD, CC BY 4.0), FinQA and UK Companies House iXBRL accounts are available.

## Findings

### Repeated LLM tasks today

| Task | Input → output | Who, how often | Example products |
| --- | --- | --- | --- |
| Bank transaction categorisation | description, amount, counterparty → category | every transaction; bookkeepers, personal-finance apps | NatWest Enriched Transactions, Finexer, ExpenseSorted |
| Invoice / expense GL coding | invoice or receipt → GL account, cost centre, VAT code | AP teams, per invoice; Vic.ai targets 1,000+ invoices/month | Ramp AP Agent, Brex, Vic.ai |
| Reconciliation | bank line + ledger entries → match | month-end close | Ledge, Numeric |
| AML alert triage | alert + customer context → escalate / dismiss + rationale | Level 1 analysts, 30–45 min per alert (vendor estimate) | many vendors |
| Receipt extraction | image → structured fields | expense claims | Brex (claims 97% invoice scan accuracy) |

Sources: [NatWest](https://www.openbankingexpo.com/news/natwest-launches-new-transaction-categorisation-service/), [Finexer](https://blog.finexer.com/transaction-categorisation-api-uk-vat-bookkeeping/), [Ramp](https://ramp.com/blog/accounts-payable/best-accounts-payable-automation-software), [rework](https://resources.rework.com/tools/ai-agents/best-ai-agents-for-accounts-payable-2026), [Ledge](https://ledge.co/content/month-end-close-benchmarks-for-2025), [particula](https://particula.tech/blog/aml-alert-triage-ai-false-positives) (search summaries)

### Where corrections arise and who makes them

- Bookkeepers and app users re-categorise transactions; one vendor blog claims accuracy rises from ~70–80% for new users to 94–97% after 200+ corrections (no data cited). [ExpenseSorted](https://www.expensesorted.com/blog/beyond-llms-sentence-transformers-for-transaction-categorization) (search summary; anecdotal)
- The SME study attributes GPT-4o's shortfall to missing historical patterns and company-specific knowledge. [arXiv 2508.05425](https://arxiv.org/html/2508.05425v1) (search summary)
- AP clerks and controllers override suggested GL codes; Ramp says its auto-coding "learns from your team's coding history"; its Accounting Agent (Feb 2026) reportedly reaches 90%+ on items marked ready to sync. [Ramp](https://ramp.com/blog/ai-accounting-software), [Numeric](https://www.numeric.io/blog/ai-accounting-tools) (search summaries; vendor claims)
- AML analysts dismiss 90–98% of alerts manually (vendor figures); a preregistered study of five zero-shot models on 600 synthetic cases found false-positive rates from 0.3% to 83.0% on the same 300 legitimate cases. [tecla](https://www.tecla.io/blog/agentic-ai-aml-compliance), [Research Square](https://www.researchsquare.com/article/rs-10721656) (search summaries)
- Evidence-grounded (RAG) workflows improved LLM AML triage over the LLM-only baseline. [arXiv 2604.19755](https://arxiv.org/pdf/2604.19755) (search summary)

### Stated pain points

- Month-end close: half of finance teams take six or more business days; 18% close in three days or less; cash reconciliation 20–50 hours per month for many teams (Ledge 2025). Bank reconciliation was the second most time-consuming close activity (17%) in Sage's 2024 survey. [CFO.com](https://www.cfo.com/news/50-of-finance-take-week-to-close-books-zone-close-survey/746085/), [Ledge](https://ledge.co/content/month-end-close-benchmarks-for-2025), [Accounting Times](https://accountingtimes.com.au/profession/sage-research-reveals-top-pain-points-for-financial-close) (search summaries)
- AML workload: a bank with 1,000 alerts/day at 30–45 min each would spend up to ~700 analyst hours/day (vendor estimate). [particula](https://particula.tech/blog/aml-alert-triage-ai-false-positives) (search summary)
- MTD for Income Tax requires digital records and quarterly summaries from April 2026 (first quarterly update reported due 2026-08-07). [beancount](https://beancount.io/blog/2026/08/13/making-tax-digital-income-tax-april-2026-uk-guide), [Wise](https://wise.com/gb/blog/making-tax-digital) (search summaries; not checked on GOV.UK)

### Public datasets and APIs

| Dataset / API | Size | Licence / access | Link |
| --- | --- | --- | --- |
| CORD (receipts, Indonesian) | ~1.9 GB; images + boxes + multi-level labels | CC BY 4.0 (some derivatives CC BY-NC) | [GitHub](https://github.com/clovaai/cord) |
| FinQA | numerical QA over S&P 500 earnings reports | built on FinTabNet (CDLA-Permissive); repo licence not checked | [arXiv 2109.00122](https://arxiv.org/pdf/2109.00122) |
| ConvFinQA | 3,892 conversations, 14,115 questions | not found | [Papers with Code](https://paperswithcode.com/dataset/convfinqa) |
| SME bank transactions study data | 14,799 labelled transactions, 24 categories (ICAIF) | availability not confirmed | [sea.dev](https://www.sea.dev/assets/ICAIF_workshop_paper-llms.pdf) |
| Companies House accounts bulk data (UK) | daily iXBRL/XBRL files; >90% coverage per a CH forum reply, 100% expected 2027 | free | [GOV.UK](https://www.gov.uk/government/news/companies-house-free-accounts-data-wins-international-award), [CH forum](https://forum.companieshouse.gov.uk/t/financial-data-from-api-bulk-data-file-xbrl/11859) |
| Companies House streaming / REST API | live; 600 requests per 5 min | free key | see [drift-and-fast-refresh.claude.md](drift-and-fast-refresh.claude.md) |
| UK open banking categories | no shared standard found; NatWest categories described as aligned to FCA standards | — | [Crowdfund Insider](https://www.crowdfundinsider.com/2023/10/214017-natwest-to-provide-transaction-categorization-to-uk-clients-as-extension-to-open-banking-apis/) |

## Gaps

- An open, labelled bank-transaction categorisation dataset with a clear licence: not found.
- SROIE licence: not found.
- Independent (non-vendor) accuracy or correction-rate data for AP coding tools: not found.
- KYC and adverse-media screening: not covered by results.

## Sources

- [Categorising SME Bank Transactions (arXiv 2508.05425)](https://arxiv.org/html/2508.05425v1); [LLMs for SME bank transactions (ICAIF)](https://www.sea.dev/assets/ICAIF_workshop_paper-llms.pdf), accessed 2026-10-23
- [Ramp AP](https://ramp.com/blog/accounts-payable/ai-in-accounts-payable); [Ramp AI accounting](https://ramp.com/blog/ai-accounting-software); [Numeric](https://www.numeric.io/blog/ai-accounting-tools); [rework](https://resources.rework.com/tools/ai-agents/best-ai-agents-for-accounts-payable-2026), accessed 2026-10-23
- [Explainable AML triage (arXiv 2604.19755)](https://arxiv.org/pdf/2604.19755); [Research Square](https://www.researchsquare.com/article/rs-10721656); [particula](https://particula.tech/blog/aml-alert-triage-ai-false-positives); [tecla](https://www.tecla.io/blog/agentic-ai-aml-compliance), accessed 2026-10-23
- [AAT Comment on MTD](https://www.aatcomment.org.uk/?p=57957); [Price Bailey](https://www.pricebailey.co.uk/guides/mtd-guide/); [beancount MTD guide](https://beancount.io/blog/2026/08/13/making-tax-digital-income-tax-april-2026-uk-guide), accessed 2026-10-23
- [Ledge month-end benchmarks](https://ledge.co/content/month-end-close-benchmarks-for-2025); [CFO.com](https://www.cfo.com/news/50-of-finance-take-week-to-close-books-zone-close-survey/746085/), accessed 2026-10-23
- [CORD](https://github.com/clovaai/cord); [FinQA](https://arxiv.org/pdf/2109.00122); [Companies House free accounts data](https://www.gov.uk/government/news/companies-house-free-accounts-data-wins-international-award), accessed 2026-10-23
- All via web search summaries; pages were not opened (network policy).
