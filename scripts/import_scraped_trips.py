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
            "cover": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80",
            "hero": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1920&q=80",
        },
        "Dandeli": {
            "subtitle": "Kali River White Water Rafting & Dense Rainforests",
            "desc": "Exhilarating Grade 3 white water rafting, jungle kayaking, and hornbill reserve safaris in Western Ghats.",
            "cover": "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341325/spirit_adventures/shorts/dandeli_rafting_poster.jpg",
            "hero": "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341325/spirit_adventures/shorts/dandeli_rafting_poster.jpg",
        },
        "Gokarna": {
            "subtitle": "Golden Cliffs & Arabian Sea Coastal Headlands",
            "desc": "Pristine golden beach coves, rocky cliff trails, and bioluminescent ocean stargazing in Karnataka.",
            "cover": "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341326/spirit_adventures/shorts/gokarna_beach_poster.jpg",
            "hero": "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341326/spirit_adventures/shorts/gokarna_beach_poster.jpg",
        },
        "Hampi": {
            "subtitle": "UNESCO Bouldered Ruins & Tungabhadra Coracle Rides",
            "desc": "Timeless boulder-strewn landscape, ancient Vijayanagara temples, and cliff jumping across Sanapur Lake.",
            "cover": "https://images.unsplash.com/photo-1600100397608-f010f4439c2c?auto=format&fit=crop&w=1200&q=80",
            "hero": "https://images.unsplash.com/photo-1600100397608-f010f4439c2c?auto=format&fit=crop&w=1920&q=80",
        },
        "Munnar": {
            "subtitle": "Emerald Tea Estates & Anamudi High Peaks",
            "desc": "Endless rolling green tea carpets, misty cloud walks, waterfalls, and spice trails in Kerala.",
            "cover": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80",
            "hero": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1920&q=80",
        },
        "Chikmagalur": {
            "subtitle": "Birthplace of Indian Coffee & Mullayanagiri Peak",
            "desc": "Highest peak in Karnataka, cascading Hebbe falls, off-road jeep safaris, and coffee plantation stays.",
            "cover": "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80",
            "hero": "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1920&q=80",
        },
        "Goa": {
            "subtitle": "Sun-Kissed Beaches, Coastal Treks & Old Latin Quarters",
            "desc": "Vibrant Arabian coastline, Dudhsagar falls, cliff trails, and watersports adventures.",
            "cover": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
            "hero": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1920&q=80",
        },
        "Ooty": {
            "subtitle": "Queen of Nilgiris, Pine Forests & Tea Slopes",
            "desc": "Heritage Nilgiri mountain railway, botanical gardens, Pykara lake, and Coonoor viewpoint trails.",
            "cover": "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1200&q=80",
            "hero": "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1920&q=80",
        },
        "Wayanad": {
            "subtitle": "Caves, Waterfalls & Chembra Heart-Shaped Lake",
            "desc": "Edakkal caves, dense bamboo forests, Soochipara falls, and tranquil wilderness retreats.",
            "cover": "https://images.unsplash.com/photo-1606214174585-fe31582dc6ee?auto=format&fit=crop&w=1200&q=80",
            "hero": "https://images.unsplash.com/photo-1606214174585-fe31582dc6ee?auto=format&fit=crop&w=1920&q=80",
        },
        "Pondicherry": {
            "subtitle": "French Heritage Quarters & Serene Promenades",
            "desc": "Cobblestone streets, pastel French colonial villas, Auroville, and sunrise beach surfs.",
            "cover": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
            "hero": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1920&q=80",
        },
        "Lonavala": {
            "subtitle": "Sahyadri Valley Treks, Andharban & Devkund Falls",
            "desc": "Dense forest trails, ancient Buddhist caves, and crystal turquoise plunge pools in the Western Ghats.",
            "cover": "https://images.unsplash.com/photo-1570784332176-fdd73da66f03?auto=format&fit=crop&w=1200&q=80",
            "hero": "https://images.unsplash.com/photo-1570784332176-fdd73da66f03?auto=format&fit=crop&w=1920&q=80",
        },
        "Manali": {
            "subtitle": "Pir Panjal Alpine Summits, Solang & Rohtang Pass",
            "desc": "Pine forests, high mountain passes, Beas river adventure sports, and Himalayan snow summits.",
            "cover": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
            "hero": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1920&q=80",
        },
        "Kashmir": {
            "subtitle": "Paradise on Earth & Alpine Glacial Lakes",
            "desc": "Turquoise high-altitude alpine lakes, Dal Lake houseboats, and snow-dusted pine meadows.",
            "cover": "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80",
            "hero": "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=80",
        },
        "Meghalaya": {
            "subtitle": "Abode of Clouds & Living Root Bridges",
            "desc": "Dawki transparent river, Cherrapunji roaring waterfalls, and misty rainforest treks.",
            "cover": "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80",
            "hero": "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1920&q=80",
        },
        "Darjeeling": {
            "subtitle": "Kanchenjunga Sunrises & Himalayan Foothills",
            "desc": "Tiger Hill sunrise over Mt. Kanchenjunga, world-famous tea estates, and Himalayan mountaineering.",
            "cover": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
            "hero": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1920&q=80",
        },
        "Kerala": {
            "subtitle": "God's Own Country, Backwaters & Spice Hills",
            "desc": "Alleppey backwater houseboats, Periyar wildlife sanctuary, and lush tropical mountain ranges.",
            "cover": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80",
            "hero": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1920&q=80",
        },
        "South India": {
            "subtitle": "Western Ghats, Coastal Temples & Rainforests",
            "desc": "Comprehensive journeys across Karnataka, Kerala, and Tamil Nadu's greatest nature circuits.",
            "cover": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80",
            "hero": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1920&q=80",
        }
    }

    dest_map = {}
    for d_name, d_info in destination_metadata.items():
        d_slug = slugify(d_name)
        yt_v = {
            "coorg": "https://www.youtube.com/watch?v=uLc1QR3ofYQ",
            "gokarna": "https://www.youtube.com/watch?v=7DF3LBAPeJY",
            "dandeli": "https://www.youtube.com/watch?v=Xxuc_i1-Ytc",
            "chikmagalur": "https://www.youtube.com/watch?v=l4nYZTanUeE",
            "munnar": "https://www.youtube.com/watch?v=ti39UJYgc5s",
            "hampi": "https://www.youtube.com/watch?v=ne4xe-NWcNQ",
            "ooty": "https://www.youtube.com/watch?v=DZQPhfKbWc0",
            "wayanad": "https://www.youtube.com/watch?v=l4TelPR_Mzg",
            "goa": "https://www.youtube.com/watch?v=cBbS8Pi0obo",
            "manali": "https://www.youtube.com/watch?v=o4bsfOUxJKU",
            "kashmir": "https://www.youtube.com/watch?v=MHZpkHqB-U0",
            "ladakh": "https://www.youtube.com/watch?v=G7a_tPbcELY",
            "meghalaya": "https://www.youtube.com/watch?v=CsBmy8oJiLM",
            "darjeeling": "https://www.youtube.com/watch?v=XYwP-QndGG0",
            "lonavala": "https://www.youtube.com/watch?v=dw0LwI3HHRA",
            "pondicherry": "https://www.youtube.com/watch?v=c4Nx7hCxOv8",
            "kerala": "https://www.youtube.com/watch?v=ti39UJYgc5s",
            "south-india": "https://www.youtube.com/watch?v=7DF3LBAPeJY",
        }.get(d_slug, "")
        dest, _ = Destination.objects.update_or_create(
            name=d_name,
            defaults={
                "slug": d_slug,
                "subtitle": d_info["subtitle"],
                "description": d_info["desc"],
                "cover_image": d_info["cover"],
                "hero_image": d_info["hero"],
                "video_url": yt_v,
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
