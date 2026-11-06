import json
import re

with open("scripts/full_scraped_trips.json") as f:
    trips = json.load(f)

print(f"Loaded {len(trips)} trips from full_scraped_trips.json")

# Clean day title duplication
for trip in trips:
    for d in trip.get("itinerary_days", []):
        t = d.get("title", "")
        # Remove repeated "Day 1: Day 1:" or "Day 1: DAY 1 –"
        t = re.sub(r"^Day\s*(\d+)[\s:\-–]+(?:DAY\s*\1[\s:\-–]+)+", r"Day \1: ", t, flags=re.I)
        t = re.sub(r"^Day\s*(\d+)[\s:\-–]+", r"Day \1: ", t, flags=re.I)
        d["title"] = t.strip()

# Save cleaned json back
with open("scripts/full_scraped_trips.json", "w") as f:
    json.dump(trips, f, indent=2)

ts_output = """import { Trip } from "./types";

export const FALLBACK_TRIPS: Trip[] = [
"""

for i, t in enumerate(trips):
    t_id = i + 1
    title = t["title"].replace('"', '\\"')
    slug = t["slug"]
    dest_name = t["destination_name"].replace('"', '\\"')
    dest_slug = t["destination_slug"]
    cat_slug = t["category_slug"]
    
    cat_name = "Weekend Getaways"
    if cat_slug == "treks":
        cat_name = "Treks"
    elif cat_slug == "water":
        cat_name = "Water Sports"
    elif cat_slug == "couples":
        cat_name = "Couple Packages"
    elif cat_slug == "long-weekend":
        cat_name = "Group Trips"
        
    short_desc = t["short_description"].replace('"', '\\"')
    full_desc = t["full_description"].replace('"', '\\"')
    days = t["duration_days"]
    nights = t["duration_nights"]
    dur_label = f"{days}D / {nights}N"
    diff = t["difficulty"]
    price = int(t["price"])
    orig_price = int(t["original_price"])
    cover = t["cover_image"]
    
    inclusions_json = json.dumps(t["inclusions"], indent=6)
    exclusions_json = json.dumps(t["exclusions"], indent=6)
    
    gallery_images = []
    for g_idx, g_url in enumerate(t.get("gallery_images", [cover])):
        gallery_images.append({
            "id": g_idx + 1,
            "image_url": g_url,
            "caption": f"{dest_name} Highlight",
            "ordering": g_idx + 1,
            "is_cover": g_idx == 0
        })
    gallery_json = json.dumps(gallery_images, indent=6)
    
    itineraries = []
    for d_idx, d in enumerate(t.get("itinerary_days", [])):
        itineraries.append({
            "id": d_idx + 1,
            "day_number": d.get("day_number", d_idx + 1),
            "title": d.get("title", f"Day {d_idx + 1}: {dest_name} Exploration"),
            "description": d.get("description", ""),
            "meals": "Breakfast & Dinner included" if d_idx > 0 else "Welcome Refreshment & Dinner",
            "stay_type": "Scenic Homestay / Nature Resort" if "couple" in slug else "Adventure Campsite / Shared Homestay"
        })
    itinerary_json = json.dumps(itineraries, indent=6)
    
    ts_output += f"""  {{
    id: {t_id},
    title: "{title}",
    slug: "{slug}",
    destination_name: "{dest_name}",
    destination_slug: "{dest_slug}",
    category_name: "{cat_name}",
    category_slug: "{cat_slug}",
    short_description: "{short_desc}",
    full_description: "{full_desc}",
    duration_days: {days},
    duration_nights: {nights},
    duration_label: "{dur_label}",
    difficulty: "{diff}",
    price: {price},
    original_price: {orig_price},
    pickup_location: "Hyderabad / Bangalore / Chennai",
    drop_location: "Hyderabad / Bangalore / Chennai",
    cover_image: "{cover}",
    is_featured: {str(i < 6).lower()},
    is_bestseller: {str(i in [0, 1, 4, 6, 7, 8, 14, 23, 24, 31, 37]).lower()},
    rating: 4.9,
    reviews_count: {42 + (i * 7) % 55},
    inclusions: {inclusions_json},
    exclusions: {exclusions_json},
    things_to_carry: [
      "Backpack (40-60L) with rain cover",
      "Sturdy trekking/walking shoes with good grip",
      "Quick-dry t-shirts and track pants",
      "Warm layer / light jacket for evening",
      "Reusable water bottle & energy snacks",
      "Personal toiletries, medications & power bank",
      "Government ID proof (original)"
    ],
    gallery_images: {gallery_json},
    itinerary_days: {itinerary_json}
  }},
"""

ts_output += "];\n"

with open("frontend/src/lib/fallback-trips.ts", "w") as f:
    f.write(ts_output)

print("Generated frontend/src/lib/fallback-trips.ts successfully!")
