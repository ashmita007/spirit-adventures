import urllib.request
import ssl
import json
import re
import os
from urllib.parse import urljoin, urlparse

ctx = ssl._create_unverified_context()
headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}

def fetch_url(url):
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=20) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return ""

print("Fetching https://spiritadventures.in/destinations/ ...")
main_html = fetch_url("https://spiritadventures.in/destinations/")

# Find all destination links
dest_links = set()
for m in re.finditer(r'href=[\"\x27](https?://(?:www\.)?spiritadventures\.in/destination/[^/\"\'\?#]+/?[\"\x27])', main_html):
    link = m.group(1).rstrip("\"'")
    dest_links.add(link)

# Also check for any package/trip links or general links
trip_links = set()
for m in re.finditer(r'href=[\"\x27](https?://(?:www\.)?spiritadventures\.in/(?:trips|package|tour)/[^\"\'\?#]+/?[\"\x27])', main_html):
    link = m.group(1).rstrip("\"'")
    trip_links.add(link)

# Find all links on the page to see how spiritadventures.in structures destinations and tours
all_links = set(re.findall(r'href=[\"\x27](https?://(?:www\.)?spiritadventures\.in/[a-zA-Z0-9_\-\/]+)[\"\x27]', main_html))

print(f"Destination specific links found: {len(dest_links)}")
for d in sorted(dest_links):
    print("  ", d)

print(f"\nAll internal links found on /destinations/ ({len(all_links)}):")
for l in sorted(all_links):
    if not any(x in l for x in ["/wp-content/", "/feed/", "/comments/", "/#"]):
        print("  ", l)
