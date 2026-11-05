import os
import sys

# Setup Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "spirit_backend.settings")
import django
django.setup()

from adventures.models import Destination

DESTINATION_YOUTUBE_VIDEOS = {
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
    "uttarakhand": "https://www.youtube.com/watch?v=xssNu8NOO1A",
    "himachal": "https://www.youtube.com/watch?v=o4bsfOUxJKU",
    "darjeeling": "https://www.youtube.com/watch?v=XYwP-QndGG0",
    "lonavala": "https://www.youtube.com/watch?v=dw0LwI3HHRA",
    "pondicherry": "https://www.youtube.com/watch?v=c4Nx7hCxOv8",
    "kerala": "https://www.youtube.com/watch?v=ti39UJYgc5s",
    "south-india": "https://www.youtube.com/watch?v=7DF3LBAPeJY",
    "karnataka": "https://www.youtube.com/watch?v=uLc1QR3ofYQ",
}

def main():
    print("🎬 Updating Destination 4K/HD YouTube Videos...")
    count = 0
    for d in Destination.objects.all():
        slug = d.slug.lower()
        yt_url = DESTINATION_YOUTUBE_VIDEOS.get(slug)
        if not yt_url:
            # check substring match
            for k, v in DESTINATION_YOUTUBE_VIDEOS.items():
                if k in slug or slug in k:
                    yt_url = v
                    break
        if yt_url:
            d.video_url = yt_url
            d.save(update_fields=["video_url"])
            count += 1
            print(f"  ✅ {d.name} ({d.slug}) -> {yt_url}")
        else:
            print(f"  ⚠️ No video assigned for {d.name} ({d.slug})")

    print(f"\n🎉 Successfully updated {count} destinations with HD YouTube video tours!")

if __name__ == "__main__":
    main()
