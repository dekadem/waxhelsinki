#!/usr/bin/env python3
"""Generate mix-*.html pages from _template/mix.html + mixes.json."""

import html
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
TEMPLATE_PATH = ROOT / "_template" / "mix.html"
DATA_PATH = ROOT / "mixes.json"


def build():
    template = TEMPLATE_PATH.read_text(encoding="utf-8")
    mixes = json.loads(DATA_PATH.read_text(encoding="utf-8"))

    for mix in mixes:
        rendered = template
        for key in ("id", "title", "description"):
            rendered = rendered.replace("{{" + key + "}}", html.escape(mix[key]))

        out_path = ROOT / f"{mix['id']}.html"
        out_path.write_text(rendered, encoding="utf-8")

    print(f"Built {len(mixes)} mix pages from {TEMPLATE_PATH.name}")


if __name__ == "__main__":
    build()
