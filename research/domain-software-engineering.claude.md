# Domain: software engineering

- **Question:** Which repeated LLM tasks exist in software engineering, who corrects them and how, and which public data could support a demo?
- **Author:** Claude (Claude Code, Opus 5.5)
- **Date:** 2026-10-23

## Summary

- Volume is large: GitHub reports an average of 43.2M merged pull requests per month in 2025 (+23% year on year) and nearly 1 billion commits. [Octoverse 2025](https://github.blog/2025-10-28-octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/)
- Developers already correct AI output constantly: in public coding-agent logs, users push back in 39–50% of turns and interrupt in about 5%; Anthropic reports interruption in 5% (new users) to ~9% (experienced) of Claude Code turns. [SWE-chat](https://arxiv.org/html/2604.20779v1), [Anthropic](https://www.anthropic.com/research/measuring-agent-autonomy)
- AI code review is noisy: acceptance of review comments was 8.1% at Mozilla and 7.2% at Ubisoft (RevMate); an analysis of 54,791 agent review comments found incorrect suggestions the top reason for non-resolution. [Augment summary](https://www.augmentcode.com/guides/ai-code-review-accuracy), [arXiv 2607.21997](https://papers.cool/arxiv/2607.21997)
- Products are starting to learn from triage: Semgrep Assistant "Memories" (GA June 2025) turns triage decisions and developer feedback into scoped natural-language rules. [Semgrep](https://semgrep.dev/blog/2025/announcing-ai-noise-filtering-and-triage-memories)
- Public datasets exist for most tasks (CodeReviewer, CommitBench, Loghub, IDoFT, SWE-bench Verified), with licences ranging from Apache 2.0 to CC BY-NC 4.0 and research-only.

## Findings

### Repeated LLM tasks today

| Task | Input → output | Who, how often | Example products |
| --- | --- | --- | --- |
| Code review comments | diff → comments | every PR; 43.2M merged PRs/month on GitHub | GitHub Copilot review, CodeRabbit, Greptile, Cursor BugBot, Qodo |
| PR description / commit message | diff → text | every commit (~1B/year on GitHub) | Copilot, IDE assistants |
| SAST finding triage | finding + code → true/false positive + reason | security engineers, per scan | Semgrep Assistant |
| Flaky-test / CI failure triage | test code or log → category | CI on every push | not surveyed |
| Log and incident triage | log lines → template / severity / owner | SRE on-call | not surveyed |
| Coding-agent turns | instruction + repo state → edits | developers, many turns per session | Claude Code, Codex, Cursor, Copilot agent |

Sources: [Octoverse 2025](https://github.blog/2025-10-28-octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/), [Augment](https://www.augmentcode.com/guides/ai-code-review-accuracy), [Semgrep](https://semgrep.dev/blog/2025/semgrep-is-confidently-handling-60-of-all-triage-for-users-without-reducing-coverage) (search summaries)

### Where corrections arise and who makes them

- Coding-agent sessions: SWE-chat (public repos with opted-in logs) reports interruptions in 5% of turns and pushback in 39% (a later version: corrections, failure reports and interruptions in 50%); Claude Code subset 45.7% pushback, 4.5% interruptions; agent asks for clarification in ~3%. [arXiv 2604.20779](https://arxiv.org/html/2604.20779v1) (search summary)
- Anthropic (~500k interactive Claude Code sessions): new users (~10 sessions) interrupt in 5% of turns, experienced users ~9%. [Anthropic](https://www.anthropic.com/research/measuring-agent-autonomy) (search summary)
- A study of 20,574 sessions from 1,639 repos counts a failure only when developer correction or pushback follows in the log. [arXiv 2605.29442](https://arxiv.org/html/2605.29442v1) (search summary)
- "Compiling User Corrections into Runtime Enforcement for Coding Agents" (arXiv 2606.13174) turns user corrections into enforced rules. [arXiv](https://arxiv.org/html/2606.13174) (search result; details not read)
- Session logs are already on disk: Claude Code writes JSONL under `~/.claude/projects/`, Codex under `~/.codex/sessions/`; Mubit's Night Shift side quest collects these. [HACKATHON.md](../HACKATHON.md) A tool, `agent-collab-metrics`, labels user replies as correction, confusion, accept or new request. [GitHub](https://github.com/itsyungtse/agent-collab-metrics) (search summary)
- Code review: resolving, dismissing or ignoring a bot comment is an implicit label. Agent review study (54,791 comments, five agents, 342 Python repos): Copilot produced 72.9% of resolved comments; top reasons for non-resolution were incorrect suggestions and intentional design decisions; an inline code suggestion was the strongest predictor of resolution. [arXiv 2607.21997](https://papers.cool/arxiv/2607.21997) (search summary)
- SAST triage: Semgrep says Assistant filters about 1 in 5 findings as false positives with 95% agreement with users, and a Fortune 500 customer saw 2.8× more false-positive detection after adding two memories (vendor claims). [Semgrep](https://semgrep.dev/blog/2025/announcing-ai-noise-filtering-and-triage-memories) (search summary)
- Google switched off review analysers whose "not useful" rate exceeded 10% until fixed. [Augment](https://www.augmentcode.com/guides/ai-code-review-accuracy) (search summary, secondary)

### Stated pain points

- Stack Overflow Developer Survey 2025 (~49,000 responses): 46% distrust AI accuracy vs 33% trust; 3% "highly trust"; 66% cite "AI solutions that are almost right, but not quite" (InfoWorld reports 64%); 45.2% say debugging AI code takes longer; 84% use or plan to use AI tools. [Stack Overflow](https://survey.stackoverflow.co/2025/ai), [ADTmag](https://adtmag.com/blogs/watersworks/2026/01/stack-overflow-survey.aspx) (search summaries)
- RevMate deployment: 24 of 37 surveyed reviewers said AI comments increased review duration. [Augment](https://www.augmentcode.com/guides/ai-code-review-accuracy) (search summary)
- Greptile audit of its own comments: ~19% good, 2% wrong, 79% nits (vendor). [Augment](https://www.augmentcode.com/guides/ai-code-review-accuracy) (search summary)
- Flaky tests: LLMs classifying flakiness from test code alone were only marginally better than random (IDoFT, FlakeBench); fine-tuning reached high accuracy in an ICST 2025 comparison. [arXiv 2602.05465](https://arxiv.org/html/2602.05465v1), [arXiv 2502.02715](https://arxiv.org/html/2502.02715v1) (search summaries)

### Public datasets and APIs

| Dataset | Size | Licence | Link |
| --- | --- | --- | --- |
| CodeReviewer (Microsoft) | code-refinement split 150,406 / 13,103 / 13,104; nine languages | Apache 2.0 reported (not confirmed on dataset card) | [arXiv 2203.09095](https://arxiv.org/pdf/2203.09095) |
| CommitBench | 1,664,590 commits, six languages | CC BY-NC 4.0 | [Hugging Face](https://huggingface.co/datasets/Maxscha/commitbench) |
| Loghub (logpai) | 17+ log datasets; e.g. HDFS_v2 71,118,073 lines, 16.06 GiB; >77 GB total | "other": free for research or academic work, cite the paper | [GitHub](https://github.com/logpai/loghub), [Zenodo](https://zenodo.org/record/3227177) |
| IDoFT / C-IDoFT (flaky tests) | C-IDoFT 54,468 unit tests from 57 projects | not checked | [arXiv 2607.09345](https://arxiv.org/abs/2607.09345) |
| SWE-bench Verified | 500 human-validated issues from 12 Python repos | MIT reported (not confirmed) | [OpenAI](https://openai.com/index/introducing-swe-bench-verified/) |
| SWE-chat | real user–agent sessions from public repos | not checked | [arXiv 2604.20779](https://arxiv.org/html/2604.20779v1) |
| GitHub REST API (issues, PRs, review comments) | live | 60 requests/hour unauthenticated | [GitHub](https://developer.github.com/changes/2012-10-14-rate-limit-changes) |

## Gaps

- Acceptance rates published by CodeRabbit or GitHub Copilot themselves: not found.
- LLM-based CI build-log classification studies: not found.
- SWE-chat and IDoFT licences: not checked.

## Sources

- [GitHub Octoverse 2025](https://github.blog/2025-10-28-octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/), accessed 2026-10-23
- [SWE-chat](https://arxiv.org/html/2604.20779v1); [Developer-agent misalignment](https://arxiv.org/html/2605.29442v1); [Compiling user corrections](https://arxiv.org/html/2606.13174); [Anthropic: measuring agent autonomy](https://www.anthropic.com/research/measuring-agent-autonomy), accessed 2026-10-23
- [Go Home Copilot, You're Drunk](https://papers.cool/arxiv/2607.21997); [Augment Code review accuracy guide](https://www.augmentcode.com/guides/ai-code-review-accuracy), accessed 2026-10-23
- [Semgrep memories](https://semgrep.dev/blog/2025/announcing-ai-noise-filtering-and-triage-memories); [Semgrep 60% triage](https://semgrep.dev/blog/2025/semgrep-is-confidently-handling-60-of-all-triage-for-users-without-reducing-coverage), accessed 2026-10-23
- [Stack Overflow Developer Survey 2025: AI](https://survey.stackoverflow.co/2025/ai); [ADTmag](https://adtmag.com/blogs/watersworks/2026/01/stack-overflow-survey.aspx), accessed 2026-10-23
- [Flaky tests: arXiv 2602.05465](https://arxiv.org/html/2602.05465v1), [arXiv 2502.02715](https://arxiv.org/html/2502.02715v1), [arXiv 2607.09345](https://arxiv.org/abs/2607.09345), accessed 2026-10-23
- Dataset links in the table, accessed 2026-10-23
- All via web search summaries; pages were not opened (network policy).
