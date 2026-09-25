from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from adventures.models import (
    Destination, Category, Trip, TripImage, TripVideo, 
    TripItinerary, FAQ, Enquiry, Review, GalleryImage, BlogPost
)

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds complete adventure data including South India and Himalayas with local video clips'

    def handle(self, *args, **options):
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
            hero_image="/videos/hero/ladakh_bike_poster.jpg",
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
            cover_image="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
            hero_image="/videos/shorts/gokarna_beach_poster.jpg",
            is_featured=True,
            ordering=5
        )
        dest_dandeli = Destination.objects.create(
            name="Dandeli",
            slug="dandeli",
            subtitle="Kali River White Water Rafting & Dense Rainforests",
            description="Exhilarating Grade 3 white water rafting, jungle kayaking, and hornbill reserve safaris in Western Ghats.",
            cover_image="/videos/shorts/dandeli_rafting_poster.jpg",
            hero_image="/videos/shorts/dandeli_rafting_poster.jpg",
            is_featured=True,
            ordering=6
        )
        dest_coorg = Destination.objects.create(
            name="Coorg",
            slug="coorg",
            subtitle="Scotland of India, Misty Peaks & Coffee Trails",
            description="Rolling emerald shola hills, aromatic coffee plantations, and the high Tadiandamol summit.",
            cover_image="/videos/shorts/coorg_mist_poster.jpg",
            hero_image="/videos/shorts/coorg_mist_poster.jpg",
            is_featured=True,
            ordering=7
        )
        dest_chikmagalur = Destination.objects.create(
            name="Chikmagalur",
            slug="chikmagalur",
            subtitle="Mullayanagiri Peak & Sea of Clouds",
            description="Karnataka's highest mountain peak, misty ridge walks, and roaring waterfalls.",
            cover_image="/videos/shorts/chikmagalur_peak_poster.jpg",
            hero_image="/videos/shorts/chikmagalur_peak_poster.jpg",
            is_featured=True,
            ordering=8
        )
        dest_ooty = Destination.objects.create(
            name="Ooty",
            slug="ooty",
            subtitle="Queen of Nilgiri Hills & Pine Sanctuaries",
            description="Heritage toy trains, dense pine forests, and quiet alpine lake trails in the Nilgiris.",
            cover_image="/videos/shorts/ooty_train_poster.jpg",
            hero_image="/videos/shorts/ooty_train_poster.jpg",
            is_featured=True,
            ordering=9
        )
        dest_wayanad = Destination.objects.create(
            name="Wayanad",
            slug="wayanad",
            subtitle="Chembra Heart Lake & Cascading Waterfalls",
            description="Ancient caves, misty rainforest peaks, and sacred heart-shaped alpine lakes in Kerala.",
            cover_image="/videos/shorts/wayanad_waterfall_poster.jpg",
            hero_image="/videos/shorts/wayanad_waterfall_poster.jpg",
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
            cover_image="/videos/shorts/dandeli_rafting_poster.jpg",
            hero_video_url="/videos/shorts/dandeli_rafting.mp4",
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
            cover_image="/videos/shorts/gokarna_beach_poster.jpg",
            hero_video_url="/videos/shorts/gokarna_beach.mp4",
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
            cover_image="/videos/shorts/coorg_mist_poster.jpg",
            hero_video_url="/videos/shorts/coorg_mist.mp4",
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
            cover_image="/videos/shorts/chikmagalur_peak_poster.jpg",
            hero_video_url="/videos/shorts/chikmagalur_peak.mp4",
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
            cover_image="/videos/shorts/ooty_train_poster.jpg",
            hero_video_url="/videos/shorts/ooty_train.mp4",
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
            cover_image="/videos/shorts/wayanad_waterfall_poster.jpg",
            hero_video_url="/videos/shorts/wayanad_waterfall.mp4",
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
            cover_image="/videos/hero/ladakh_bike_poster.jpg",
            hero_video_url="/videos/hero/ladakh_bike.mp4",
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
            cover_image="/videos/hero/mountain_trek_poster.jpg",
            hero_video_url="/videos/hero/mountain_trek.mp4",
            inclusions=["Nutritious vegetarian meals", "Alpine tents & sleeping bags", "Certified trek leaders", "Microspikes and gaiters"],
            exclusions=["Transport Dehradun to Sankri"],
            things_to_carry=["Trekking shoes", "Down jacket (-5°C)", "Thermal layers"],
            is_featured=True,
            is_bestseller=True,
            is_published=True,
            ordering=8
        )

        self.stdout.write(self.style.SUCCESS("Creating reviews & enquiries..."))
        Review.objects.create(
            trip=t_dandeli,
            traveler_name="Kavya Nair",
            traveler_location="Bengaluru, Karnataka",
            rating=5,
            review_text="The Dandeli river rafting was beyond exhilarating! Our river guides were seasoned pros, and the lakeside camping at night was pure magic.",
            travel_date="March 2026",
            is_featured=True,
            is_approved=True
        )
        Review.objects.create(
            trip=t_gokarna,
            traveler_name="Arjun Varma",
            traveler_location="Hyderabad, Telangana",
            rating=5,
            review_text="Trekking along the Gokarna cliffs as the sun was setting into the Arabian Sea is a memory for life. Superbly organized by Spirit Adventures.",
            travel_date="February 2026",
            is_featured=True,
            is_approved=True
        )
        Review.objects.create(
            trip=t_coorg,
            traveler_name="Pooja Hegde",
            traveler_location="Chennai, Tamil Nadu",
            rating=5,
            review_text="Coorg misty hills and Tadiandamol summit walk was refreshingly peaceful. Authentic Kodava food and cozy homestay.",
            travel_date="January 2026",
            is_featured=True,
            is_approved=True
        )

        self.stdout.write(self.style.SUCCESS("Successfully seeded rich South India & Himalayan adventure data!"))
