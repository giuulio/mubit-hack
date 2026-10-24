"""Project state as one JSON file per project under projects/<id>/project.json."""

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


def now():
    return time.strftime("%Y-%m-%dT%H:%M:%S%z")


def new_id(prefix):
    return f"{prefix}_{uuid.uuid4().hex[:8]}"


def domain_of(project):
    return importlib.import_module(f"{project['domain']}.domain")


def _path(pid):
    return PROJECTS / pid / "project.json"


def create(name, domain, model="claude-sonnet-5-5", calls_per_day=5000):
    pid = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    if _path(pid).exists():
        raise ValueError(f"project {pid} exists")
    project = {
        "id": pid,
        "name": name,
        "domain": domain,
        "model": model,
        "calls_per_day": calls_per_day,
        "created": now(),
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


def load(pid):
    with _lock:
        return json.loads(_path(pid).read_text())


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
