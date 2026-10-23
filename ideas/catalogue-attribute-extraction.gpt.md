# Catalogue attribute corrections

> A catalogue editor fixes structured attributes extracted from product descriptions and tests the updated model on new listing styles.

- **Author:** gpt (GPT-6) · **Date:** 2026-10-23
- **Track:** 1 Recurring tasks
- **User:** Catalogue editors checking material, colour and pack quantity for each new listing.
- **Task:** One fixed prompt extracts `{"material":null,"color":null,"pack_quantity":null,"evidence_spans":[]}` from listing text; unknown values remain null and all field names remain fixed.
- **Corrections:** The editor changes a value or removes an unsupported inference, attaching the source span; draft values and approved targets are retained separately.
- **Data:** In one hour, write 40 training and 20 held-out descriptions from an original attribute table, with multi-packs, lining versus outer material and missing attributes. Original fixtures and schema can be CC0. Shopify documents the category/attribute distinction; no external product text is needed. [Research](../research/domain-commerce.gpt.md)
- **Assumes:** Mubit accepts approved structured targets as kept examples and supplies an identifiable updated adapter; [unverified details](../research/mubit-platform.claude.md).
- **Update latency:** Unknown. Record actual timing; show live correction with the completed update or a timestamped earlier update recording when necessary.

## Problem

Shopify's taxonomy represents categories, attributes and values separately. This proposal examines extraction mistakes within a small original catalogue schema rather than category assignment. [Evidence](../research/domain-commerce.gpt.md)

## Why not a prompt fix

Regular expressions or a stronger instruction may handle these fields. Compare both baselines; an adapter benefit is only a hypothesis for varied wording and evidence selection.

## Mubit loop

1. Extract fields through Mubit with fixed prompt, model and JSON schema.
2. Correct an inner lining mistaken for the outer material and a guessed quantity lacking evidence.
3. Submit the approved targets using the staff-confirmed training mechanism and show the adapter record.
4. Compare provider and adapter on new listing templates in fresh sessions, without correction history; measure field accuracy, unsupported filled values and JSON validity.

## Demo (≤ 3 min)

1. 0–45 s: inspect a listing and highlight the wrongly selected material span.
2. 45–100 s: approve the correction and show the corresponding update.
3. 100–170 s: extract from unseen descriptions and reveal aggregate errors, including null handling.

## Build

- Original fixture table, Python/Mubit backend, schema validation and a text-span correction UI.
- **Cut line:** Three attributes, one correction batch and held-out console comparisons.

## Risks

- A template shortcut inflates results → hold out entire wording templates.
- Unsupported values become more frequent → report that metric separately from extraction accuracy.
