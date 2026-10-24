# Hone

**Rent what changes. Own what lasts.** Hone turns feedback on generated work into reusable lessons, then decides which belong in editable context and which are candidates for consolidation into a Mubit adapter.

Built by Giulio Orlandi and Stan Hauke at Night Shift London, 2026-10-23 to 2026-10-25. Our first domain is bespoke SVG icons: designers teach Smooth, Pixel and Duotone styles through directions, critiques and examples instead of repeating the same instructions for every icon.

## What the demo shows

The two-minute screen recording introduces the context/weights architecture, then walks through Icon Master's style contexts and feedback router. The interface exposes extracted lessons, pending versus applied changes, probe evidence, context token costs and the recorded Mubit adapter status.

- **Feedback becomes a lesson:** approve an icon as an example, critique a particular output or describe a style preference. Review the extracted lesson before applying it.
- **Routing is visible:** deterministic parameters run in code; concept-specific corrections become notes; broader rules are tested with and without the lesson. Weak probe evidence is flagged for rephrasing rather than presented as successful learning.
- **Changes affect later outputs:** a car-specific note separates wheels from the body outline. Pixel cells use neutral ink with zero-width strokes; transparent fill was corrected because it made them invisible.
- **Context and weights remain distinct:** the recorded adapter status is `v1 · training`. The demo does not establish a completed weight update or adapter-only performance.

The app also includes **Compare**: the same concept from the same raw provider model without learned context, alongside Hone's routed context, with separate columns for adapter outputs imported from Mubit Try models. Missing adapter outputs remain empty. Earlier held-out evaluations compare a raw frontier model, full context and routed context; these small blind-judge evaluations are exploratory, not proof of fine-tuning.

## How it works

1. **Extract:** directions, critiques, picks and edits become atomic lessons.
2. **Route:** measure a lesson's prompt cost, effect and stability; send it to context (A), the training path (B), both (A∧B), a concept note or rephrasing.
3. **Generate and evaluate:** use the approved context, render and validate SVGs, and compare outputs on held-out concepts.
4. **Consolidate:** submit approved-context calls through Mubit for potential adapter training. Retiring a lesson from context requires a separate absorption check using adapter outputs.

All LLM calls use the Mubit proxy at `https://api.mubit.ai/anthropic`; see [router/mubit.py](router/mubit.py). Previews, probes, judges and comparisons request metadata-only recording. Training batches request full recording; **submitted calls are not the same as examples Mubit has kept**.

Live generation currently calls the provider model with Hone's learned context and code parameters. Adapter status is manually recorded from the Mubit console. Adapter outputs are imported from Try models; they are not silently substituted for live provider output. Completed fine-tuning, absorption and token savings from retiring lessons remain unverified until those checks pass.

## Run locally

Requires Python 3 and a current Node.js version supported by the frontend dependencies.

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

Set `MUBIT_API_KEY` in your environment or a local, uncommitted `.env` file. Use synthetic or public data only.

```bash
.venv/bin/uvicorn router.api:app --port 8000
```

In a second terminal:

```bash
cd app
npm install
npm run dev
```

Open `http://localhost:5173`. Select **Icon Master**, then a context such as **Smooth** or **Pixel**. Generate an icon, give feedback and use **Test & apply** or **Apply & redraw** to follow the lesson through the router. The **Compare** tab contrasts configurations. The Operator drawer contains training batches, manually recorded adapter versions and Try models imports.

The same stages are available through `.venv/bin/python -m router --help`.

## Checks and implementation

```bash
.venv/bin/python -m unittest discover -s tests
npm --prefix app run build
npm --prefix app run lint
```

- [router/](router/): domain-independent pipeline, routing, judges, project store, CLI and API.
- [icons/](icons/): icon prompts, SVG rendering and validation, parameters and domain plugin.
- [app/](app/): React interface for feedback, routing and comparisons.
- [projects/hone-icons/project.json](projects/hone-icons/project.json): saved demo lessons, outputs, probe evidence and training records.
- [ARCHITECTURE.md](ARCHITECTURE.md) and [USE_CASE.md](USE_CASE.md): architecture and the icon use case.
- [docs/stages/](docs/stages/): stage-by-stage evaluation notes. Earlier demo scripts are planning documents; this README describes the submitted demo and current evidence.
