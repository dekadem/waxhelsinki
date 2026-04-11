#!/usr/bin/env python3
"""Generate mix-*.html pages from _template/mix.html + mixes.json."""

import html
import json
import pathlib
import re
import subprocess

ROOT = pathlib.Path(__file__).resolve().parent.parent
ROOT_RESOLVED = ROOT.resolve()
TEMPLATE_PATH = ROOT / "_template" / "mix.html"
DATA_PATH = ROOT / "mixes.json"
MIX_ID_RE = re.compile(r"^mix-\d+$")
HTTP_URL_RE = re.compile(r"^https?://", re.IGNORECASE)
SITE_ORIGIN = "https://waxhelsinki.pages.dev"
DEFAULT_ART_SRC = "./cover.jpg"
DEFAULT_ART_WIDTH = "3000"
DEFAULT_ART_HEIGHT = "3000"
DEFAULT_ART_SRCSET = (
    "./cover-300x300.jpg 300w, "
    "./cover-800x800.jpg 800w, "
    "./cover-1600x1600.jpg 1600w, "
    "./cover-3000x3000.jpg 3000w"
)
DEFAULT_ART_SIZES = "(max-width: 520px) 100vw, min(920px, calc(100vw - 40px))"


def infer_audio_type(audio_url: str) -> str:
    lowered = audio_url.lower()
    if lowered.endswith(".m4a"):
        return "audio/mp4"
    return "audio/mpeg"


def to_public_url(value: str) -> str:
    value = value.strip()
    if HTTP_URL_RE.match(value):
        return value
    if value.startswith("./"):
        value = value[2:]
    elif value.startswith("/"):
        value = value[1:]
    return f"{SITE_ORIGIN}/{value}"


def normalize_dimension(value) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    if not text:
        return None
    if not text.isdigit():
        return None
    if int(text) <= 0:
        return None
    return text


def probe_local_image_size(art_src: str) -> tuple[str, str] | None:
    if art_src.startswith("http://") or art_src.startswith("https://"):
        return None
    if art_src.startswith("./"):
        image_path = ROOT / art_src[2:]
    elif art_src.startswith("/"):
        image_path = ROOT / art_src[1:]
    else:
        image_path = ROOT / art_src
    if not image_path.exists():
        return None
    try:
        proc = subprocess.run(
            ["sips", "-g", "pixelWidth", "-g", "pixelHeight", str(image_path)],
            check=True,
            capture_output=True,
            text=True,
        )
    except (subprocess.SubprocessError, FileNotFoundError):
        return None

    width = None
    height = None
    for line in proc.stdout.splitlines():
        line = line.strip()
        if line.startswith("pixelWidth:"):
            width = line.split(":", 1)[1].strip()
        elif line.startswith("pixelHeight:"):
            height = line.split(":", 1)[1].strip()
    if width and height and width.isdigit() and height.isdigit():
        return width, height
    return None


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

        art_src = mix["artUrl"].strip()
        art_width = normalize_dimension(mix.get("artWidth"))
        art_height = normalize_dimension(mix.get("artHeight"))
        if not art_width or not art_height:
            probed = probe_local_image_size(art_src)
            if probed:
                art_width, art_height = probed
        if not art_width:
            art_width = DEFAULT_ART_WIDTH
        if not art_height:
            art_height = DEFAULT_ART_HEIGHT
        if art_src == DEFAULT_ART_SRC:
            art_srcset = DEFAULT_ART_SRCSET
            art_sizes = DEFAULT_ART_SIZES
        else:
            art_srcset = art_src
            art_sizes = "100vw"

        rendered = template
        replacements = {
            "id": mix_id,
            "title": mix["title"],
            "duration": mix["duration"],
            "description": mix["description"],
            "artSrc": art_src,
            "artSrcset": art_srcset,
            "artSizes": art_sizes,
            "artAlt": mix["artAlt"],
            "artWidth": art_width,
            "artHeight": art_height,
            "ogImage": to_public_url(art_src),
            "ogImageWidth": art_width,
            "ogImageHeight": art_height,
            "twitterImage": to_public_url(art_src),
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
