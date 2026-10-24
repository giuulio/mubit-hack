# Product criteria for Night Shift London

- **Purpose:** Select and shape a differentiated product whose correction-to-model-update loop is useful, measurable and demonstrable within the hackathon.
- **Author:** gpt (GPT-6) · **Date:** 2026-10-24
- **Status:** Niche-independent selection criteria. No candidate has been selected or assessed against this list.
- **Basis:** Synthesis of the team's research and subsequent discussion. These are our objectives and acceptance conditions, except where explicitly identified as event or repository rules.

## How to use this list

**Rules** are binding constraints. **Gates** are minimum conditions we set for a credible entry; an unresolved gate stays unknown. **Objectives** are qualities to maximise and trade off explicitly. **Conditional checks** apply when we make the associated claim. Originality and building beyond Mubit's default workflow are team priorities, not additional published judging categories.

Assess a candidate with criterion ID, `met | unmet | unknown | not applicable`, evidence and the next action. Use `not applicable` only for conditional checks. Resolve rules and gates first; then compare objectives without allowing an attractive score to conceal a failed gate. “Winning” describes our intent, not an outcome established by the research.

| Published judging category, equally weighted | Evidence our product should supply |
| --- | --- |
| Use of Mubit | An attributable correction becomes an identifiable model update in the demonstrated workflow |
| Usefulness | A named user repeatedly performs a task with a meaningful cost or failure consequence |
| Technical execution | Working integration, credible evaluation and explicit platform limits |
| Demo | A clear, memorable before/correction/update/after sequence within the submission limit |

Source: [event rules and staff Q&A](HACKATHON.md). The criteria below translate these into our own selection specification.

## 1. Binding constraints — rules

- **R01 — Build during the event.** All project code must have been written from 2026-10-23 at 19:30, Europe/London; existing OSS libraries and personal tooling follow the event allowance.
- **R02 — Finish before the hard deadline.** Code and submission must be ready before 2026-10-25 at 05:00, Europe/London. Reserve explicit time for evaluation, recording, export and upload.
- **R03 — Deliver the required artefacts.** Submit a video file of at most three minutes and a PDF deck; a hosted video link does not fulfil the recorded submission rules.
- **R04 — Route every project LLM call through Mubit.** Include generation, synthetic labelling, prompt optimisation, critique, grading and evaluation calls. Image/video model calls use the documented direct-call exception.
- **R05 — Use public or synthetic task data.** Apply this to inputs, examples, corrections, demonstrations and evaluation data because Mubit records request/reply content by default. Check reuse rights separately from public accessibility.
- **R06 — Preserve repository confidentiality and secrets.** Keep the repo private, do not publish its contents or share its link, and keep keys in environment variables rather than source, prompts, logs or client-side code.
- **R07 — Complete participation requirements.** Meet check-ins and team requirements, and ensure the required Sunday presence. Resolve the organiser's public-repo request through an approved arrangement consistent with our confidentiality instruction.

Basis: [AGENTS.md](AGENTS.md), [HACKATHON.md](HACKATHON.md). These rules are distinct from product differentiation objectives.

## 2. Originality and added value — objectives

- **D01 — Check actual competitive overlap.** Compare against available team descriptions, public event projects and existing products. Record what was checked and leave unavailable information unknown; absence from our research is not proof of an uncrowded space.
- **D02 — Name a precise differentiator.** Identify the distinct user insight, workflow, feedback mechanism, technical method or evaluation contribution. A different industry label alone is insufficient differentiation.
- **D03 — Add a meaningful layer above Mubit.** Our code should solve a problem Mubit does not already solve for its normal user: for example, interpreting corrections, validating outcomes, comparing adaptation strategies or managing their application to a workflow.
- **D04 — State the division of responsibility.** Explain separately what Mubit supplies and what we supply. Judges should be able to identify our contribution without reading the implementation.
- **D05 — Make Mubit consequential to the learning feature.** Identify which demonstrated capability depends on its task/adaptation machinery. Proxy traffic alone does not satisfy our differentiation objective or prove a model update.
- **D06 — Keep one coherent product wedge.** Demonstrate one valuable workflow and one defensible technical contribution before adding a general platform, multiple domains or extra agents.

Basis: our stated priorities; [winning application examples](research/hackathon-winners-ai-apps.gpt.md) and [model-centric examples](research/hackathon-winners-model-centric.claude.md) provide precedents, not a representative competitor census or a proven recipe for winning.

## 3. User value and task selection — gates and objectives

