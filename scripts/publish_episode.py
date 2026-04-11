#!/usr/bin/env python3
"""Update mixes.json and feed.xml when publishing a new wax helsinki episode."""

import argparse
import datetime as dt
import json
import pathlib
import re
import xml.etree.ElementTree as ET


ITUNES_NS = "http://www.itunes.com/dtds/podcast-1.0.dtd"
ATOM_NS = "http://www.w3.org/2005/Atom"
CONTENT_NS = "http://purl.org/rss/1.0/modules/content/"

ET.register_namespace("itunes", ITUNES_NS)
ET.register_namespace("atom", ATOM_NS)
ET.register_namespace("content", CONTENT_NS)


def slugify(value: str) -> str:
    cleaned = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return cleaned or "episode"


def derive_mix_id_from_title(title: str) -> str:
    """Extract mix number from title and normalize to mix-###."""
    match = re.search(r"(?:wax)?mix[\s_-]*(\d+)\b", title, re.IGNORECASE)
    if match:
        number = match.group(1)
        if len(number) < 3:
            number = number.zfill(3)
        return f"mix-{number}"
    return slugify(title)


def seconds_to_itunes_duration(seconds: float) -> str:
    total = int(round(seconds))
    hours = total // 3600
    minutes = (total % 3600) // 60
    secs = total % 60
    if hours > 0:
        return f"{hours}:{minutes:02d}:{secs:02d}"
    return f"{minutes}:{secs:02d}"


def add_feed_item(
    feed_path: pathlib.Path,
    title: str,
    description: str,
    pub_date_rfc2822: str,
    guid: str,
    audio_url: str,
    audio_length: int,
    duration_seconds: float,
):
    tree = ET.parse(feed_path)
    root = tree.getroot()
    channel = root.find("channel")
    if channel is None:
        raise RuntimeError("Invalid feed.xml: missing channel")

    for item in channel.findall("item"):
        enclosure = item.find("enclosure")
        if enclosure is not None and enclosure.get("url") == audio_url:
            raise RuntimeError(f"Episode already exists in feed for URL: {audio_url}")

    item = ET.Element("item")
    ET.SubElement(item, "title").text = title
    ET.SubElement(item, "description").text = description
    ET.SubElement(item, "pubDate").text = pub_date_rfc2822
    guid_el = ET.SubElement(item, "guid")
    guid_el.set("isPermaLink", "false")
    guid_el.text = guid
    enclosure = ET.SubElement(item, "enclosure")
    enclosure.set("url", audio_url)
    enclosure.set("length", str(audio_length))
    enclosure.set("type", "audio/mpeg")
    ET.SubElement(item, f"{{{ITUNES_NS}}}duration").text = seconds_to_itunes_duration(duration_seconds)
    ET.SubElement(item, f"{{{ITUNES_NS}}}explicit").text = "no"
    ET.SubElement(item, f"{{{ITUNES_NS}}}episodeType").text = "full"
    ET.SubElement(item, f"{{{ITUNES_NS}}}author").text = "wax helsinki"
    ET.SubElement(item, f"{{{ITUNES_NS}}}summary").text = description

    first_item = channel.find("item")
    if first_item is None:
        channel.append(item)
    else:
        first_item_index = list(channel).index(first_item)
        channel.insert(first_item_index, item)

    tree.write(feed_path, encoding="utf-8", xml_declaration=True)


def add_mixes_json_entry(
    mixes_path: pathlib.Path,
    mix_id: str,
    title: str,
    description: str,
    duration_display: str,
    audio_url: str,
    art_url: str = "./cover.jpg",
):
    mixes = json.loads(mixes_path.read_text(encoding="utf-8"))

    for m in mixes:
        if m.get("id") == mix_id:
            raise RuntimeError(f"Episode already exists in mixes.json for ID: {mix_id}")
        if m.get("audioUrl") == audio_url:
            raise RuntimeError(f"Episode already exists in mixes.json for URL: {audio_url}")

    audio_type = "audio/mp4" if audio_url.lower().endswith(".m4a") else "audio/mpeg"

    entry = {
        "id": mix_id,
        "title": title,
        "duration": duration_display,
        "description": description,
        "audioUrl": audio_url,
        "artUrl": art_url,
        "artAlt": f"{title} artwork",
        "audioType": audio_type,
    }
    mixes.insert(0, entry)
    mixes_path.write_text(json.dumps(mixes, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="Update wax helsinki feed + mixes.json for a new mix.")
    parser.add_argument("--feed", required=True)
    parser.add_argument("--mixes-json", required=True)
    parser.add_argument("--title", required=True)
    parser.add_argument("--description", required=True)
    parser.add_argument("--audio-url", required=True)
    parser.add_argument("--audio-length", required=True, type=int)
    parser.add_argument("--duration-seconds", required=True, type=float)
    parser.add_argument("--pub-date-rfc2822", required=True)
    parser.add_argument("--mix-id", default=None, help="Mix ID (e.g. mix-025). Auto-derived from title if omitted.")
    parser.add_argument("--guid-prefix", default="wax-helsinki")
    args = parser.parse_args()

    mix_id = args.mix_id or derive_mix_id_from_title(args.title)
    guid_base = slugify(args.title)
    utc_stamp = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%d%H%M%S")
    guid = f"{args.guid_prefix}-{guid_base}-{utc_stamp}"

    feed_path = pathlib.Path(args.feed)
    mixes_path = pathlib.Path(args.mixes_json)
    feed_tmp = feed_path.with_suffix(feed_path.suffix + ".tmp")
    mixes_tmp = mixes_path.with_suffix(mixes_path.suffix + ".tmp")

    try:
        # Work on temporary copies first so originals are untouched unless both updates succeed.
        feed_tmp.write_text(feed_path.read_text(encoding="utf-8"), encoding="utf-8")
        mixes_tmp.write_text(mixes_path.read_text(encoding="utf-8"), encoding="utf-8")

        add_mixes_json_entry(
            mixes_path=mixes_tmp,
            mix_id=mix_id,
            title=args.title,
            description=args.description,
            duration_display=seconds_to_itunes_duration(args.duration_seconds),
            audio_url=args.audio_url,
        )

        add_feed_item(
            feed_path=feed_tmp,
            title=args.title,
            description=args.description,
            pub_date_rfc2822=args.pub_date_rfc2822,
            guid=guid,
            audio_url=args.audio_url,
            audio_length=args.audio_length,
            duration_seconds=args.duration_seconds,
        )

        mixes_tmp.replace(mixes_path)
        feed_tmp.replace(feed_path)
    finally:
        if mixes_tmp.exists():
            mixes_tmp.unlink()
        if feed_tmp.exists():
            feed_tmp.unlink()


if __name__ == "__main__":
    main()
