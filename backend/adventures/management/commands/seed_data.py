import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from adventures.models import (
    Destination, Category, Trip, TripImage, TripVideo, 
    TripItinerary, FAQ, Enquiry, Review, GalleryImage, BlogPost
)

User = get_user_model()

DESTINATION_YOUTUBE_MAP = {
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

class Command(BaseCommand):
    help = 'Seeds complete adventure data including South India and Himalayas with local video clips'

    def add_arguments(self, parser):
        parser.add_argument(
            "--force", action="store_true",
            help="Wipe existing trips/destinations/categories and reseed (destroys owner-made packages).",
        )

    def handle(self, *args, **options):
        # Safety: never wipe a live database by accident (this runs from start scripts)
        if Trip.objects.exists() and not options.get("force"):
            self.stdout.write(self.style.SUCCESS("Database already has trips; skipping demo seed (use --force to reseed)."))
            return
        self.stdout.write(self.style.WARNING("Flushing old data..."))
        Trip.objects.all().delete()
        Destination.objects.all().delete()
        Category.objects.all().delete()

        self.stdout.write(self.style.SUCCESS("Creating categories..."))
        cat_treks = Category.objects.create(name="Treks", slug="treks", icon="Mountain", description="Summit trails and mountain ridges.", ordering=1)
        cat_camping = Category.objects.create(name="Camping", slug="camping", icon="Tent", description="Overnight stargazing and cozy alpine camps.", ordering=2)
        cat_water = Category.objects.create(name="Water Sports", slug="water", icon="Waves", description="River rafting, waterfalls, and coastal beach treks.", ordering=3)
        cat_snow = Category.objects.create(name="Snow", slug="snow", icon="Snowflake", description="Winter wonderland treks and snow summits.", ordering=4)
        cat_weekend = Category.objects.create(name="Weekend Getaways", slug="weekend", icon="Sun", description="Quick 2-3 day getaways into nature.", ordering=5)
        cat_group = Category.objects.create(name="Group Trips", slug="group-trips", icon="Users", description="Curated small-group journeys with expert leaders.", ordering=6)

        self.stdout.write(self.style.SUCCESS("Creating destinations..."))
        dest_uk = Destination.objects.create(
            name="Uttarakhand",
            slug="uttarakhand",
            subtitle="Land of the Sacred High Himalayas",
            description="From snow-capped Garhwal peaks to ancient pine forests and sacred rivers.",
            cover_image="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
            hero_image="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80",
            is_featured=True,
            ordering=1
        )
        dest_ladakh = Destination.objects.create(
            name="Ladakh",
            slug="ladakh",
            subtitle="The High Altitude Trans-Himalayan Moonland",
            description="A cold desert kingdom of azure lakes, ancient monasteries, and world's highest motorable passes.",
            cover_image="https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80",
            hero_image="https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1920&q=80",
            is_featured=True,
            ordering=2
        )
        dest_hp = Destination.objects.create(
            name="Himachal Pradesh",
            slug="himachal",
            subtitle="Valley of the Gods & Alpine Passes",
            description="Dramatic transitions from lush cedar valleys to stark high-altitude passes of Hampta and Spiti.",
            cover_image="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
            hero_image="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80",
            is_featured=True,
            ordering=3
        )
        dest_kashmir = Destination.objects.create(
            name="Kashmir",
            slug="kashmir",
            subtitle="Paradise on Earth & Alpine Lakes",
            description="Turquoise high-altitude alpine lakes and emerald meadows bordered by sharp peaks.",
            cover_image="https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80",
            hero_image="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=80",
            is_featured=True,
            ordering=4
        )
        dest_gokarna = Destination.objects.create(
            name="Gokarna",
            slug="gokarna",
            subtitle="Golden Cliffs & Arabian Sea Coastal Headlands",
            description="Pristine golden beach coves, rocky cliff trails, and bioluminescent ocean stargazing in Karnataka.",
            cover_image="https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341326/spirit_adventures/shorts/gokarna_beach_poster.jpg",
            hero_image="https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341326/spirit_adventures/shorts/gokarna_beach_poster.jpg",
            is_featured=True,
            ordering=5
        )
        dest_dandeli = Destination.objects.create(
            name="Dandeli",
            slug="dandeli",
            subtitle="Kali River White Water Rafting & Dense Rainforests",
            description="Exhilarating Grade 3 white water rafting, jungle kayaking, and hornbill reserve safaris in Western Ghats.",
            cover_image="https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341325/spirit_adventures/shorts/dandeli_rafting_poster.jpg",
            hero_image="https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341325/spirit_adventures/shorts/dandeli_rafting_poster.jpg",
            is_featured=True,
            ordering=6
        )
        dest_coorg = Destination.objects.create(
            name="Coorg",
            slug="coorg",
            subtitle="Scotland of India, Misty Peaks & Coffee Trails",
            description="Rolling emerald shola hills, aromatic coffee plantations, and the high Tadiandamol summit.",
            cover_image="https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341327/spirit_adventures/shorts/coorg_mist_poster.jpg",
            hero_image="https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341327/spirit_adventures/shorts/coorg_mist_poster.jpg",
            is_featured=True,
            ordering=7
        )
        dest_chikmagalur = Destination.objects.create(
            name="Chikmagalur",
            slug="chikmagalur",
            subtitle="Mullayanagiri Peak & Sea of Clouds",
            description="Karnataka's highest mountain peak, misty ridge walks, and roaring waterfalls.",
            cover_image="https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341328/spirit_adventures/shorts/chikmagalur_peak_poster.jpg",
            hero_image="https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341328/spirit_adventures/shorts/chikmagalur_peak_poster.jpg",
            is_featured=True,
            ordering=8
        )
        dest_ooty = Destination.objects.create(
            name="Ooty",
            slug="ooty",
            subtitle="Queen of Nilgiri Hills & Pine Sanctuaries",
            description="Heritage toy trains, dense pine forests, and quiet alpine lake trails in the Nilgiris.",
            cover_image="https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341329/spirit_adventures/shorts/ooty_train_poster.jpg",
            hero_image="https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341329/spirit_adventures/shorts/ooty_train_poster.jpg",
            is_featured=True,
            ordering=9
        )
        dest_wayanad = Destination.objects.create(
            name="Wayanad",
            slug="wayanad",
            subtitle="Chembra Heart Lake & Cascading Waterfalls",
            description="Ancient caves, misty rainforest peaks, and sacred heart-shaped alpine lakes in Kerala.",
            cover_image="https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341330/spirit_adventures/shorts/wayanad_waterfall_poster.jpg",
            hero_image="https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341330/spirit_adventures/shorts/wayanad_waterfall_poster.jpg",
            is_featured=True,
            ordering=10
        )

        self.stdout.write(self.style.SUCCESS("Creating South India and Himalayan Trips..."))

        # Trip 1: Dandeli River Rafting
        t_dandeli = Trip.objects.create(
            title="Dandeli Kali River White Water Rafting & Jungle Expedition",
            slug="dandeli-river-rafting-jungle-expedition",
            destination=dest_dandeli,
            category=cat_water,
            short_description="Experience thrilling Grade 3 white water rapids on the roaring Kali River with jungle kayaking and rainforest riverside camps.",
            full_description="Dandeli is the adventure capital of South India. Conquer 9 km of thrilling Grade 3 rapids on the turbulent Kali River, glide through quiet backwaters in adventure kayaks, take a dip in natural jacuzzi rapids, and spend nights by a jungle bonfire in riverside wooden cottages.",
            duration_days=2,
            duration_nights=1,
            difficulty="MODERATE",
            price=3999.00,
            original_price=5499.00,
            pickup_location="Hubli Railway Station / Dandeli Bus Stand (8:00 AM)",
            drop_location="Hubli Railway Station / Dandeli Bus Stand (6:00 PM)",
            altitude="1,550 ft Western Ghats",
            trek_distance="9 km river rafting + 5 km jungle trek",
            best_season="September to June",
            cover_image="https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341325/spirit_adventures/shorts/dandeli_rafting_poster.jpg",
            hero_video_url="https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341176/spirit_adventures/shorts/dandeli_rafting.mp4",
            inclusions=["9 km White Water Rafting with certified IRF guides", "Kayaking, Coracle Ride & Natural Jacuzzi Bath", "Riverside eco-cottage stay", "All meals: 1 Breakfast, 2 Lunches, 1 Dinner (buffet)", "Life jackets, helmets and safety briefing"],
            exclusions=["Personal transportation to Hubli/Dandeli", "Personal snacks & cold drinks"],
            things_to_carry=["Quick-dry synthetic clothing", "Water shoes or strapped sandals", "Extra change of dry clothes", "Waterproof mobile pouch"],
            is_featured=True,
            is_bestseller=True,
            is_published=True,
            ordering=1
        )
        TripItinerary.objects.create(trip=t_dandeli, day_number=1, title="Arrival, Kali River Rafting & Sunset Kayaking", description="Check into riverside camp. Gear up with safety equipment for the 9 km Grade 3 Kali River rafting run. Afternoon kayaking and coracle ride. Night campfire.", altitude="1,550 ft", distance="9 km river run", meals="Lunch, Dinner", stay_type="Riverside Eco Resort")
        TripItinerary.objects.create(trip=t_dandeli, day_number=2, title="Syntheri Rocks Jungle Trek & Natural Jacuzzi", description="Morning guided nature walk to Syntheri Rocks granite monolith. Relax in natural jacuzzi rapids on the Kali. Departure by evening.", altitude="1,600 ft", distance="5 km nature trek", meals="Breakfast, Lunch", stay_type="Departure")

        # Trip 2: Gokarna Beach Trek
        t_gokarna = Trip.objects.create(
            title="Gokarna 5-Beach Cliff Trek & Ocean Stargazing",
            slug="gokarna-beach-cliff-trek",
            destination=dest_gokarna,
            category=cat_water,
            short_description="Trek along coastal cliffs traversing Belekan, Paradise, Half Moon, Om and Kudle beaches with cliffside camping.",
            full_description="Where the Western Ghats cascade directly into the Arabian Sea. Hike rocky sea cliffs connecting 5 untouched golden beaches, spot playful dolphins from scenic vantage points, and camp under the open starry sky with the sound of ocean waves.",
            duration_days=3,
            duration_nights=2,
            difficulty="EASY",
            price=4299.00,
            original_price=5499.00,
            pickup_location="Gokarna Road Railway Station (7:30 AM)",
            drop_location="Gokarna Road Railway Station (5:00 PM)",
            altitude="Sea level to 450 ft headlands",
            trek_distance="14 km coastal cliff trail",
            best_season="October to April",
            cover_image="https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341326/spirit_adventures/shorts/gokarna_beach_poster.jpg",
            hero_video_url="https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341208/spirit_adventures/shorts/gokarna_beach.mp4",
            inclusions=["Beachfront & cliffside alpine tent stay", "All meals: 2 Breakfasts, 2 Lunches, 2 Dinners", "Certified trek leader & local coastal guide", "Campfire & beach games"],
            exclusions=["Personal cafe visits", "Water sports (scuba/parasailing)"],
            things_to_carry=["Comfortable light cotton clothing", "Trail walking shoes and flip flops", "Swimwear & beach towel", "Sunscreen & hat"],
            is_featured=True,
            is_bestseller=True,
            is_published=True,
            ordering=2
        )

        # Trip 3: Coorg Tadiandamol & Coffee Trail
        t_coorg = Trip.objects.create(
            title="Coorg Tadiandamol Summit & Misty Coffee Trail",
            slug="coorg-tadiandamol-coffee-trail",
            destination=dest_coorg,
            category=cat_treks,
            short_description="Ascend to the highest summit in Coorg (5,735 ft) through dense shola forests, aromatic coffee plantations and Chelavara waterfalls.",
            full_description="Climb through rolling green shola grasslands to stand on Tadiandamol, the highest peak in Kodagu. Breathe in fresh coffee-blossom scented air, walk under misty canopies, and experience authentic Kodava hospitality.",
            duration_days=2,
            duration_nights=1,
            difficulty="MODERATE",
            price=3499.00,
            original_price=4899.00,
            pickup_location="Mysore Railway Station / Madikeri (6:30 AM)",
            drop_location="Mysore Railway Station / Madikeri (7:30 PM)",
            altitude="5,735 ft / 1,748 m",
            trek_distance="12 km round trip",
            best_season="September to March",
            cover_image="https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341327/spirit_adventures/shorts/coorg_mist_poster.jpg",
            hero_video_url="https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341227/spirit_adventures/shorts/coorg_mist.mp4",
            inclusions=["Heritage Kodava homestay with plantation view", "Authentic traditional Coorg cuisine (Veg & Non-Veg)", "Forest entry permits & local guide", "Guided coffee & spice plantation walk"],
            exclusions=["Personal transport to Mysore/Madikeri"],
            things_to_carry=["Trekking shoes with solid grip", "Rain jacket / poncho", "Refillable water bottle", "Warm fleece for evening"],
            is_featured=True,
            is_bestseller=False,
            is_published=True,
            ordering=3
        )

        # Trip 4: Chikmagalur Mullayanagiri Ridge Trek
        t_chikmagalur = Trip.objects.create(
            title="Chikmagalur Mullayanagiri Peak & Baba Budangiri Ridge",
            slug="chikmagalur-mullayanagiri-ridge-trek",
            destination=dest_chikmagalur,
            category=cat_treks,
            short_description="Trek along the serpentine ridge of Mullayanagiri (6,330 ft), the highest peak in Karnataka, above an infinite ocean of morning clouds.",
            full_description="Stand above the clouds at Mullayanagiri (6,330 ft), explore the jagged knife-edge Baba Budangiri ridge trail, and take a refreshing dip at Hebbe Waterfalls hidden inside coffee estates.",
            duration_days=2,
            duration_nights=1,
            difficulty="MODERATE",
            price=3799.00,
            original_price=4999.00,
            pickup_location="Chikmagalur KSRTC Bus Stand / Kadur (7:00 AM)",
            drop_location="Chikmagalur KSRTC Bus Stand / Kadur (7:00 PM)",
            altitude="6,330 ft / 1,930 m",
            trek_distance="14 km ridge walk",
            best_season="September to April",
            cover_image="https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341328/spirit_adventures/shorts/chikmagalur_peak_poster.jpg",
            hero_video_url="https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341233/spirit_adventures/shorts/chikmagalur_peak.mp4",
            inclusions=["Estate hilltop homestay with bonfire", "All local meals and hot estate coffee", "Mullayanagiri & Z-Point guided trek", "Forest permits and Jeep transfers"],
            exclusions=["Personal expenses"],
            things_to_carry=["Grip shoes", "Windbreaker jacket", "Camera"],
            is_featured=True,
            is_bestseller=True,
            is_published=True,
            ordering=4
        )

        # Trip 5: Ooty Nilgiris Mountain Pine Expedition
        t_ooty = Trip.objects.create(
            title="Ooty Nilgiri Pine Forest & Avalanche Lake Trail",
            slug="ooty-nilgiri-pine-forest-expedition",
            destination=dest_ooty,
            category=cat_group,
            short_description="Ride the historic UNESCO Nilgiri Toy Train, trek through towering pine sanctuaries, and camp beside pristine Avalanche Lake.",
            full_description="Step into the timeless blue mountains of the Nilgiris. Journey through dense pine and eucalyptus forests, witness emerald tea slopes, and explore secluded valleys around Avalanche Sanctuary.",
            duration_days=3,
            duration_nights=2,
            difficulty="EASY",
            price=5999.00,
            original_price=7499.00,
            pickup_location="Coimbatore Junction Railway Station (7:00 AM)",
            drop_location="Coimbatore Junction Railway Station (6:00 PM)",
            altitude="7,200 ft Nilgiris",
            trek_distance="16 km nature trails",
            best_season="All year round",
            cover_image="https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341329/spirit_adventures/shorts/ooty_train_poster.jpg",
            hero_video_url="https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341289/spirit_adventures/shorts/ooty_train.mp4",
            inclusions=["Heritage colonial cottage / lakeside tents", "All meals during the expedition", "Avalanche Sanctuary entry permits", "Heritage Nilgiri mountain railway experience"],
            exclusions=["Flights / trains to Coimbatore"],
            things_to_carry=["Warm jacket and layers", "Sturdy walking shoes", "Sun protection"],
            is_featured=True,
            is_bestseller=False,
            is_published=True,
            ordering=5
        )

        # Trip 6: Wayanad Chembra Peak & Waterfall Trail
        t_wayanad = Trip.objects.create(
            title="Wayanad Chembra Peak Heart Lake & Waterfall Trail",
            slug="wayanad-chembra-peak-waterfall-trail",
            destination=dest_wayanad,
            category=cat_treks,
            short_description="Trek to the legendary heart-shaped love lake perched at 6,890 ft with misty bamboo rafting and cascading Meenmutty waterfalls.",
            full_description="Venture into Kerala's lush green heart. Trek up to Chembra Peak to witness the mystical naturally heart-shaped lake that never dries up, hike along tea trails, and relax by thundering jungle cascades.",
            duration_days=3,
            duration_nights=2,
            difficulty="MODERATE",
            price=4999.00,
            original_price=6499.00,
            pickup_location="Kozhikode (Calicut) Railway Station (7:00 AM)",
            drop_location="Kozhikode (Calicut) Railway Station (6:30 PM)",
            altitude="6,890 ft / 2,100 m",
            trek_distance="15 km total trails",
            best_season="October to May",
            cover_image="https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341330/spirit_adventures/shorts/wayanad_waterfall_poster.jpg",
            hero_video_url="https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341310/spirit_adventures/shorts/wayanad_waterfall.mp4",
            inclusions=["Treehouse / rainforest eco-stay", "Kerala traditional meals", "Chembra peak forest guide and entry passes", "Bamboo rafting on Banasura lake"],
            exclusions=["Personal transport to Calicut"],
            things_to_carry=["Trekking shoes", "Rain protection", "Quick dry garments"],
            is_featured=True,
            is_bestseller=True,
            is_published=True,
            ordering=6
        )

        # Trip 7: Leh Ladakh Bike Odyssey
        t_ladakh = Trip.objects.create(
            title="Leh Ladakh Ultimate Motorcycle Odyssey",
            slug="leh-ladakh-motorcycle-odyssey",
            destination=dest_ladakh,
            category=cat_group,
            short_description="The ultimate 10-day Himalayan ride crossing Khardung La, Pangong Tso, Nubra Valley sand dunes and Umling La on Royal Enfield Himalayans.",
            full_description="Ride the highest motorable roads in the world on Royal Enfield Himalayan 450cc motorcycles with backup truck, mechanic, and oxygen support.",
            duration_days=10,
            duration_nights=9,
            difficulty="CHALLENGING",
            price=32999.00,
            original_price=38999.00,
            pickup_location="Leh Airport (IXL)",
            drop_location="Leh Airport (IXL)",
            altitude="17,982 ft (Khardung La)",
            trek_distance="1,200 km circuit ride",
            best_season="May to October",
            cover_image="https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80",
            hero_video_url="https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341157/spirit_adventures/hero/ladakh_bike.mp4",
            inclusions=["Royal Enfield Himalayan 450cc with fuel", "Protective riding gear & backup mechanic truck", "Oxygen cylinders & medical kit", "Boutique hotel and luxury swiss tents"],
            exclusions=["Airfare to Leh", "Security deposit for bike"],
            things_to_carry=["Valid Driving License", "Riding boots & warm thermal layers", "GoPro / action camera"],
            is_featured=True,
            is_bestseller=True,
            is_published=True,
            ordering=7
        )

        # Trip 8: Kedarkantha Winter Summit Trek
        t_kedarkantha = Trip.objects.create(
            title="Kedarkantha Winter Summit Trek",
            slug="kedarkantha-trek",
            destination=dest_uk,
            category=cat_snow,
            short_description="Classic Himalayan winter summit through fairy-tale pine forests to a 360° panoramic sunrise peak.",
            full_description="Kedarkantha rises to 12,500 ft through dense pine forests with snow trails to a breathtaking 360-degree panorama.",
            duration_days=5,
            duration_nights=4,
            difficulty="MODERATE",
            price=8499.00,
            original_price=10999.00,
            pickup_location="Dehradun Railway Station (6:30 AM)",
            drop_location="Dehradun Railway Station (7:00 PM)",
            altitude="12,500 ft / 3,810 m",
            trek_distance="20 km total",
            best_season="December to April",
            cover_image="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
            hero_video_url="https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341160/spirit_adventures/hero/mountain_trek.mp4",
            inclusions=["Nutritious vegetarian meals", "Alpine tents & sleeping bags", "Certified trek leaders", "Microspikes and gaiters"],
            exclusions=["Transport Dehradun to Sankri"],
            things_to_carry=["Trekking shoes", "Down jacket (-5°C)", "Thermal layers"],
            is_featured=True,
            is_bestseller=True,
            is_published=True,
            ordering=8
        )

        self.stdout.write(self.style.SUCCESS("Creating authentic Google verified reviews from spiritadventures.in..."))
        reviews_data = [
            ("Kottana Mounika", "Hyderabad, Telangana", t_coorg, "I recently went on an Ooty and Coonoor trip with Spirit Adventures, and it was a wonderful experience from start to finish. The trip was well-organized, and all the locations covered were beautiful and worth visiting. A special thanks to our tour guide, Aditya, who was extremely friendly, supportive, and approachable throughout the journey. He ensured everyone in the group was comfortable and made the trip enjoyable."),
            ("CH Sunil", "Hyderabad, Telangana", t_gokarna, "Ooty is one of the most peaceful hill stations in South India. Travelers usually love the cool weather, greenery, and calm vibe. It’s a perfect break from city heat, especially in summer. And especially my guide Sathvik helped me a lot in this journey."),
            ("Gopi Reddy", "Hyderabad, Telangana", t_coorg, "Had an amazing trip to Ooty and Coonoor with our guide Aditya! He was very friendly, well-organized, and made the entire journey smooth and enjoyable. He explained every place clearly, managed trip timings perfectly, and ensured everyone was comfortable throughout the tour. Highly recommended!"),
            ("Panduga Srikanth Reddy", "Hyderabad, Telangana", t_chikmagalur, "We had a wonderful Ooty and Coonoor trip, and special thanks to our guide Aditya for making it so memorable. He was very supportive, friendly, and managed everything professionally throughout the journey. The trip was well-planned, comfortable, and enjoyable because of his coordination and guidance."),
            ("Charan Tej Begari", "Secunderabad, Telangana", t_gokarna, "We had a good experience with spirit adventure club. Our Trip Guide was Sathwik and he covered all the locations mentioned. The stay and food was very good and also a very good experience at Gokarna beach beside stay."),
            ("Raparthi Srinivas", "Hyderabad, Telangana", t_ooty, "It was great experience on Holiday tour with family. We selected package Ooty and Isha with personal cab, budget friendly, on-time travel with good stay accommodation and safe journey on hill station ride under guidance of Mr. Sathwik."),
            ("Avinash Bollaram", "Hyderabad, Telangana", t_chikmagalur, "Had a fun experience at Coorg and Chikmagalur. We went with our family and everything went smoothly with the help of Spirit Adventures. Our trip guide Sathvik took good care of us. Great Hospitality and service. Thank you Spirit Adventures."),
            ("Shahid Ali", "Hyderabad, Telangana", t_dandeli, "We had traveled recently with Spirit Adventures for Gokarna and Dandeli. Our Trip Guide was Sathwik, he was very friendly with us and covered all the places. The stay and food was very good, we enjoyed a lot at Dandeli stay with swimming pool and games. Gokarna beach side stay was very good.")
        ]
        for name, loc, trip_obj, text in reviews_data:
            Review.objects.create(
                trip=trip_obj,
                traveler_name=name,
                traveler_location=loc,
                rating=5,
                review_text=text,
                travel_date="2025",
                is_featured=True,
                is_approved=True
            )

        # Load Scraped Trips from Spirit Adventures Live Site if fixture exists
        fixture_path = os.path.join(os.path.dirname(__file__), "..", "..", "fixtures", "scraped_trips.json")
        if os.path.exists(fixture_path):
            self.stdout.write(self.style.SUCCESS("Importing scraped destination packages..."))
            try:
                import json, html, re
                from django.utils.text import slugify
                with open(fixture_path) as f:
                    scraped_trips = json.load(f)

                # Ensure couple-packages category
                cat_couple, _ = Category.objects.get_or_create(
                    slug="couple-packages",
                    defaults={"name": "Couple Packages", "icon": "Heart", "description": "Romantic curated getaways for couples."}
                )

                for idx, item in enumerate(scraped_trips):
                    t_title = html.unescape(item["title"]).replace("&amp;", "&").strip()
                    t_slug = item["slug"]
                    d_name = item["destination_name"]
                    
                    # Match or create destination
                    d_slug_key = slugify(d_name)
                    dest, _ = Destination.objects.get_or_create(
                        slug=d_slug_key,
                        defaults={
                            "name": d_name,
                            "subtitle": f"Scenic {d_name} Trails & Wilderness",
                            "description": f"Explore breathtaking nature trails, waterfalls, and scenic viewpoints in {d_name} with Spirit Adventures.",
                            "cover_image": item.get("cover_image", "").replace("http://", "https://") or "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80",
                            "hero_image": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1920&q=80",
                            "video_url": DESTINATION_YOUTUBE_MAP.get(d_slug_key, ""),
                            "is_featured": True,
                            "is_published": True,
                        }
                    )

                    c_slug = item.get("category_slug", "weekend")
                    if "couple" in t_title.lower():
                        category = cat_couple
                    elif c_slug == "water":
                        category = cat_water
                    elif c_slug == "treks":
                        category = cat_treks
                    elif c_slug == "group-trips":
                        category = cat_group
                    else:
                        category = cat_weekend

                    price = float(item["price"])
                    if price < 2000 and item["duration_days"] >= 3:
                        price = 11000.0
                    orig_price = float(item.get("original_price") or round(price * 1.25))

                    trip, _ = Trip.objects.update_or_create(
                        slug=t_slug,
                        defaults={
                            "title": t_title,
                            "destination": dest,
                            "category": category,
                            "short_description": item.get("short_description", f"Curated adventure through {d_name}.")[:300],
                            "full_description": item.get("full_description", f"Join Spirit Adventures in {d_name}."),
                            "duration_days": item["duration_days"],
                            "duration_nights": item["duration_nights"],
                            "difficulty": item.get("difficulty", "MODERATE"),
                            "price": price,
                            "original_price": orig_price,
                            "cover_image": item.get("cover_image", "").replace("http://", "https://") or dest.cover_image,
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
                            "ordering": 50 + idx
                        }
                    )

                    # Update itineraries if none exist
                    if not trip.itinerary_days.exists():
                        for raw_d in item.get("itinerary_days", []):
                            desc = html.unescape(raw_d.get("description", "")).strip()
                            day_title = html.unescape(raw_d.get("title", "")).strip()
                            if "Skip to content" in desc or "Hellip" in day_title or day_title.endswith('\" /'):
                                continue
                            TripItinerary.objects.create(
                                trip=trip,
                                day_number=raw_d.get("day_number", 1),
                                title=day_title,
                                description=desc or f"Adventure through {dest.name}.",
                                meals="Breakfast & Dinner included",
                                stay_type="Scenic Homestay / Nature Resort",
                                ordering=raw_d.get("day_number", 1)
                            )
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"Could not load scraped trips fixture: {e}"))

        self.stdout.write(self.style.SUCCESS("Successfully seeded rich South India & Himalayan adventure data!"))