- **U01 — Gate: identify the user.** Name the person doing the work and the action they currently take; “enterprises” or “developers” alone is too broad.
- **U02 — Gate: identify the repeated unit of work.** Specify one input-to-output transformation with a stable task definition and varying cases. Its schema and completion condition must be explicit.
- **U03 — Objective: establish recurrence and consequences.** Supply evidence or clearly labelled assumptions about frequency, review burden, delay, errors or spend. Dataset size alone does not establish demand.
- **U04 — Gate: make success judgeable.** A reference answer, executable outcome, rubric or accessible reviewer must distinguish a useful output from a plausible one.
- **U05 — Gate: supply sufficient information.** The task's input must contain, or permit retrieval of, what a correct decision needs. Do not train against labels requiring facts withheld from the model.
- **U06 — Objective: learn from work already being done.** Prefer edits, overrides, approvals or execution outcomes arising naturally during the workflow; measure any extra annotation effort we introduce.
- **U07 — Objective: demonstrate material headroom.** Establish a meaningful quality, cost, latency or review-effort opportunity against a competent baseline. Create a representative challenge set without deliberately weakening the baseline.
- **U08 — Objective: reduce the user's total work.** Count correction and oversight effort alongside automation benefits. The workflow should become easier through learning, with a plausible reason to keep using it after the demonstration.

Basis: [production workloads](research/production-llm-workloads.gpt.md), [correction pain points](research/correction-pain-points.gpt.md), [dataset limits](research/public-datasets.gpt.md), [scientific screening input limits](research/domain-healthcare-science.gpt.md).

## 4. Why adaptation belongs in this product — gates and objectives

- **L01 — Gate: state what should be learned.** Identify the recurring judgement, behaviour, strategy, format or preference expected to transfer to later cases.
- **L02 — Gate: distinguish changed state from changed weights.** Label prompt edits, retrieved memories, rules, cached answers and Mubit-reported adapter versions separately. A better second answer alone is not evidence of weight adaptation.
- **L03 — Gate: test a credible context alternative.** Show how clear instructions, examples, retrieved corrections or prompt optimisation handle the same task before claiming an advantage for training.
- **L04 — Objective: give weights a measurable role.** Test whether training improves held-out quality or reduces operating cost/latency at acceptable quality. Neither model size nor prompt removal is an automatic benefit.
- **L05 — Objective: use each adaptation timescale deliberately.** Keep case facts and rapidly changing evidence available through context or retrieval; identify reusable behaviour that merits training. Treat knowledge training as a separate, evidenced choice.
- **L06 — Conditional: justify combining approaches.** If both prompts and weights change, measure the combined system and separate their contributions wherever access permits. Combining them is a hypothesis to test.
- **L07 — Conditional: verify ownership and portability claims.** Establish what can actually be accessed, exported, hosted or rebuilt before claiming the user owns or can migrate the trained model.

Basis: [weight/context evidence map](research/weight-updates-vs-context.gpt.md), [controlled comparisons](research/weight-updates-vs-context-studies.gpt.md), [industry cases](research/weight-updates-industry-cases.gpt.md). The research supports task-dependent trade-offs and combinations; it establishes no universal winner or teacher-imposed quality ceiling.

## 5. Corrections, data and generalisation — gates and objectives

- **C01 — Gate: define a correction record.** Specify its input, original output, corrected target or preference, author, scope and reason. Distinguish a complaint, a replacement answer and an observed outcome.
- **C02 — Gate: establish the ingestion path.** Verify how that record affects training in the actual platform. A local feedback database, a console rating or an edited prompt cannot stand in for this evidence.
- **C03 — Gate: obtain usable training and evaluation data.** Prepare both within the build budget, with documented provenance and rights. Mubit's default 25 kept examples is a collection threshold, not a guarantee of improvement or immediate readiness.
- **C04 — Gate: reserve genuinely unseen cases.** Keep evaluation examples and close duplicates out of training, prompt optimisation and demonstration selection. Split by the relevant session, document, entity or task family.
- **C05 — Gate: show transfer beyond the corrected example.** Test new wording, entities or situations expressing the learned pattern. Include examples where the correction should not apply.
- **C06 — Objective: control feedback scope and conflict.** Define whose policy or preference is being learned, which cases it governs and how contradictory corrections are handled. A single well-defined scope is sufficient for the hackathon.
- **C07 — Objective: validate feedback before trusting it.** Check synthetic labels, edits and implicit signals. Acceptance, dismissal, a successful retry or a teacher's answer may be useful evidence without being infallible ground truth.
- **C08 — Objective: test retention.** Include unchanged control cases to detect regressions, overgeneralisation and forgetting after an update.

