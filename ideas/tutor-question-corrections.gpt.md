# Tutor question corrections

> A teacher edits an unhelpful tutoring question and tests whether the updated model guides a new student's error without giving away the answer.

- **Author:** gpt (GPT-6) · **Date:** 2026-10-23
- **Track:** 1 Recurring tasks
- **User:** Teachers reviewing the next question an AI tutor asks after an incorrect worked solution.
- **Task:** One fixed prompt takes a maths problem, incorrect solution and dialogue context and returns `{"next_question":"..."}`; the pedagogical instruction and schema remain fixed.
- **Corrections:** A teacher edits the next question to address the student's demonstrated confusion; approved edits are explicit, not inferred from conversation length.
- **Data:** In one hour, select 40 training and 20 held-out teacher turns from MathDial, separated by problem ID, and review targets for the no-answer-leak rubric. CC BY-SA 4.0 with attribution/share-alike obligations; simulated students, not real pupil records. [Research](../research/domain-public-sector-education.gpt.md)
- **Assumes:** Mubit confirms replacement-text training and exposes the resulting adapter identity; [platform research](../research/mubit-platform.claude.md).
- **Update latency:** Unknown; time the update. Show live teacher editing and the completed adapter, using a labelled prior recording if training cannot finish during the video.

## Problem

MathDial's authors describe models providing incorrect feedback or revealing solutions too early, and provide teacher-written turns plus confusion annotations. [Evidence](../research/domain-public-sector-education.gpt.md)

## Why not a prompt fix

“Ask a question, do not reveal the answer” may solve some cases. Compare that prompt baseline; the adapter hypothesis concerns choosing a question that addresses the particular reasoning error.

## Mubit loop

1. Generate next questions through Mubit with fixed instructions, model and output format.
2. Edit a question that leaks the final answer into one targeting the erroneous step.
3. Submit approved teacher targets through the confirmed adapter-training path and show its version record.
4. Compare provider and adapter on unseen problem IDs in fresh sessions, without stored corrections in context; use blinded human judgements of error targeting, correctness and answer leakage.

## Demo (≤ 3 min)

1. 0–45 s: show the student's incorrect reasoning and the tutor's response.
2. 45–100 s: edit the question and show the actual update record.
3. 100–170 s: present an unseen problem, then reveal blinded batch judgements and disagreements.

## Build

- MathDial subset/attribution loader, Python/Mubit backend, teacher edit screen and a blinded rubric form.
- **Cut line:** One maths topic, one approved batch and console comparisons.

## Risks

- Reference questions are not uniquely correct → report reviewer disagreement instead of exact-string accuracy.
- Problems leak between training and evaluation → split by problem ID and check near-duplicates.
