#!/usr/bin/env python3
import argparse
import datetime as dt
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


def add_index_card(
    index_path: pathlib.Path,
    title: str,
    description: str,
    duration_display: str,
    audio_url: str,
):
    article = (
        '    <article class="card">\n'
        f"      <h2>{title}</h2>\n"
        f"      <div class=\"meta\">{duration_display}</div>\n"
        f"      <p>{description}</p>\n"
        "      <audio controls preload=\"none\">\n"
        f"        <source src=\"{audio_url}\" type=\"audio/mpeg\" />\n"
        "        Your browser does not support the audio element.\n"
        "      </audio>\n"
        "    </article>\n\n"
    )

    original = index_path.read_text(encoding="utf-8")
    marker = "<!-- EPISODE_CARDS_START -->"
    marker_index = original.find(marker)
    if marker_index == -1:
        raise RuntimeError("Could not find episode card insertion point in index.html")

    if audio_url in original:
        raise RuntimeError(f"Episode already exists in index.html for URL: {audio_url}")

    insertion_index = marker_index + len(marker)
    updated = original[:insertion_index] + "\n" + article + original[insertion_index:]
    index_path.write_text(updated, encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="Update wax helsinki feed + homepage for a new mix.")
    parser.add_argument("--feed", required=True)
    parser.add_argument("--index", required=True)
    parser.add_argument("--title", required=True)
    parser.add_argument("--description", required=True)
    parser.add_argument("--audio-url", required=True)
    parser.add_argument("--audio-length", required=True, type=int)
    parser.add_argument("--duration-seconds", required=True, type=float)
    parser.add_argument("--pub-date-rfc2822", required=True)
    parser.add_argument("--guid-prefix", default="wax-helsinki")
    args = parser.parse_args()

    guid_base = slugify(args.title)
    utc_stamp = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%d%H%M%S")
    guid = f"{args.guid_prefix}-{guid_base}-{utc_stamp}"

    feed_path = pathlib.Path(args.feed)
    index_path = pathlib.Path(args.index)

    add_feed_item(
        feed_path=feed_path,
        title=args.title,
        description=args.description,
        pub_date_rfc2822=args.pub_date_rfc2822,
        guid=guid,
        audio_url=args.audio_url,
        audio_length=args.audio_length,
        duration_seconds=args.duration_seconds,
    )

    add_index_card(
        index_path=index_path,
        title=args.title,
        description=args.description,
        duration_display=seconds_to_itunes_duration(args.duration_seconds),
        audio_url=args.audio_url,
    )


if __name__ == "__main__":
    main()