Basis: [feedback capture](research/feedback-and-eval-tooling.gpt.md), [feedback learning](research/learning-from-feedback.claude.md), [user-edit study and forgetting comparisons](research/weight-updates-vs-context-studies.gpt.md), [Cursor and DoorDash cases](research/weight-updates-industry-cases.gpt.md).

## 6. Fair comparisons and defensible claims — gates and conditional checks

- **E01 — Gate: choose the primary outcome in advance.** Specify the principal metric and an acceptable guardrail, such as faster decisions with no material accuracy loss. Avoid selecting the winning metric after inspecting results.
- **E02 — Gate: use a competent frontier reference.** Give it appropriate instructions, tools, examples and a practical optimisation budget; record the chosen model and settings.
- **E03 — Gate: compare correction-informed context.** Give the context-only alternative access to the same correction information and appropriate preparation. Comparing an updated adapter with an uninformed prompt exaggerates training's contribution.
- **E04 — Gate: compare before and after consistently.** Record outputs from identified adapter versions on the same held-out cases with unchanged inference prompts, tools, retrieval and grading. If historical versions cannot be rerun, capture the earlier results before updating.
- **E05 — Conditional: isolate the training effect on one base.** Compare the untuned and tuned version of the same base with the same harness when that base is known and callable. Otherwise label the result as a complete-system comparison and disclose the missing control.
- **E06 — Gate: judge against task success independently.** Use external labels, execution or a suitable rubric alongside Mubit's provider-agreement gate. Agreement with a provider is a separate measurement from correctness.
- **E07 — Gate: report the evaluation denominator.** Show successes/failures and sample size, not percentages alone. Repeat stochastic runs when variability materially affects the conclusion; qualify small samples.
- **E08 — Conditional: measure full operating cost.** Include relevant Mubit charges, model calls, retrieval, verifiers, tools, retries, fallbacks and human review. Separate measured charges from estimates.
- **E09 — Conditional: compare realistic caching and latency.** Use supported prompt caching and verify actual reuse where possible. Report cold/warm conditions and end-to-end user latency; disclose unavailable cache controls.
- **E10 — Conditional: include adaptation overhead.** Count data preparation, prompt optimisation, training, evaluation and repeated refreshes when claiming savings. State the request volume and lifetime over which they are amortised.
- **E11 — Conditional: test prompt compression separately.** Compare full and reduced prompts on the adapted model before claiming the guide has been compiled away. Do not attribute a model change's savings entirely to training.

Basis: [comparative studies](research/weight-updates-vs-context-studies.gpt.md), [cost accounting](research/weight-updates-vs-context.gpt.md), [Harvey harness confounds and Databricks comparisons](research/weight-updates-industry-cases.gpt.md).

| Comparison arm | Question it answers | Requirement |
| --- | --- | --- |
| Frontier model with a competent harness | What can the user already obtain? | Reference baseline |
| Context-only system given the corrections | What does feedback achieve without weight changes? | Adaptation baseline |
| Adapter before/after with identical inference context | Did the identified update improve behaviour? | Update evidence |
| Untuned open base versus tuned model with the same harness | What does training contribute on this base? | Conditional on known, callable base |
| Combined context and weight adaptation | Does the combination improve the measured trade-off? | Conditional on using or claiming it |
| Adapted model with full versus reduced instructions | Has training actually reduced the context requirement? | Conditional on a compression claim |

Use one independent held-out set and consistent grading across the applicable arms. Record differences in model access, optimisation budgets and tooling that prevent a controlled comparison.

## 7. Fit to Mubit's actual interface — gates

- **M01 — Gate: preserve deliberate task identity.** Keep task-defining instructions, tools, tool choice, output format and model stable for an intended update. Verify whether a harness edit creates a new task before describing it as retraining the existing one.
- **M02 — Gate: check the callable surface early.** Confirm which provider models and credits work, and where the adapted model can actually run. The recorded supported adapter surface is Try models, without a direct adapter model ID.
- **M03 — Gate: make the product work within that surface.** An application requiring automatic adapter routing, pinned-version inference or weight export must verify that capability first. An app-plus-console handoff needs organiser acceptance if used to fulfil the judged loop.
- **M04 — Gate: respect real collection and grading semantics.** A Bad rating does not exclude an example; teams cannot replace the internal grader; Try models calls train nothing. Do not design the central loop around contrary assumptions in older idea cards.
- **M05 — Gate: observe a completed training path early.** Record collected/kept examples, job state, a ready adapter version and observed elapsed time before investing heavily in presentation.
- **M06 — Gate: budget for platform waits and failure.** Allow for daily limits, pauses, cold starts and failed jobs needing new examples. An unknown update time remains unknown; no fixed turnaround is assumed.

