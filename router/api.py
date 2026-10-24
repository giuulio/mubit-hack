"""HTTP API over the pipeline for the interface. Run: `.venv/bin/uvicorn router.api:app --port 8000`."""

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


class Generate(BaseModel):
    concepts: list[str]


class Feedback(BaseModel):
    signal: str
    text: str | None = None
    output_id: str | None = None
    chosen_id: str | None = None
    rejected_id: str | None = None
    after: str | None = None


class Confirm(BaseModel):
    stability: str = "permanent"
    statement: str | None = None


class Count(BaseModel):
    count: int = 40


class Adapter(BaseModel):
    version: str
    status: str
    note: str = ""


class Items(BaseModel):
    config: str | None = None
    items: list[dict]


@app.get("/api/domains")
def domains():
    return ["icons"]


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
        }
        for p in store.all_projects()
    ]


@app.post("/api/projects")
def create(body: NewProject):
    return guard(store.create, body.name, body.domain, "claude-sonnet-5-5", body.calls_per_day)


@app.get("/api/projects/{pid}")
def project(pid: str):
    return guard(store.load, pid)


@app.post("/api/projects/{pid}/generate")
def generate(pid: str, body: Generate):
    return guard(pipeline.generate, pid, [c.strip() for c in body.concepts if c.strip()][:12])


@app.post("/api/projects/{pid}/feedback")
def feedback(pid: str, body: Feedback):
    return guard(pipeline.feedback, pid, body.model_dump())


@app.post("/api/projects/{pid}/lessons/{lid}/confirm")
def confirm(pid: str, lid: str, body: Confirm):
    return guard(pipeline.confirm, pid, lid, body.stability, body.statement)


@app.post("/api/projects/{pid}/lessons/{lid}/reject")
def reject(pid: str, lid: str):
    return guard(pipeline.reject, pid, lid)


@app.post("/api/projects/{pid}/train")
def train(pid: str, body: Count):
    return run_job("train", pipeline.train, pid, body.count)


@app.post("/api/projects/{pid}/eval")
def evaluate(pid: str, body: Count):
    return run_job("eval", pipeline.evaluate, pid, body.count)


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
def message(pid: str, concept: str, mode: str = "bare", without: str | None = None):
    return {"message": guard(pipeline.try_message, pid, concept, mode, without)}


@app.post("/api/projects/{pid}/imports")
def imports(pid: str, body: Items):
    return guard(pipeline.import_outputs, pid, body.config or "adapter", body.items)


@app.post("/api/projects/{pid}/lessons/{lid}/absorption")
def absorption(pid: str, lid: str, body: Items):
    return guard(pipeline.absorption, pid, lid, body.items)
