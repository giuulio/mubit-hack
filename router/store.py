"""Model state as one JSON file per model under projects/<id>/project.json.

A model is one fine-tuned Mubit adapter: one fixed system prompt, so one Mubit task, with shared kept calls and adapter
versions. It holds contexts (smooth, sharp or pixel icons) that share those weights; each context has its own lessons,
examples, outputs and evaluations, tagged with its id. Lessons whose reach is "model" apply in every context.
Files written before contexts existed are normalised on load into a model with one context.
"""

import importlib
import json
import re
import threading
import time
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PROJECTS = ROOT / "projects"
_lock = threading.RLock()

# Records that belong to one context; training batches are tagged too, with the context their calls ran under.
TAGGED = ("lessons", "examples", "outputs", "context_history", "training", "evals", "comparisons")


def now():
    return time.strftime("%Y-%m-%dT%H:%M:%S%z")


def new_id(prefix):
    return f"{prefix}_{uuid.uuid4().hex[:8]}"


def slug(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def domain_of(project):
    return importlib.import_module(f"{project['domain']}.domain")


def _path(pid):
    return PROJECTS / pid / "project.json"


def create(name, domain, model="claude-sonnet-5-5", calls_per_day=5000, context="Default"):
    pid = slug(name)
    if _path(pid).exists():
        raise ValueError(f"model {pid} exists")
    project = {
        "id": pid,
        "name": name,
        "domain": domain,
        "model": model,
        "calls_per_day": calls_per_day,
        "created": now(),
        "contexts": [{"id": slug(context), "name": context, "created": now()}],
        "lessons": [],
        "examples": [],
        "outputs": [],
        "events": [],
        "context_history": [],
        "training": [],
        "adapters": [],
        "imports": {},
        "evals": [],
    }
    save(project)
    return project


def normalise(project):
    """Bring a file written before contexts existed to the current shape: one context, every record tagged with it."""
    if not project.get("contexts"):
        name = project.pop("context_name", None) or "Default"
        project["contexts"] = [{"id": slug(name), "name": name, "created": project.get("created", now())}]
    first = project["contexts"][0]["id"]
    for key in TAGGED:
        for record in project.get(key, []):
            record.setdefault("context", first)
    # Imports were {config: items}; they are now {context: {config: items}}.
    imports = project.get("imports", {})
    if any(isinstance(v, list) for v in imports.values()):
        project["imports"] = {first: imports}
    return project


def load(pid):
    with _lock:
        return normalise(json.loads(_path(pid).read_text()))


def save(project):
    with _lock:
        _path(project["id"]).parent.mkdir(parents=True, exist_ok=True)
        tmp = _path(project["id"]).with_suffix(".tmp")
        tmp.write_text(json.dumps(project, indent=1))
        tmp.replace(_path(project["id"]))


def update(pid, change):
    """Load, apply `change(project)` and save, atomically with respect to other updates."""
    with _lock:
        project = load(pid)
        result = change(project)
        save(project)
        return result


def all_projects():
    return [load(p.name) for p in sorted(PROJECTS.iterdir()) if (p / "project.json").exists()] if PROJECTS.exists() else []


def event(project, kind, **data):
    project["events"].append({"t": now(), "type": kind, **data})


# Contexts ------------------------------------------------------------------------------------

def live(project):
    """The contexts in use; archived ones keep their records but leave the interface."""
    return [c for c in project["contexts"] if not c.get("archived")]


def context_of(project, cid=None):
    """A context of the model by id; the first one in use when no id is given, so single-context callers need not name it."""
    if cid is None:
        return (live(project) or project["contexts"])[0]
    found = next((c for c in project["contexts"] if c["id"] == cid), None)
    if found is None:
        raise KeyError(f"context {cid}")
    return found


def add_context(pid, name):
    """A new context of the model: it starts with only the model-wide lessons and shares the model's kept calls and adapter."""
    cid = slug(name)
    if not cid:
        raise ValueError("a context needs a name")

    def apply(p):
        if any(c["id"] == cid for c in p["contexts"]):
            raise ValueError(f"context {cid} exists")
        entry = {"id": cid, "name": name.strip(), "created": now()}
        p["contexts"].append(entry)
        event(p, "context_created", context=cid)
        return entry
    return update(pid, apply)


def applies(lesson, cid):
    """Whether a lesson shapes outputs in a context: its own context's lessons, plus the model-wide ones."""
    return lesson.get("context") == cid or lesson.get("reach") == "model"


def edit_context(pid, cid, name=None, archived=None):
    """Rename a context (its name is not in any prompt, so this is safe) or archive or restore it; the last context in use stays."""
    def apply(p):
        entry = context_of(p, cid)
        if name is not None and name.strip():
            entry["name"] = name.strip()
        if archived is True and not entry.get("archived"):
            if len(live(p)) <= 1:
                raise ValueError("a model keeps at least one context")
            entry["archived"] = now()
        if archived is False:
            entry.pop("archived", None)
        event(p, "context_edited", context=cid, name=entry["name"], archived=bool(entry.get("archived")))
        return entry
    return update(pid, apply)


def set_archived(pid, archived):
    """Archive or restore a model. Its file stays, and so do its Mubit task and kept calls: Mubit has no delete API."""
    def apply(p):
        if archived:
            p["archived"] = now()
        else:
            p.pop("archived", None)
        event(p, "archived" if archived else "restored")
        return {"id": p["id"], "archived": p.get("archived")}
    return update(pid, apply)