Basis: [current staff Q&A and event record](HACKATHON.md), [newer platform synthesis](research/weight-updates-vs-context.gpt.md). The precise correction-to-weights path and acceptance of an app-plus-Try-models demo remain unresolved in that record. Those are selection gates, not implementation details to postpone.

## 8. Reliability and product usefulness — objectives

- **P01 — Match the verifier to the claim.** Distinguish structural validity, semantic correctness and user preference. Use deterministic checks where appropriate and independent human assessment where the rubric cannot capture the intended outcome.
- **P02 — Check for gaming and degenerate success.** Include wrong-but-well-formatted outputs, missed positives and excessive abstention. A system must not improve its headline metric merely by doing less useful work.
- **P03 — Define safe handling of uncertainty.** Specify when to retry, retrieve more evidence, use a stronger model or ask a person; measure the coverage and cost of that behaviour.
- **P04 — Make the correction interaction efficient.** Let the user identify and fix the relevant mistake in the working context, with its scope visible and without unnecessary annotation forms.
- **P05 — Preserve an inspectable history.** Link the relevant input, output, correction, training/job record, adapter version and evaluation result. Identify which changes our application controls and which Mubit reports.
- **P06 — Keep the learning operation reversible where supported.** Preserve previous artefacts and results, and keep a usable provider/human fallback. Verify platform support before promising automatic rollback.

Basis: [evaluation tools](research/feedback-and-eval-tooling.gpt.md), [correction workflows](research/correction-pain-points.gpt.md), [reward gaming and acceptance limits](research/weight-updates-industry-cases.gpt.md).

## 9. Demo and delivery — gates and objectives

- **V01 — Gate: show the whole causal sequence.** Present the initial error, the user's correction, its confirmed route into adaptation, the resulting version and changed behaviour on a fresh case.
- **V02 — Gate: distinguish timing honestly.** Show actual correction, training and ready timestamps. Label waiting periods, recordings and prepared versions; a prior update does not establish that a new live correction changed weights.
- **V03 — Gate: preserve the judged requirement under failure.** Capture a real completed update early, but verify whether a recorded or asynchronous sequence is accepted. A pending-job screen is an operational fallback, not equivalent evidence of an update.
- **V04 — Objective: make the improvement visible immediately.** Prefer an output or action whose difference a judge can understand, with a clear explanation of its consequence for the user.
- **V05 — Objective: pair the memorable case with aggregate evidence.** Show a concise held-out result alongside the example, including a relevant failure or limitation. A selected success does not establish generalisation.
- **V06 — Objective: keep a complete minimum demo.** One workflow, one correction family, one real update and one fair comparison must work before extra integrations or presentation features.
- **V07 — Objective: rehearse a concise explanation.** Budget the three-minute video across problem, initial failure, correction/update, fresh-case result and measured trade-off; reserve time for recording and upload.

Basis: [Night Shift judging and submission rules](HACKATHON.md), [application demonstrations](research/hackathon-winners-ai-apps.gpt.md), [model-centric demonstrations and failed training attempts](research/hackathon-winners-model-centric.claude.md). Historical entries suggest presentation patterns, not guaranteed judging outcomes.

## What each candidate must put on the table

| Required candidate evidence | Relevant criteria |
| --- | --- |
| Named user, repeated task, consequence and available evidence of need | U01–U08 |
| Nearest alternatives and precise contribution beyond configuring Mubit | D01–D06 |
| Correction representation, scope, provenance and verified ingestion route | C01–C03, C06–C07, M04 |
| Data prepared within budget, independent holdout, transfer and retention cases | C03–C05, C08 |
| Proposed comparison arms, primary metric, guardrail and claim limits | E01–E11 |
| Demonstrated platform path and every unresolved platform/organiser dependency | M01–M06 |
| Minimum demo sequence, realistic update timing and failure plan | V01–V07 |

Do not select a niche solely because it is unusual, because a dataset exists, or because its example looks impressive. Our decision should connect a recurring user need, a distinct contribution, an achievable model update and an evaluation that could also reveal that the context-only approach is better.
