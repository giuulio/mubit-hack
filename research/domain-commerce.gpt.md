# Commerce: product relevance, taxonomy and moderation

- **Question:** Which repeated commerce-language tasks have public labels, human correction paths and documented products?
- **Author:** gpt (GPT-6)
- **Date:** 2026-10-23

## Summary

- Amazon's ESCI dataset labels query/product relevance as Exact, Substitute, Complement or Irrelevant in English, Spanish and Japanese. [Dataset](https://github.com/amazon-science/esci-data)
- Shopify publishes categories, attributes, values and mappings for its Standard Product Taxonomy, spanning 25+ verticals. [Official repository](https://github.com/Shopify/product-taxonomy)
- A merchant's Essential Oils category request documents a terminology mismatch; it does not show an LLM-generated error. [Issue](https://github.com/Shopify/product-taxonomy/issues/899)
- HateXplain includes post-level labels, target communities and human rationale annotations, but is a social-media dataset rather than a product-review moderation benchmark. [Dataset](https://github.com/hate-alert/HateXplain)

## Findings

### Repeated tasks and existing systems

- Amazon's dataset authors describe three tasks: ranking products for a query, classifying query/product pairs into ESCI classes and identifying substitutes. The data are manually annotated difficult shopping queries, not a record of live LLM deployment. [Author documentation](https://github.com/amazon-science/esci-data)
- Shopify's taxonomy is integrated into Shopify and marketplaces according to its official README. It exposes category, attribute and value data plus mapping rules; taxonomists can submit category-change and localisation requests. [Product documentation](https://github.com/Shopify/product-taxonomy)
- The taxonomy's public distribution supports TXT and JSON and currently directs integrators to release assets such as `categories.en.json.gz`. Its README says the committed `dist/` directory is deprecated and scheduled for removal on 2026-10-31. [Current distribution instructions](https://github.com/Shopify/product-taxonomy)
- Merchant requests can produce explicit category or terminology corrections: issue #899 says Essential Oils lacks a dedicated category and existing fragrance-oil/diffuser choices use incorrect terminology. This is a first-person report about the taxonomy. [Merchant report, 2026-04-24](https://github.com/Shopify/product-taxonomy/issues/899)
- HateXplain's authors describe a moderation-related classification task with hate/offensive/normal labels, affected communities and rationale spans. They report that classification performance and explanation quality are different measured properties. [Author abstract](https://github.com/hate-alert/HateXplain)

### Data, formats and licences

| Resource | Size and format | Existing labels and reuse evidence |
| --- | --- | --- |
| Amazon ESCI reduced | 48,300 unique queries and 1,118,011 query/item judgements; examples/products in Parquet | E/S/C/I relevance labels; product title, description, bullet point, brand, colour and locale. The repository root is Apache-2.0; a separate dataset-specific terms statement was not established. [README](https://github.com/amazon-science/esci-data) · [Root licence](https://github.com/amazon-science/esci-data/blob/main/LICENSE) |
| Amazon ESCI larger | README prose says 130,652 queries and 2,621,738 judgements; Table 2 instead says 2,621,288 judgements | The inconsistency is in the source; neither value was silently substituted for the other. [README and Table 2](https://github.com/amazon-science/esci-data) |
| Shopify taxonomy | Categories/attributes/values spanning 25+ verticals; release-asset TXT/JSON distributions | Taxonomy structure and mappings, not a corpus of product descriptions paired with assigned categories. Dataset-specific licence details were not verified in this pass. [README](https://github.com/Shopify/product-taxonomy) |
| HateXplain | JSON-format social-media posts, annotators, token rationales and target-community labels; exact current record count and dataset licence not verified here | Public annotations for moderation-related research; social-media labels do not establish a merchant's review policy. [README](https://github.com/hate-alert/HateXplain) |

- ESCI provides official train/test splits and `query_id`, `product_id` and locale identifiers; its examples are joined to product metadata by product and locale. [Schema and examples](https://github.com/amazon-science/esci-data)
- Shopify documents stable release URLs and an unstable release tracking `main`; a taxonomy version can therefore be identified separately from a classifier implementation. [Distribution instructions](https://github.com/Shopify/product-taxonomy)

### Corrections, operators and pain evidence

- Merchants/integrators submit taxonomy changes and localisation fixes; the repository explicitly separates integrators, taxonomists and pipeline developers as users. [Official workflow](https://github.com/Shopify/product-taxonomy)
- ESCI labels express relevance judgements about a query/product pair. A category label alone does not encode whether a product is a substitute or a complement for a particular query. [Task definitions](https://github.com/amazon-science/esci-data)
- HateXplain's rationale annotations document which tokens motivated a label, rather than only a final class. They are human annotation evidence, not moderator override histories from an e-commerce platform. [Dataset description](https://github.com/hate-alert/HateXplain)

## Gaps

- Production LLM call volumes for product categorisation, listing generation, review moderation and marketing-copy compliance were not found in the inspected sources.
- No licensed corpus of merchant-specific marketing-policy corrections or rejected listing drafts was verified. No proprietary catalogue or review history was accessed.
- The root software licence of a repository was not assumed to settle the rights of every product text, source post or dataset it references.
- ESCI's large-version judgement count is internally inconsistent; no data-file count was performed to resolve it.

## Sources

- [Amazon ESCI documentation](https://github.com/amazon-science/esci-data) and [root Apache-2.0 licence](https://github.com/amazon-science/esci-data/blob/main/LICENSE), accessed 2026-10-23.
- [Shopify Standard Product Taxonomy](https://github.com/Shopify/product-taxonomy), accessed 2026-10-23.
- [Essential Oils taxonomy request #899](https://github.com/Shopify/product-taxonomy/issues/899), accessed 2026-10-23.
- [HateXplain](https://github.com/hate-alert/HateXplain), accessed 2026-10-23.
