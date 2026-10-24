"""HTTP API over the pipeline for the interface. Run: `.venv/bin/uvicorn router.api:app --port 8000`.

A project file holds one model (one Mubit task) and its contexts. Calls that run in a context take a `context` id in the
body or query; without one they use the model's first context, so single-context clients keep working.
"""

import threading
import traceback

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from . import pipeline, store

app = FastAPI(title="Lesson router")
jobs = {}


def run_job(kind, fn, *args):
    """Long stages (training, evaluation) run in a thread; poll /api/jobs/{id}."""
    jid = store.new_id("job")
    jobs[jid] = {"id": jid, "kind": kind, "status": "running", "result": None, "error": None, "started": store.now()}

    def work():
        try:
            jobs[jid]["result"] = fn(*args)
            jobs[jid]["status"] = "done"
        except Exception as e:  # surface the failure to the interface
            traceback.print_exc()
            jobs[jid].update(status="failed", error=str(e))
    threading.Thread(target=work, daemon=True).start()
    return jobs[jid]


def guard(fn, *args):
    try:
        return fn(*args)
    except (KeyError, StopIteration, FileNotFoundError) as e:
        raise HTTPException(404, f"not found: {e}")
    except ValueError as e:
        raise HTTPException(400, str(e))


class NewProject(BaseModel):
    name: str
    domain: str = "icons"
    calls_per_day: int = 5000
    context: str = "Default"


class NewContext(BaseModel):
    name: str


class EditContext(BaseModel):
    name: str | None = None
    archived: bool | None = None


class Archive(BaseModel):
    archived: bool = True


class Generate(BaseModel):
    concepts: list[str]
    context: str | None = None


class Feedback(BaseModel):
    signal: str
    text: str | None = None
    output_id: str | None = None
    chosen_id: str | None = None
    rejected_id: str | None = None
    after: str | None = None
    context: str | None = None


class Confirm(BaseModel):
    stability: str = "permanent"
    statement: str | None = None
    reach: str | None = None


class Count(BaseModel):
    count: int = 40
    context: str | None = None


class Adapter(BaseModel):
    version: str
    status: str
    note: str = ""


class Items(BaseModel):
    config: str | None = None
    items: list[dict]
    context: str | None = None


class Concept(BaseModel):
    concept: str
    context: str | None = None


class Pasted(BaseModel):
    config: str = "adapter"
    content: str


@app.get("/api/domains")
def domains():
    """Domain plugins: any top-level package with a domain.py (see AGENTS.md)."""
    return sorted(d.parent.name for d in store.ROOT.glob("*/domain.py"))


@app.get("/api/projects")
def projects():
    return [
        {
            "id": p["id"],
            "name": p["name"],
            "domain": p["domain"],
            "lessons": sum(1 for x in p["lessons"] if x["status"] == "active"),
            "examples": len(p["examples"]),
            "training_calls": sum(b["calls"] for b in p["training"]),
            "adapter": p["adapters"][-1] if p["adapters"] else None,
            "samples": [o["content"] for o in reversed(p["outputs"]) if o["content"] and not o["problems"]][:6],
            "contexts": [{"id": c["id"], "name": c["name"]} for c in store.live(p)],
            "archived": p.get("archived"),
        }
        for p in store.all_projects()
    ]


@app.post("/api/projects")
def create(body: NewProject):
    if not body.name.strip() or not body.context.strip():
        raise HTTPException(400, "a model needs a name and a first context")
    return guard(store.create, body.name.strip(), body.domain, "claude-sonnet-5-5", body.calls_per_day, body.context.strip())


@app.post("/api/projects/{pid}/archive")
def archive(pid: str, body: Archive):
    return guard(store.set_archived, pid, body.archived)


@app.get("/api/projects/{pid}")
def project(pid: str):
    return guard(store.load, pid)


@app.post("/api/projects/{pid}/contexts")
def add_context(pid: str, body: NewContext):
    return guard(store.add_context, pid, body.name)


@app.post("/api/projects/{pid}/contexts/{cid}")
def edit_context(pid: str, cid: str, body: EditContext):
    return guard(store.edit_context, pid, cid, body.name, body.archived)


@app.post("/api/projects/{pid}/generate")
def generate(pid: str, body: Generate):
    return guard(pipeline.generate, pid, [c.strip() for c in body.concepts if c.strip()][:12], body.context)


@app.post("/api/projects/{pid}/feedback")
def feedback(pid: str, body: Feedback):
    return guard(pipeline.feedback, pid, body.model_dump(exclude={"context"}), body.context)


@app.post("/api/projects/{pid}/lessons/{lid}/confirm")
def confirm(pid: str, lid: str, body: Confirm):
    return guard(pipeline.confirm, pid, lid, body.stability, body.statement, body.reach)


@app.post("/api/projects/{pid}/lessons/{lid}/reject")
def reject(pid: str, lid: str):
    return guard(pipeline.reject, pid, lid)


@app.post("/api/projects/{pid}/train")
def train(pid: str, body: Count):
    return run_job("train", pipeline.train, pid, body.count, body.context)


@app.post("/api/projects/{pid}/eval")
def evaluate(pid: str, body: Count):
    return run_job("eval", pipeline.evaluate, pid, body.count, pipeline.FRONTIER, body.context)


@app.get("/api/jobs/{jid}")
def job(jid: str):
    if jid not in jobs:
        raise HTTPException(404, "no such job")
    return jobs[jid]


@app.post("/api/projects/{pid}/adapters")
def adapter(pid: str, body: Adapter):
    return guard(pipeline.record_adapter, pid, body.version, body.status, body.note)


@app.get("/api/projects/{pid}/concepts")
def concepts(pid: str):
    domain = store.domain_of(guard(store.load, pid))
    return {"train": domain.concepts("train"), "heldout": domain.concepts("heldout")}


@app.get("/api/projects/{pid}/message")
def message(pid: str, concept: str, mode: str = "bare", without: str | None = None, context: str | None = None):
    return {"message": guard(pipeline.try_message, pid, concept, mode, without, context)}


@app.post("/api/projects/{pid}/imports")
def imports(pid: str, body: Items):
    return guard(pipeline.import_outputs, pid, body.config or "adapter", body.items, body.context)


@app.post("/api/projects/{pid}/lessons/{lid}/absorption")
def absorption(pid: str, lid: str, body: Items):
    return guard(pipeline.absorption, pid, lid, body.items)


@app.post("/api/projects/{pid}/compare")
def compare(pid: str, body: Concept):
    if not body.concept.strip():
        raise HTTPException(400, "no concept")
    return guard(pipeline.compare, pid, body.concept.strip(), pipeline.FRONTIER, body.context)


@app.post("/api/projects/{pid}/comparisons/{cid}")
def compare_adapter(pid: str, cid: str, body: Pasted):
    return guard(pipeline.compare_adapter, pid, cid, body.config, body.content)
