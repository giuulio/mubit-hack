"""Slop score: how closely a generated icon matches its nearest Lucide icon.

Lucide (ISC licence) is downloaded with npm into .cache/ at first use and never committed.
"""

import re
import subprocess
import tarfile
from pathlib import Path

import numpy as np

from .svg import render

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / ".cache"
LUCIDE_VERSION = "1.61.0"
SIZE = 64
RADIUS = 2  # pixels of tolerance, about 0.75 units at 64 px


def _dilate(mask):
    """Binary dilation by RADIUS, so near-misses still count as overlap."""
    padded = np.pad(mask, RADIUS)
    out = np.zeros_like(mask)
    for dy in range(2 * RADIUS + 1):
        for dx in range(2 * RADIUS + 1):
            out |= padded[dy:dy + SIZE, dx:dx + SIZE]
    return out


def _thin(svg):
    """Shape only: drop the accent dot and draw every stroke 1 unit wide."""
    svg = re.sub(r'<[^>]*class="accent"[^>]*/>', "", svg)
    svg = re.sub(r'stroke-width="[^"]*"', 'stroke-width="1"', svg)
    return render(svg, size=SIZE) > 0.3


def _masks(svg):
    thin = _thin(svg)
    return thin, _dilate(thin)


def _lucide_dir():
    target = CACHE / f"lucide-static-{LUCIDE_VERSION}"
    if not target.exists():
        CACHE.mkdir(exist_ok=True)
        subprocess.run(["npm", "pack", f"lucide-static@{LUCIDE_VERSION}", "--silent"], cwd=CACHE, check=True)
        tgz = CACHE / f"lucide-static-{LUCIDE_VERSION}.tgz"
        with tarfile.open(tgz) as tar:
            members = [m for m in tar.getmembers() if m.name.startswith("package/icons/") and m.name.endswith(".svg")]
            tar.extractall(target, members=members, filter="data")
        tgz.unlink()
    return target / "package" / "icons"


def lucide_index():
    """Names, thin masks and dilated masks for every Lucide icon, cached as .npz."""
    cache = CACHE / f"lucide-{LUCIDE_VERSION}-{SIZE}-r{RADIUS}.npz"
    if cache.exists():
        data = np.load(cache)
        return list(data["names"]), data["thin"], data["wide"]
    names, thin, wide = [], [], []
    for path in sorted(_lucide_dir().glob("*.svg")):
        t, w = _masks(path.read_text())
        names.append(path.stem)
        thin.append(t)
        wide.append(w)
    thin, wide = np.stack(thin), np.stack(wide)
    np.savez_compressed(cache, names=np.array(names), thin=thin, wide=wide)
    return names, thin, wide


def nearest(svg, index=None, exclude=()):
    """(score, name) of the most similar reference icon, 0–1.

    Score is the F1 of two directed overlaps: the share of this icon's ink lying near the
    reference's ink, and the share of the reference's ink lying near this icon's ink.
    """
    names, thin, wide = index or lucide_index()
    t, w = _masks(svg)
    precision = (wide & t).sum(axis=(1, 2)) / max(t.sum(), 1)
    recall = (thin & w).sum(axis=(1, 2)) / np.maximum(thin.sum(axis=(1, 2)), 1)
    f1 = np.where(precision + recall > 0, 2 * precision * recall / np.maximum(precision + recall, 1e-9), 0.0)
    for i, name in enumerate(names):
        if name in exclude:
            f1[i] = -1
    best = int(f1.argmax())
    return float(f1[best]), names[best]
