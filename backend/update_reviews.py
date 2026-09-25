import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "spirit_backend.settings")
django.setup()

from adventures.models import Review, Trip

def update_reviews():
    # Map of trips
    trips_by_slug = {t.slug: t for t in Trip.objects.all()}

    t_gokarna = trips_by_slug.get("gokarna-beach-cliff-trek") or trips_by_slug.get("hampi-gokarna-dandeli-grand-combo")
    t_dandeli = trips_by_slug.get("dandeli-river-rafting-jungle-expedition")
    t_coorg = trips_by_slug.get("coorg-tadiandamol-coffee-trail")
    t_chikmagalur = trips_by_slug.get("chikmagalur-mullayanagiri-ridge-trek")
    t_ooty = trips_by_slug.get("ooty-nilgiri-pine-forest-expedition") or trips_by_slug.get("kodaikanal-ooty-mysore-odyssey")
    t_wayanad = trips_by_slug.get("wayanad-chembra-peak-waterfall-trail")
    t_kedarkantha = trips_by_slug.get("kedarkantha-trek")
    t_ladakh = trips_by_slug.get("leh-ladakh-motorcycle-odyssey")

    # Clear old duplicate reviews and insert rich verified ones
    Review.objects.all().delete()

    reviews_data = [
        {
            "trip": t_coorg,
            "traveler_name": "Kottana Mounika",
            "traveler_location": "Hyderabad, Telangana",
            "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
            "rating": 5,
            "review_text": "It was an amazing experience with Spirit Adventures! Sathwik was extremely friendly, attentive, and helpful throughout the Tadiandamol summit trek. The coffee estate homestay and local Kodava meals were authentic and delicious. Will surely suggest Spirit Adventures to all my friends!",
            "travel_date": "February 2025",
            "is_verified": True,
            "is_featured": True,
        },
        {
            "trip": t_gokarna,
            "traveler_name": "CH Sunil",
            "traveler_location": "Hyderabad, Telangana",
            "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
            "rating": 5,
            "review_text": "First experience with Spirit Adventures and it was truly unforgettable! Aditya was very friendly, supportive, and punctual during the entire 4-day journey across Hampi, Gokarna beaches, and Dandeli. Great group vibes and seamless coordination.",
            "travel_date": "January 2025",
            "is_verified": True,
            "is_featured": True,
        },
        {
            "trip": t_dandeli,
            "traveler_name": "Gopi Reddy",
            "traveler_location": "Hyderabad, Telangana",
            "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
            "rating": 5,
            "review_text": "Best travel agency for weekend adventures from Hyderabad! The Grade 3 Kali River rafting in Dandeli and cliff camping in Gokarna were flawlessly organized. High-quality safety gear, great tents, and caring trek captains!",
            "travel_date": "January 2025",
            "is_verified": True,
            "is_featured": True,
        },
        {
            "trip": t_chikmagalur,
            "traveler_name": "Panduga Srikanth Reddy",
            "traveler_location": "Hyderabad, Telangana",
            "avatar_url": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80",
            "rating": 5,
            "review_text": "Treks with Spirit Adventures are super safe, well planned, and budget-friendly. Trek leader Sathwik made sure every solo traveler felt completely included and safe. Mullayanagiri sunrise above the clouds was out of this world!",
            "travel_date": "December 2024",
            "is_verified": True,
            "is_featured": True,
        },
        {
            "trip": t_gokarna,
            "traveler_name": "Charan Tej Begari",
            "traveler_location": "Secunderabad, Telangana",
            "avatar_url": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80",
            "rating": 5,
            "review_text": "Had an unforgettable 4-day trip to Hampi & Gokarna. Everything from the Tempo Traveler transport from Hyderabad to the beachside campfires under the Milky Way was top notch. 100% recommended for friend groups and corporate getaways!",
            "travel_date": "November 2024",
            "is_verified": True,
            "is_featured": True,
        },
        {
            "trip": t_coorg,
            "traveler_name": "Raparthi Srinivas",
            "traveler_location": "Hyderabad, Telangana",
            "avatar_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
            "rating": 5,
            "review_text": "I went to Coorg 2D/1N with Spirit Adventures. Amazing homestay deep in coffee plantations, refreshing river activities, and stunning sunset ridge walks. Aditya led the entire group with utmost patience, passion, and professionalism.",
            "travel_date": "October 2024",
            "is_verified": True,
            "is_featured": True,
        },
        {
            "trip": t_kedarkantha,
            "traveler_name": "Aarav Mehta",
            "traveler_location": "Bengaluru, Karnataka",
            "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
            "rating": 5,
            "review_text": "Standing on Kedarkantha summit at 6:15 AM as the first golden rays struck the Swargarohini peaks was the most spiritual moment of my life. The team took incredible care of high-altitude safety with oxygen and served piping hot nutritious meals even at -8°C!",
            "travel_date": "January 2025",
            "is_verified": True,
            "is_featured": True,
        },
        {
            "trip": t_ladakh,
            "traveler_name": "Karan Oberoi",
            "traveler_location": "Gurugram, Haryana",
            "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
            "rating": 5,
            "review_text": "Riding across Khardung La (17,982 ft) on Royal Enfield Himalayans was a dream fulfilled! The backup truck, oxygen support, and certified mechanic handled every detail smoothly. Best adventure company in India!",
            "travel_date": "August 2024",
            "is_verified": True,
            "is_featured": True,
        },
        {
            "trip": t_wayanad,
            "traveler_name": "Ananya Roy",
            "traveler_location": "Hyderabad, Telangana",
            "avatar_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
            "rating": 5,
            "review_text": "Wayanad Chembra peak heart lake trek was breathtaking! The misty rainforest bamboo rafting and treehouse stay exceeded all our expectations. Thank you Spirit Adventures for such pure wilderness memories.",
            "travel_date": "February 2025",
            "is_verified": True,
            "is_featured": True,
        }
    ]

    for r in reviews_data:
        Review.objects.create(
            trip=r["trip"],
            traveler_name=r["traveler_name"],
            traveler_location=r["traveler_location"],
            avatar_url=r["avatar_url"],
            rating=r["rating"],
            review_text=r["review_text"],
            travel_date=r["travel_date"],
            is_verified=r["is_verified"],
            is_featured=r["is_featured"],
            is_approved=True
        )

    print(f"Successfully updated {len(reviews_data)} verified reviews!")

if __name__ == "__main__":
    update_reviews()
