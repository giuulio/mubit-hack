# Public sector and education: answers, casework and feedback

- **Question:** Which public-service and education tasks have documented AI use, human review and reusable public or synthetic data?
- **Author:** gpt (GPT-6)
- **Date:** 2026-10-23

## Summary

- GOV.UK Chat's public repository describes an LLM assistant grounded in GOV.UK content, input/output guardrails and answer feedback. [Project](https://github.com/alphagov/govuk-chat)
- Khan Academy's supplier case study describes Khanmigo as a student tutor and teacher assistant; it does not give inference counts. [Customer account](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/khan-academy.mdx)
- MathDial contains 2,861 human-teacher/simulated-student conversations with error descriptions and pedagogical annotations, under CC BY-SA 4.0. [Dataset](https://github.com/eth-nlped/mathdial)
- FairytaleQA documents expert-labelled narrative-comprehension questions and answers across 278 children's stories. These are not student essays or teacher marks. [Dataset](https://github.com/uci-soe/FairytaleQAData)

## Findings

### Public-service content and FOI

- GOV.UK Chat describes questions, generated answers and supporting sources from chunks of GOV.UK content. Its public application is Ruby on Rails and was initially launched as a limited-access beta. [Official README](https://github.com/alphagov/govuk-chat)
- Its guardrail documentation distinguishes a user-question jailbreak check from checks on generated output, including excluded information categories. It describes the guardrails as another LLM call. Some prompt configuration lives in a private repository. [Official documentation](https://github.com/alphagov/govuk-chat/blob/main/docs/guardrails.md)
- Its `AnswerFeedback` model records positive/negative reactions attached to an answer and supports export within a date range; this source does not show staff-authored corrected answers. [Public model](https://github.com/alphagov/govuk-chat/blob/main/app/models/answer_feedback.rb)
- GOV.UK's Content Store documentation exposes `https://www.gov.uk/api/content/<path>` publicly, returning a JSON content representation. A content item can be a page, collection or metadata item. [API specification source](https://github.com/alphagov/content-store/blob/main/docs/content-store-api.md)
- Alaveteli is an existing open-source FOI-request platform originating from WhatDoTheyKnow. Its README does not claim an LLM caseworker or provide a labelled FOI-routing dataset. [Project](https://github.com/mysociety/alaveteli)

### Tutoring, marking and human feedback

- **Customer claim:** Khan Academy's Khanmigo is a student tutor and teaching assistant. The 2025-08-01 supplier case study reports Langfuse usage by more than 100 staff across 7 product and 4 infrastructure teams; these are staff/tool-adoption counts, not counts of students' AI sessions. [Source](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/khan-academy.mdx)
- MathDial's authors state that problem-solving models can provide incorrect feedback or reveal a solution too early. Their collection pairs human teachers with an LLM simulating common student errors, rather than recording real children's tutoring sessions. [Author abstract](https://github.com/eth-nlped/mathdial)
- MathDial records `student_incorrect_solution`, a teacher's free-text confusion description, tutoring dialogue acts and whether the student solved the problem, including the option “Yes, but I had to reveal the answer”. These are separate annotation fields. [Schema](https://github.com/eth-nlped/mathdial)
- FairytaleQA's educational experts label answers and narrative elements from stories for kindergarten-to-eighth-grade comprehension. Its expert answers are reference outputs, not observed corrections to an LLM's answer. [Author description](https://github.com/uci-soe/FairytaleQAData)

### Public data and API inventory

| Resource | Size, format and ground truth | Licence/access evidence |
| --- | --- | --- |
| MathDial | 2,861 conversations in CSV/JSONL train/test files; full conversation, problem, correct answer, incorrect solution and teacher annotations | CC BY-SA 4.0 explicitly declared. Observed train file has 2,262 JSONL records. [README](https://github.com/eth-nlped/mathdial) · [Train file](https://github.com/eth-nlped/mathdial/blob/main/data/train.jsonl) |
| FairytaleQA | 278 stories; README's loader example lists 8,548 train, 1,025 validation and 1,007 test QA rows; story sections and expert questions/answers | Repository root has Apache-2.0; underlying stories come from Project Gutenberg and story-specific/public-domain territorial rights were not audited. [README](https://github.com/uci-soe/FairytaleQAData) · [Root licence](https://github.com/uci-soe/FairytaleQAData/blob/main/LICENSE) |
| GOV.UK Content API | JSON content items retrieved by public page path; no fixed corpus size or labelled answer set specified in the inspected API document | Public endpoint documented; live access, rate limits and content-reuse terms not verified in this environment. [Specification](https://github.com/alphagov/content-store/blob/main/docs/content-store-api.md) |
| Alaveteli | FOI-request/response application; no packaged LLM ground-truth dataset established in the inspected README | Public software repository does not by itself grant rights to every request/response on deployed sites. [README](https://github.com/mysociety/alaveteli) |

- **Observed:** A local standard-library JSON parser counted 2,262 MathDial training records and confirmed the documented confusion, solution and conversation fields. The training file was retrieved on 2026-10-23; no model was run. [Official file](https://github.com/eth-nlped/mathdial/blob/main/data/train.jsonl)

## Gaps

- No public-sector or school production request volume, marking workload count or teacher time-saving estimate was independently established.
- Current FOI-triage labels, automated casework decisions and approved government-answer corrections were not found in the inspected sources.
- Direct GOV.UK API access and hosted educational product documentation were not validated because of the network restrictions. Public source code does not establish the current deployed service's complete behaviour.
- No real pupil records, student essays, private casework or FOI correspondence were sent to a model. Marked-essay datasets and their reuse terms were not verified.

## Sources

- [GOV.UK Chat README](https://github.com/alphagov/govuk-chat), [guardrails](https://github.com/alphagov/govuk-chat/blob/main/docs/guardrails.md) and [feedback model](https://github.com/alphagov/govuk-chat/blob/main/app/models/answer_feedback.rb), accessed 2026-10-23.
- [GOV.UK Content Store API documentation](https://github.com/alphagov/content-store/blob/main/docs/content-store-api.md), accessed 2026-10-23.
- [Alaveteli](https://github.com/mysociety/alaveteli), accessed 2026-10-23.
- [Khan Academy customer case study](https://github.com/langfuse/langfuse-docs/blob/main/content/customers/khan-academy.mdx), accessed 2026-10-23.
- [MathDial](https://github.com/eth-nlped/mathdial) and [training JSONL](https://github.com/eth-nlped/mathdial/blob/main/data/train.jsonl), accessed and counted 2026-10-23.
- [FairytaleQA](https://github.com/uci-soe/FairytaleQAData) and [root licence](https://github.com/uci-soe/FairytaleQAData/blob/main/LICENSE), accessed 2026-10-23.
