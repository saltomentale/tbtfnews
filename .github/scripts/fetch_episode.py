#!/usr/bin/env python3
"""Fetch podcast episode and blog posts from RSS feeds; write static JSON files."""

import json
import os
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime

EPISODE_FEED = "https://feeds.acast.com/public/shows/too-big-to-fail"

BLOG_FEEDS = [
    {
        "url": "https://finanzacafona.it/feed/",
        "author": "Vittorio",
        "img": "https://saltomentale.github.io/tbtfnews/assets/authors/vittorio.jpg",
    },
    {
        "url": "https://theitalianleathersofa.com/feed/",
        "author": "Nicola",
        "img": "https://saltomentale.github.io/tbtfnews/assets/authors/nicola.jpg",
    },
    {
        "url": "https://saltomentale.it/feed/",
        "author": "Alain",
        "img": "https://saltomentale.github.io/tbtfnews/assets/authors/alain.jpg",
    },
]

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def fetch_xml(url):
    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; RSS-fetcher/1.0)",
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
    }
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as response:
        return response.read()


def find_ns(element, local):
    """Namespace-agnostic child search — mirrors JS getElementsByTagNameNS('*', name)."""
    for child in element:
        local_name = child.tag.split("}")[1] if "}" in child.tag else child.tag
        if local_name == local:
            return child
    return None


def text(el):
    return (el.text or "").strip() if el is not None else ""


# ---------------------------------------------------------------------------
# Episode
# ---------------------------------------------------------------------------

def fetch_episode():
    print(f"Fetching episode feed: {EPISODE_FEED} ...")
    root = ET.fromstring(fetch_xml(EPISODE_FEED))

    item = next(root.iter("item"), None)
    if item is None:
        raise RuntimeError("No <item> found in episode feed")

    encoded = find_ns(item, "encoded")
    description = text(encoded) if encoded is not None else text(item.find("description"))
    enclosure_el = item.find("enclosure")
    image_el = find_ns(item, "image")
    episode_id_el = find_ns(item, "episodeId")

    return {
        "title": text(item.find("title")),
        "link": text(item.find("link")),
        "description": description,
        "pubDate": text(item.find("pubDate")),
        "guid": text(item.find("guid")),
        "acast_episodeId": text(episode_id_el),
        "enclosure": {
            "link": enclosure_el.get("url", "") if enclosure_el is not None else "",
            "type": enclosure_el.get("type", "") if enclosure_el is not None else "",
            "image": image_el.get("href", "") if image_el is not None else "",
        },
    }


# ---------------------------------------------------------------------------
# Blogs
# ---------------------------------------------------------------------------

def parse_date(pub_date_str):
    """Parse RFC 2822 or ISO 8601 date string; return an aware datetime or None."""
    if not pub_date_str:
        return None
    try:
        return parsedate_to_datetime(pub_date_str)
    except Exception:
        pass
    try:
        return datetime.fromisoformat(pub_date_str)
    except Exception:
        return None


def fetch_blogs(max_age_days=7, max_posts=6):
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(days=max_age_days)
    all_posts = []

    for feed in BLOG_FEEDS:
        print(f"Fetching blog feed: {feed['url']} ...")
        try:
            root = ET.fromstring(fetch_xml(feed["url"]))
        except Exception as e:
            print(f"  WARNING: failed to fetch {feed['url']}: {e}")
            continue

        for item in root.iter("item"):
            pub_date_str = text(item.find("pubDate"))
            dt = parse_date(pub_date_str)
            if dt is None:
                continue
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            if dt < cutoff:
                continue

            encoded = find_ns(item, "encoded")
            excerpt = text(encoded) if encoded is not None else text(item.find("description"))

            all_posts.append({
                "title": text(item.find("title")),
                "link": text(item.find("link")),
                "excerpt": excerpt,
                "author": feed["author"],
                "img": feed["img"],
                "pubDate": dt.isoformat(),
            })

    all_posts.sort(key=lambda p: p["pubDate"], reverse=True)
    return all_posts[:max_posts]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    os.makedirs(DATA_DIR, exist_ok=True)

    episode = fetch_episode()
    with open(os.path.join(DATA_DIR, "episode.json"), "w", encoding="utf-8") as f:
        json.dump(episode, f, ensure_ascii=False, indent=2)
    print(f"Saved episode: {episode['title']}")

    blogs = fetch_blogs()
    with open(os.path.join(DATA_DIR, "blogs.json"), "w", encoding="utf-8") as f:
        json.dump(blogs, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(blogs)} blog post(s)")


if __name__ == "__main__":
    main()
