# Hone

The end-to-end platform for bespoke Mubit models: every lesson lands in context instantly, and the ones worth keeping move into the weights.

Built at Night Shift London (Mubit), 2026-10-23 to 2026-10-25.

- **Extract:** feedback (taste, critiques, picks, edits) becomes atomic lessons.
- **Route:** each lesson goes to context (A), weights via a Mubit adapter (B), or both (A∧B), by measured cost, effect and stability.
- **Measure:** frontier, context only, weights only and both, compared on held-out work.

The first example project generates bespoke icons. Inspired by fast writes and slow consolidation in [dual-layer agentic memory](https://arxiv.org/abs/2608.22215) (Li et al., 2026).

## Docs

- [ARCHITECTURE.md](ARCHITECTURE.md): the lesson router, recording rules and target evidence
- [USE_CASE.md](USE_CASE.md): bespoke icon styles
- [docs/stages/](docs/stages/): evaluation notes per stage

## Run

```bash
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
echo "MUBIT_API_KEY=mbt_…" > .env
.venv/bin/uvicorn router.api:app --port 8000
cd app && npm install && npm run dev   # http://localhost:5173
```

The same stages are available as commands: `.venv/bin/python -m router --help`.
