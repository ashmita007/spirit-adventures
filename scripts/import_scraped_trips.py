import os
import sys
import json
import html
import re

# Setup Django environment
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "spirit_backend.settings")
import django
django.setup()

from django.utils.text import slugify
from adventures.models import (
    Destination, Category, Trip, TripImage, TripVideo,
    TripItinerary, FAQ, Review
)
from adventures import crm

def clean_text(text):
    if not text:
        return ""
    text = html.unescape(text)
    text = re.sub(r"&[a-zA-Z0-9#]+;", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def main():
    print("🚀 Starting Import of 40 Scraped Trips into Database...")

    with open("scripts/full_scraped_trips.json") as f:
        scraped_trips = json.load(f)

    # 1. Categories
    categories_def = [
        {"name": "Weekend Getaways", "slug": "weekend", "icon": "Sun", "description": "Quick 2-3 day scenic nature retreats."},
        {"name": "Treks", "slug": "treks", "icon": "Mountain", "description": "Summit trails and high-altitude mountain ridges."},
        {"name": "Water Sports", "slug": "water", "icon": "Waves", "description": "River rafting, waterfalls, and coastal beach treks."},
        {"name": "Snow Treks", "slug": "snow", "icon": "Snowflake", "description": "Winter wonderland trails and snow summits."},
        {"name": "Group Trips", "slug": "group-trips", "icon": "Users", "description": "Curated small-group journeys with expert leaders."},
        {"name": "Couple Packages", "slug": "couple-packages", "icon": "Heart", "description": "Romantic curated getaways for couples."},
        {"name": "Camping", "slug": "camping", "icon": "Tent", "description": "Overnight stargazing and cozy alpine camps."}
    ]

    cat_map = {}
    for cdata in categories_def:
        cat, _ = Category.objects.update_or_create(
            slug=cdata["slug"],
            defaults={"name": cdata["name"], "icon": cdata["icon"], "description": cdata["description"]}
        )
        cat_map[cdata["slug"]] = cat
    print(f"✅ {len(cat_map)} categories ensured.")

    # 2. Destinations setup with high quality imagery
    destination_metadata = {
        "Coorg": {
            "subtitle": "Scotland of India & Coffee Country",
            "desc": "Misty hills, lush coffee plantations, Abbey Falls, and the majestic Raja's Seat in the Western Ghats.",
            "cover": "https://spiritadventures.in/wp-content/smush-webp/2026/06/COORG1-1.png.webp",
            "hero": "https://spiritadventures.in/wp-content/smush-webp/2026/06/COORG1-1.png.webp",
        },
        "Dandeli": {
            "subtitle": "Kali River White Water Rafting & Dense Rainforests",
            "desc": "Exhilarating Grade 3 white water rafting, jungle kayaking, and hornbill reserve safaris in Western Ghats.",
            "cover": "https://spiritadventures.in/wp-content/smush-webp/2026/06/DANDELI1-1.png.webp",
            "hero": "https://spiritadventures.in/wp-content/smush-webp/2026/06/DANDELI1-1.png.webp",
        },
        "Gokarna": {
            "subtitle": "Golden Cliffs & Arabian Sea Coastal Headlands",
            "desc": "Pristine golden beach coves, rocky cliff trails, and bioluminescent ocean stargazing in Karnataka.",
            "cover": "https://spiritadventures.in/wp-content/uploads/2026/06/GOKARNA-MURUDESHWAR1-1.png",
            "hero": "https://spiritadventures.in/wp-content/uploads/2026/06/GOKARNA-MURUDESHWAR1-1.png",
        },
        "Hampi": {
            "subtitle": "UNESCO Bouldered Ruins & Tungabhadra Coracle Rides",
            "desc": "Timeless boulder-strewn landscape, ancient Vijayanagara temples, and cliff jumping across Sanapur Lake.",
            "cover": "https://spiritadventures.in/wp-content/smush-webp/2026/06/HAMPI1-1.png.webp",
            "hero": "https://spiritadventures.in/wp-content/smush-webp/2026/06/HAMPI1-1.png.webp",
        },
        "Munnar": {
            "subtitle": "Emerald Tea Estates & Anamudi High Peaks",
            "desc": "Endless rolling green tea carpets, misty cloud walks, waterfalls, and spice trails in Kerala.",
            "cover": "https://spiritadventures.in/wp-content/smush-webp/2026/06/MUNNAR2-1.png.webp",
            "hero": "https://spiritadventures.in/wp-content/smush-webp/2026/06/MUNNAR2-1.png.webp",
        },
        "Chikmagalur": {
            "subtitle": "Birthplace of Indian Coffee & Mullayanagiri Peak",
            "desc": "Highest peak in Karnataka, cascading Hebbe falls, off-road jeep safaris, and coffee plantation stays.",
            "cover": "https://spiritadventures.in/wp-content/smush-webp/2026/06/CHICKMANGALUR2-1.png.webp",
            "hero": "https://spiritadventures.in/wp-content/smush-webp/2026/06/CHICKMANGALUR2-1.png.webp",
        },
        "Goa": {
            "subtitle": "Sun-Kissed Beaches, Coastal Treks & Old Latin Quarters",
            "desc": "Vibrant Arabian coastline, Dudhsagar falls, cliff trails, and watersports adventures.",
            "cover": "https://spiritadventures.in/wp-content/uploads/2026/06/GOA2-1.png",
            "hero": "https://spiritadventures.in/wp-content/uploads/2026/06/GOA2-1.png",
        },
        "Ooty": {
            "subtitle": "Queen of Nilgiris, Pine Forests & Tea Slopes",
            "desc": "Heritage Nilgiri mountain railway, botanical gardens, Pykara lake, and Coonoor viewpoint trails.",
            "cover": "https://spiritadventures.in/wp-content/smush-webp/2026/06/OOTY-COONOOR2-1.png.webp",
            "hero": "https://spiritadventures.in/wp-content/smush-webp/2026/06/OOTY-COONOOR2-1.png.webp",
        },
        "Wayanad": {
            "subtitle": "Caves, Waterfalls & Chembra Heart-Shaped Lake",
            "desc": "Edakkal caves, dense bamboo forests, Soochipara falls, and tranquil wilderness retreats.",
            "cover": "https://spiritadventures.in/wp-content/smush-webp/2026/06/WAYANAD2-1.png.webp",
            "hero": "https://spiritadventures.in/wp-content/smush-webp/2026/06/WAYANAD2-1.png.webp",
        },
        "Pondicherry": {
            "subtitle": "French Heritage Quarters & Serene Promenades",
            "desc": "Cobblestone streets, pastel French colonial villas, Auroville, and sunrise beach surfs.",
            "cover": "https://spiritadventures.in/wp-content/smush-webp/2026/06/PONDICHERRY2-1.png.webp",
            "hero": "https://spiritadventures.in/wp-content/smush-webp/2026/06/PONDICHERRY2-1.png.webp",
        },
        "Lonavala": {
            "subtitle": "Sahyadri Valley Treks, Andharban & Devkund Falls",
            "desc": "Dense forest trails, ancient Buddhist caves, and crystal turquoise plunge pools in the Western Ghats.",
            "cover": "https://spiritadventures.in/wp-content/smush-webp/2026/06/LONAVALA-ANDHARBAN-DEVKUND2-1.png.webp",
            "hero": "https://spiritadventures.in/wp-content/smush-webp/2026/06/LONAVALA-ANDHARBAN-DEVKUND2-1.png.webp",
        },
        "Manali": {
            "subtitle": "Pir Panjal Alpine Summits, Solang & Rohtang Pass",
            "desc": "Pine forests, high mountain passes, Beas river adventure sports, and Himalayan snow summits.",
            "cover": "https://spiritadventures.in/wp-content/uploads/2026/06/4D-3N-MANALI-1.png",
            "hero": "https://spiritadventures.in/wp-content/uploads/2026/06/4D-3N-MANALI-1.png",
        },
        "Kashmir": {
            "subtitle": "Paradise on Earth & Alpine Glacial Lakes",
            "desc": "Turquoise high-altitude alpine lakes, Dal Lake houseboats, and snow-dusted pine meadows.",
            "cover": "https://spiritadventures.in/wp-content/smush-webp/2026/06/5D-4N-KASHMIR-1.png.webp",
            "hero": "https://spiritadventures.in/wp-content/smush-webp/2026/06/5D-4N-KASHMIR-1.png.webp",
        },
        "Meghalaya": {
            "subtitle": "Abode of Clouds & Living Root Bridges",
            "desc": "Dawki transparent river, Cherrapunji roaring waterfalls, and misty rainforest treks.",
            "cover": "https://spiritadventures.in/wp-content/smush-webp/2026/06/5D-4N-MEGHALAYA-1.png.webp",
            "hero": "https://spiritadventures.in/wp-content/smush-webp/2026/06/5D-4N-MEGHALAYA-1.png.webp",
        },
        "Darjeeling": {
            "subtitle": "Kanchenjunga Sunrises & Himalayan Foothills",
            "desc": "Tiger Hill sunrise over Mt. Kanchenjunga, world-famous tea estates, and Himalayan mountaineering.",
            "cover": "https://spiritadventures.in/wp-content/uploads/2026/06/5D-4N-DARJEELING-1.png",
            "hero": "https://spiritadventures.in/wp-content/uploads/2026/06/5D-4N-DARJEELING-1.png",
        },
        "Kerala": {
            "subtitle": "God's Own Country, Backwaters & Spice Hills",
            "desc": "Alleppey backwater houseboats, Periyar wildlife sanctuary, and lush tropical mountain ranges.",
            "cover": "https://spiritadventures.in/wp-content/uploads/2026/06/5D-4N-KERALA-1.png",
            "hero": "https://spiritadventures.in/wp-content/uploads/2026/06/5D-4N-KERALA-1.png",
        },
        "Kodaikanal": {
            "subtitle": "Princess of Hill Stations & Misty Pillar Rocks",
            "desc": "Dense pine forests, star-shaped lakes, Kurinji flowers, and cascading silver cascade waterfalls in Western Ghats.",
            "cover": "https://spiritadventures.in/wp-content/smush-webp/2026/06/6D-5N-KODAIKANKAL-OOTY-MYSORE-1.png.webp",
            "hero": "https://spiritadventures.in/wp-content/smush-webp/2026/06/6D-5N-KODAIKANKAL-OOTY-MYSORE-1.png.webp",
        },
        "Shimla": {
            "subtitle": "Queen of the Hills & Colonial Alpine Sanctuaries",
            "desc": "Snow-dusted Himalayan ridges, Ridge view walks, pine sanctuaries, and heritage mountain railways.",
            "cover": "https://spiritadventures.in/wp-content/uploads/2026/06/5D-4N-SHIMLA-MANALI-1.png",
            "hero": "https://spiritadventures.in/wp-content/uploads/2026/06/5D-4N-SHIMLA-MANALI-1.png",
        },
        "South India": {
            "subtitle": "Western Ghats, Coastal Temples & Rainforests",
            "desc": "Comprehensive journeys across Karnataka, Kerala, and Tamil Nadu's greatest nature circuits.",
            "cover": "https://spiritadventures.in/wp-content/smush-webp/2026/06/COORG1-1.png.webp",
            "hero": "https://spiritadventures.in/wp-content/smush-webp/2026/06/COORG1-1.png.webp",
        }
    }

    dest_map = {}
    for d_name, d_info in destination_metadata.items():
        d_slug = slugify(d_name)
        dest, _ = Destination.objects.update_or_create(
            name=d_name,
            defaults={
                "slug": d_slug,
                "subtitle": d_info["subtitle"],
                "description": d_info["desc"],
                "cover_image": d_info["cover"],
                "hero_image": d_info["hero"],
                "video_url": "",
                "is_featured": True,
                "is_published": True
            }
        )
        dest_map[d_name] = dest
    print(f"✅ {len(dest_map)} destinations ensured.")

    # 3. Process each scraped trip
    imported_count = 0
    for idx, item in enumerate(scraped_trips):
        t_title = clean_text(item["title"])
        t_slug = item["slug"]
        d_name = item["destination_name"]
        dest = dest_map.get(d_name) or dest_map["South India"]
        
        # Category determination
        c_slug = item.get("category_slug", "weekend")
        if "couple" in t_title.lower():
            c_slug = "couple-packages"
        category = cat_map.get(c_slug) or cat_map["weekend"]

        price = float(item["price"])
        if price < 2000 and item["duration_days"] >= 3:
            price = 11000.0  # Fix typo in 4D 3N Munnar & Thekkedy

        orig_price = float(item.get("original_price") or round(price * 1.25))
        if orig_price <= price:
            orig_price = round(price * 1.25)

        cover_img = item.get("cover_image", "").replace("http://", "https://")
        if not cover_img:
            cover_img = dest.cover_image

        short_desc = clean_text(item.get("short_description") or f"Curated {item['duration_label']} journey through {d_name}.")
        full_desc = clean_text(item.get("full_description") or f"Join Spirit Adventures on an unforgettable journey to {d_name}.")

        trip, created = Trip.objects.update_or_create(
            slug=t_slug,
            defaults={
                "title": t_title,
                "destination": dest,
                "category": category,
                "short_description": short_desc[:300],
                "full_description": full_desc,
                "duration_days": item["duration_days"],
                "duration_nights": item["duration_nights"],
                "difficulty": item.get("difficulty", "MODERATE"),
                "price": price,
                "original_price": orig_price,
                "cover_image": cover_img,
                "inclusions": item.get("inclusions", []),
                "exclusions": item.get("exclusions", []),
                "things_to_carry": [
                    "Backpack (40-60L) with rain cover",
                    "Sturdy trekking/walking shoes with good grip",
                    "Quick-dry t-shirts and track pants",
                    "Warm layer / light jacket for evening",
                    "Reusable water bottle & energy snacks",
                    "Personal toiletries, medications & power bank",
                    "Government ID proof (original)"
                ],
                "is_featured": idx < 6,
                "is_bestseller": idx in [0, 1, 2, 4, 8, 14, 22, 28],
                "is_published": True,
                "ordering": idx + 1
            }
        )

        # Clear and recreate Itinerary days
        TripItinerary.objects.filter(trip=trip).delete()
        raw_itineraries = item.get("itinerary_days", [])
        clean_days = []
        for raw_d in raw_itineraries:
            desc = clean_text(raw_d.get("description", ""))
            day_title = clean_text(raw_d.get("title", ""))
            # filter out meta description / skip to content tags
            if "Skip to content" in desc or "Hellip" in day_title or day_title.endswith('\" /') or day_title.endswith('/'):
                continue
            clean_days.append({
                "title": day_title,
                "desc": desc
            })

        if not clean_days:
            # Fallback days if empty
            for d in range(1, trip.duration_days + 1):
                clean_days.append({
                    "title": f"Day {d}: {dest.name} Highlights & Scenic Trails",
                    "desc": f"Guided discovery of {dest.name}'s iconic viewpoints, nature trails, group activities, and cultural experiences."
                })

        for day_idx, cday in enumerate(clean_days):
            TripItinerary.objects.create(
                trip=trip,
                day_number=day_idx + 1,
                title=cday["title"],
                description=cday["desc"] or f"Adventure and exploration in {dest.name}.",
                meals="Breakfast & Dinner included" if day_idx > 0 else "Welcome Refreshment & Dinner",
                stay_type="Scenic Homestay / Nature Resort" if "couple" in t_title.lower() else "Adventure Campsite / Shared Homestay",
                ordering=day_idx + 1
            )

        # Gallery images
        TripImage.objects.filter(trip=trip).delete()
        for g_idx, g_url in enumerate(item.get("gallery_images", [])):
            g_url_clean = g_url.replace("http://", "https://")
            if g_url_clean:
                TripImage.objects.create(
                    trip=trip,
                    image_url=g_url_clean,
                    ordering=g_idx + 1
                )

        imported_count += 1
        print(f"[{imported_count}/40] Imported '{trip.title}' ({trip.slug}) -> ₹{price:,.0f}")

    print(f"\n🎉 Successfully imported {imported_count} trips with full itineraries into the database!")
    try:
        crm_result = crm.push_trips(list(Trip.objects.all()))
        print(f"✅ CRM synced: {crm_result}")
    except Exception as e:
        print(f"⚠️ CRM sync warning: {e}")

if __name__ == "__main__":
    main()
