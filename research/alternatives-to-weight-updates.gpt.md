# Learning from corrections without changing model weights

- **Question:** Which prompt and memory mechanisms incorporate feedback outside model weights?
- **Author:** gpt (GPT-6)
- **Date:** 2026-10-23

## Summary

- DSPy includes prompt optimisers as well as weight-based methods; its documented research includes MIPRO from 2024 and GEPA from 2025. [Project and bibliography](https://github.com/stanfordnlp/dspy)
- GEPA reads execution traces and textual feedback to propose and select changed text parameters. [Author documentation](https://github.com/gepa-ai/gepa)
- TextGrad propagates LLM-generated textual feedback to improve text variables, including prompts; its repository links the 2024 preprint and 2025 Nature publication. [Author documentation](https://github.com/zou-group/textgrad)
- LangMem, Mem0, Letta and Graphiti store or retrieve information outside the underlying model's weights. Their persistence and retrieval mechanisms differ. [LangMem](https://github.com/langchain-ai/langmem) · [Mem0](https://github.com/mem0ai/mem0) · [Letta](https://github.com/letta-ai/letta) · [Graphiti](https://github.com/getzep/graphiti)

## Findings

### Prompt optimisation

| Mechanism | What changes | Documented evidence |
| --- | --- | --- |
| DSPy prompt optimisation | Instructions and in-context demonstrations, selected against an application metric | The repository links *Optimizing Instructions and Demonstrations for Multi-Stage Language Model Programs*, 2024, arXiv:2406.11695. [Bibliography](https://github.com/stanfordnlp/dspy) |
| GEPA | Textual candidates, including prompts; reflection proposes revisions using traces and evaluator feedback, followed by evolutionary selection | The author repository links the 2025 paper arXiv:2507.19457 and an experiment-reproduction repository. [Documentation](https://github.com/gepa-ai/gepa) |
| TextGrad | Text variables marked for optimisation, updated using natural-language feedback through a computation graph | The author repository describes the textual-gradient metaphor, examples and arXiv:2406.07496; it records Nature publication on 2025-03-19. [Documentation](https://github.com/zou-group/textgrad) |

- DSPy's README explicitly says the framework supports optimising both prompts and weights. The prompt-only mechanisms above do not describe every DSPy optimiser. [Source](https://github.com/stanfordnlp/dspy)
- GEPA's quickstart separates `trainset` and `valset` and specifies distinct task and reflection models. Its performance numbers are author-reported and were not reproduced here. [Quickstart](https://github.com/gepa-ai/gepa)

### Stored memories and retrieved past context

- LangMem supplies tools to create/manage and search memories during conversations, plus background extraction, consolidation and prompt refinement. Its README explicitly says `InMemoryStore` loses data on restart and names database-backed storage for persistence. [Documentation](https://github.com/langchain-ai/langmem)
- Mem0's current README describes extraction of stored facts, semantic/BM25/entity-based retrieval and temporal ranking. Its April 2026 algorithm description says extraction is ADD-only, without UPDATE/DELETE; this differs from descriptions of older memory implementations. [Current author documentation](https://github.com/mem0ai/mem0)
- Mem0's benchmark table explicitly says the managed platform contains proprietary optimisations absent from the open-source SDK. The numbers therefore do not establish identical open-source behaviour. [Author qualification](https://github.com/mem0ai/mem0)
- Letta describes stateful agents with persistent memory. Its README points to its documentation rather than specifying a universal retention or correction guarantee. [Project](https://github.com/letta-ai/letta)
- Graphiti describes a temporal knowledge graph built from episodes, with entity/relationship extraction and hybrid retrieval; its documentation distinguishes it from retrieving isolated text chunks. [Project](https://github.com/getzep/graphiti)
- A Mem0 user reports wrong entity merging when two entities share a name but have different types; maintainers discuss merge logic in the same issue. This is an attributed report, not a measured memory-system failure rate. [Issue #5587](https://github.com/mem0ai/mem0/issues/5587)

### Human-written context and stored corrections

- CrossBeam's hackathon repository describes structured skill/reference files supplying domain knowledge, including a 28-file California ADU reference set. This is a documented application architecture using external context; its README does not demonstrate a weight update. [Project](https://github.com/mikeOnBreeze/cc-crossbeam)
- Langfuse documents storing a corrected output alongside the original response and exporting it for datasets. Capturing that record is a separate operation from any downstream training process. [Correction documentation](https://github.com/langfuse/langfuse-docs/blob/main/content/docs/observability/features/corrections.mdx)
- LangMem's example retrieves a previously stored preference in a later interaction using memory tools and a store. The example demonstrates the intended retrieval interface; it was not run here. [Example](https://github.com/langchain-ai/langmem)

## Gaps

- ChatGPT and Claude's consumer-memory settings, retention, deletion and cross-session guarantees were not verified because their product documentation was not retrieved. No equivalence with the open-source libraries is asserted.
- Detailed current semantics of `CLAUDE.md`, Cursor rules and retrieval of past corrections were not independently tested. CrossBeam is an application example of reference files, not a substitute for those products' specifications.
- The 2024–2025 papers were identified through their authors' repositories; direct arXiv access was blocked. No reported benchmark gain was independently reproduced.
- None of the documented memory or prompt mechanisms establishes that one correction will update an underlying model's weights.

## Sources

- [DSPy](https://github.com/stanfordnlp/dspy), accessed 2026-10-23; links the 2024 MIPRO and 2025 GEPA papers.
- [GEPA](https://github.com/gepa-ai/gepa), accessed 2026-10-23; [paper identifier](https://arxiv.org/abs/2507.19457) recorded from author documentation, direct paper not retrieved.
- [TextGrad](https://github.com/zou-group/textgrad), accessed 2026-10-23; [paper identifier](https://arxiv.org/abs/2406.07496) recorded from author documentation, direct paper not retrieved.
- [LangMem](https://github.com/langchain-ai/langmem), [Mem0](https://github.com/mem0ai/mem0), [Letta](https://github.com/letta-ai/letta) and [Graphiti](https://github.com/getzep/graphiti), accessed 2026-10-23.
- [Mem0 issue #5587](https://github.com/mem0ai/mem0/issues/5587), accessed 2026-10-23.
- [CrossBeam](https://github.com/mikeOnBreeze/cc-crossbeam) and [Langfuse corrections](https://github.com/langfuse/langfuse-docs/blob/main/content/docs/observability/features/corrections.mdx), accessed 2026-10-23.
