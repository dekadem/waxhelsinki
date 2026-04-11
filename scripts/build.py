#!/usr/bin/env python3
"""Generate mix-*.html pages from _template/mix.html + mixes.json."""

import html
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
ROOT_RESOLVED = ROOT.resolve()
TEMPLATE_PATH = ROOT / "_template" / "mix.html"
DATA_PATH = ROOT / "mixes.json"
MIX_ID_RE = re.compile(r"^mix-\d+$")


def infer_audio_type(audio_url: str) -> str:
    lowered = audio_url.lower()
    if lowered.endswith(".m4a"):
        return "audio/mp4"
    return "audio/mpeg"


def build():
    template = TEMPLATE_PATH.read_text(encoding="utf-8")
    mixes = json.loads(DATA_PATH.read_text(encoding="utf-8"))

    required_keys = ("id", "title", "duration", "description", "audioUrl", "artUrl", "artAlt")
    for index, mix in enumerate(mixes):
        if not isinstance(mix, dict):
            raise ValueError(f"Mix at index {index} must be an object")
        for key in required_keys:
            if key not in mix:
                raise KeyError(f"Mix at index {index} is missing required key '{key}'")
            if not isinstance(mix[key], str) or not mix[key].strip():
                raise ValueError(f"Mix at index {index} has invalid value for '{key}'")

        mix_id = mix["id"].strip()
        if not MIX_ID_RE.fullmatch(mix_id):
            raise ValueError(f"Mix at index {index} has invalid id '{mix_id}'")

        audio_type = mix.get("audioType")
        if not isinstance(audio_type, str) or not audio_type.strip():
            audio_type = infer_audio_type(mix["audioUrl"])

        rendered = template
        replacements = {
            "id": mix_id,
            "title": mix["title"],
            "duration": mix["duration"],
            "description": mix["description"],
            "artSrc": mix["artUrl"],
            "artAlt": mix["artAlt"],
            "audioUrl": mix["audioUrl"],
            "audioType": audio_type,
        }
        for key, value in replacements.items():
            rendered = rendered.replace("{{" + key + "}}", html.escape(value))

        out_path = (ROOT / f"{mix_id}.html").resolve()
        if ROOT_RESOLVED not in out_path.parents:
            raise ValueError(f"Refusing to write outside project root for mix id '{mix_id}'")
        out_path.write_text(rendered, encoding="utf-8")

    print(f"Built {len(mixes)} mix pages from {TEMPLATE_PATH.name}")


if __name__ == "__main__":
    build()
