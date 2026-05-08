#!/usr/bin/env python3
"""Fetch the latest episode from the Acast RSS feed and write data/episode.json."""

import json
import os
import urllib.request
import xml.etree.ElementTree as ET

FEED_URL = "https://feeds.acast.com/public/shows/too-big-to-fail"
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "episode.json")

# Namespace-agnostic helper – mirrors JS getElementsByTagNameNS('*', name)
def find_ns(element, local):
    for child in element:
        tag = child.tag
        local_name = tag.split("}")[1] if "}" in tag else tag
        if local_name == local:
            return child
    return None

def get_text(element, *path):
    """Walk a tag path from element, return stripped text or ''."""
    node = element
    for step in path:
        if node is None:
            return ""
        # Try plain tag first, then namespace-agnostic search
        node = node.find(step) or find_ns(node, step)
    return (node.text or "").strip() if node is not None else ""

def main():
    print(f"Fetching {FEED_URL} …")
    req = urllib.request.Request(FEED_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as response:
        xml_bytes = response.read()

    root = ET.fromstring(xml_bytes)

    # Find first <item>
    item = None
    for candidate in root.iter("item"):
        item = candidate
        break

    if item is None:
        raise RuntimeError("No <item> found in feed")

    # Title
    title = get_text(item, "title")

    # Link
    link = get_text(item, "link")

    # Description: prefer content:encoded, fall back to description
    encoded = find_ns(item, "encoded")
    description = (encoded.text or "").strip() if encoded is not None else get_text(item, "description")

    # pubDate
    pub_date = get_text(item, "pubDate")

    # guid
    guid_el = item.find("guid")
    guid = (guid_el.text or "").strip() if guid_el is not None else ""

    # acast episodeId
    episode_id_el = find_ns(item, "episodeId")
    acast_episode_id = (episode_id_el.text or "").strip() if episode_id_el is not None else ""

    # enclosure
    enclosure_el = item.find("enclosure")
    enclosure_link = enclosure_el.get("url", "") if enclosure_el is not None else ""
    enclosure_type = enclosure_el.get("type", "") if enclosure_el is not None else ""

    # itunes:image href
    image_el = find_ns(item, "image")
    itunes_image = (image_el.get("href", "") if image_el is not None else "")

    enclosure = {
        "link": enclosure_link,
        "type": enclosure_type,
        "image": itunes_image,
    }

    episode = {
        "title": title,
        "link": link,
        "description": description,
        "pubDate": pub_date,
        "guid": guid,
        "acast_episodeId": acast_episode_id,
        "enclosure": enclosure,
    }

    os.makedirs(os.path.dirname(os.path.abspath(OUTPUT_PATH)), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(episode, f, ensure_ascii=False, indent=2)

    print(f"Saved episode: {title}")

if __name__ == "__main__":
    main()
