import urllib.request
import ssl
import json
import re
import time
from bs4 import BeautifulSoup

ctx = ssl._create_unverified_context()
headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

with open("scripts/packages_list.json") as f:
    packages = json.load(f)

print(f"Loaded {len(packages)} packages to scrape in depth...")

scraped_trips = []

for i, pkg in enumerate(packages):
    title_raw = pkg["title"]
    link = pkg["link"]
    if not link.startswith("http"):
        link = f"https://spiritadventures.in{link}"
    
    print(f"[{i+1}/{len(packages)}] Scraping {title_raw} ({link})...")
    try:
        req = urllib.request.Request(link, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
            html = resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"  Failed to fetch {link}: {e}")
        continue
    
    soup = BeautifulSoup(html, "html.parser")
    
    # 1. Parse duration
    m_dur = re.search(r"(\d+)D\s*(\d+)N", title_raw, re.I)
    days = int(m_dur.group(1)) if m_dur else 2
    nights = int(m_dur.group(2)) if m_dur else 1
    duration_label = f"{days} Days / {nights} Nights"
    
    # 2. Parse price
    m_price = re.search(r"(?:Package\s*Cost|Price|Cost)[\s:]*₹\s*([0-9,]+)", html, re.I)
    if m_price:
        price_num = float(m_price.group(1).replace(",", ""))
    else:
        # fallback search for any ₹ digits
        all_prices = re.findall(r"₹\s*([0-9,]{3,7})", html)
        if all_prices:
            price_num = float(all_prices[0].replace(",", ""))
        else:
            price_num = 4500.0 if days <= 2 else (6500.0 if days == 3 else 9500.0)
    
    # 3. Destination detection
    dest_name = "South India"
    t_upper = title_raw.upper()
    for d in ["COORG", "DANDELI", "GOKARNA", "HAMPI", "MUNNAR", "CHIKMAGALUR", "CHICKMANGALUR", "GOA", "LONAVALA", "OOTY", "PONDICHERRY", "WAYANAD", "MANALI", "DARJEELING", "KASHMIR", "KERALA", "MEGHALAYA", "SHIMLA", "LADAKH", "KODAIKANAL"]:
        if d in t_upper:
            dest_name = "Chikmagalur" if "CHICK" in d else d.title()
            break
            
    # 4. Images
    images = []
    if pkg.get("image"):
        images.append(pkg["image"])
    for img in soup.find_all("img"):
        src = img.get("data-lazy-src") or img.get("data-src") or img.get("src") or ""
        if src and "wp-content/uploads" in src and src not in images and not any(x in src.lower() for x in ["logo", "icon", "arrow"]):
            images.append(src)
            
    cover_image = images[0] if images else "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80"
    
    # 5. Day by day itineraries
    itinerary_days = []
    day_matches = list(re.finditer(r"(?:DAY\s*(\d+)[\s–\-\:]+([^\n\<\>]+))", html, re.I))
    for idx, dm in enumerate(day_matches):
        day_num = int(dm.group(1)) if dm.group(1) else (idx + 1)
        day_title = dm.group(2).strip()
        # Find description between this day and next day
        start_p = dm.end()
        end_p = day_matches[idx+1].start() if idx + 1 < len(day_matches) else (start_p + 600)
        chunk = html[start_p:end_p]
        # clean text from chunk
        c_soup = BeautifulSoup(chunk, "html.parser")
        desc = c_soup.get_text(separator=" ", strip=True)
        # trim to 300 chars
        desc = re.sub(r"\s+", " ", desc)[:350]
        itinerary_days.append({
            "day_number": day_num,
            "title": f"Day {day_num}: {day_title.title()}",
            "description": desc or f"Exploration and guided adventure through {dest_name} highlights."
        })
        
    if not itinerary_days:
        for d in range(1, days + 1):
            itinerary_days.append({
                "day_number": d,
                "title": f"Day {d}: {dest_name} Exploration & Trails",
                "description": f"Guided nature trails, scenic view points, local cuisine, and group experiences in {dest_name}."
            })
            
    # 6. Inclusions & Exclusions
    inclusions = [
        "Sleeper Class / AC Transportation as per itinerary",
        "Accommodation on sharing basis (Camps / Homestays / Resorts)",
        "Certified Trek Leaders & Local Expert Guides",
        "Campfire & Group Entertainment (subject to weather)",
        "First Aid & Safety Support 24/7",
        "Toll, parking, permits, and driver allowances"
    ]
    exclusions = [
        "Personal expenses (shopping, laundry, beverages)",
        "Any water sports or optional activity entry tickets not listed",
        "Meals during transit",
        "Anything not mentioned in inclusions"
    ]
    
    # 7. Clean slug
    clean_slug = re.sub(r"[^a-z0-9]+", "-", title_raw.lower()).strip("-")
    
    # 8. Category
    category_slug = "weekend"
    if "trek" in title_raw.lower() or "summit" in title_raw.lower() or "peak" in title_raw.lower():
        category_slug = "treks"
    elif "rafting" in title_raw.lower() or "beach" in title_raw.lower() or "water" in title_raw.lower() or "falls" in title_raw.lower():
        category_slug = "water"
    elif days >= 4:
        category_slug = "group-trips"
    elif "couple" in title_raw.lower():
        category_slug = "group-trips"
        
    trip_record = {
        "title": title_raw.replace(" – ", " - ").replace(" & ", " & ").title(),
        "slug": clean_slug,
        "destination_name": dest_name,
        "destination_slug": re.sub(r"[^a-z0-9]+", "-", dest_name.lower()),
        "category_slug": category_slug,
        "duration_days": days,
        "duration_nights": nights,
        "duration_label": duration_label,
        "price": price_num,
        "original_price": round(price_num * 1.25),
        "difficulty": "EASY" if days <= 2 else ("MODERATE" if days <= 4 else "CHALLENGING"),
        "cover_image": cover_image,
        "gallery_images": images[:6],
        "short_description": f"Curated {duration_label} adventure through {dest_name} featuring waterfalls, scenic trails, and wilderness camping.",
        "full_description": f"Join Spirit Adventures on a journey to {dest_name}. Escape the city, embrace nature, and explore breathtaking trails with trusted local guides.",
        "itinerary_days": itinerary_days,
        "inclusions": inclusions,
        "exclusions": exclusions,
        "source_url": link
    }
    
    scraped_trips.append(trip_record)
    time.sleep(0.3)

print(f"\nSuccessfully scraped {len(scraped_trips)} full trip records!")
with open("scripts/full_scraped_trips.json", "w") as f:
    json.dump(scraped_trips, f, indent=2)

print("Saved output to scripts/full_scraped_trips.json")
