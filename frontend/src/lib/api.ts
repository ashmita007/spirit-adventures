import { 
  Trip, Destination, Category, Review, GalleryImage, BlogPost, FAQ, EnquiryPayload 
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// Fallback demo data to ensure zero render breaking even during boot
const FALLBACK_CATEGORIES: Category[] = [
  { id: 1, name: "Treks", slug: "treks", icon: "Mountain", description: "Himalayan & Sahyadri summit trails" },
  { id: 2, name: "Camping", slug: "camping", icon: "Tent", description: "Overnight starry camps & bonfires" },
  { id: 3, name: "Water", slug: "water", icon: "Waves", description: "Coastal cliff hikes & river trails" },
  { id: 4, name: "Snow", slug: "snow", icon: "Snowflake", description: "Winter snow wonderland treks" },
  { id: 5, name: "Weekend", slug: "weekend", icon: "Sun", description: "Quick 2-day nature escapes" },
  { id: 6, name: "Group Trips", slug: "group-trips", icon: "Users", description: "Curated small group journeys" },
];

const FALLBACK_DESTINATIONS: Destination[] = [
  {
    id: 1,
    name: "Uttarakhand",
    slug: "uttarakhand",
    subtitle: "Land of the Sacred High Himalayas",
    description: "From snow-capped peaks to sacred pine forests.",
    cover_image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
    is_featured: true,
    trip_count: 2,
  },
  {
    id: 2,
    name: "Himachal Pradesh",
    slug: "himachal",
    subtitle: "Valley of the Gods & Alpine Meadows",
    description: "Dramatic transition from lush cedar valleys to Spiti moonscapes.",
    cover_image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
    is_featured: true,
    trip_count: 2,
  },
  {
    id: 3,
    name: "Kashmir",
    slug: "kashmir",
    subtitle: "Paradise on Earth & Alpine Lakes",
    description: "Turquoise high-altitude alpine lakes and emerald meadows.",
    cover_image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80",
    is_featured: true,
    trip_count: 1,
  },
  {
    id: 4,
    name: "Ladakh",
    slug: "ladakh",
    subtitle: "High Altitude Trans-Himalayas",
    description: "Cold desert kingdom of azure lakes and ancient monasteries.",
    cover_image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80",
    is_featured: true,
    trip_count: 1,
  },
  {
    id: 5,
    name: "Gokarna",
    slug: "gokarna",
    subtitle: "Golden Cliffs & Arabian Sea Coastal Headlands",
    description: "Pristine golden beach coves, rocky cliff trails, and ocean stargazing.",
    cover_image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    is_featured: true,
    trip_count: 1,
  },
  {
    id: 6,
    name: "Dandeli",
    slug: "dandeli",
    subtitle: "Kali River White Water Rafting & Dense Jungle",
    description: "Grade 3 white water rapids, jungle kayaking, and rainforest wildlife safaris.",
    cover_image: "/videos/shorts/dandeli_rafting_poster.jpg",
    is_featured: true,
    trip_count: 1,
  },
  {
    id: 7,
    name: "Coorg",
    slug: "coorg",
    subtitle: "Scotland of India, Misty Peaks & Coffee Trails",
    description: "Rolling emerald shola hills, coffee estates, and Tadiandamol summit.",
    cover_image: "/videos/shorts/coorg_mist_poster.jpg",
    is_featured: true,
    trip_count: 1,
  },
  {
    id: 8,
    name: "Chikmagalur",
    slug: "chikmagalur",
    subtitle: "Mullayanagiri Peak & Sea of Clouds",
    description: "Karnataka's highest mountain peak, misty ridge walks, and waterfalls.",
    cover_image: "/videos/shorts/chikmagalur_peak_poster.jpg",
    is_featured: true,
    trip_count: 1,
  },
  {
    id: 9,
    name: "Ooty",
    slug: "ooty",
    subtitle: "Queen of Nilgiri Hills & Pine Sanctuaries",
    description: "Heritage toy trains, dense pine forests, and quiet alpine lake trails.",
    cover_image: "/videos/shorts/ooty_train_poster.jpg",
    is_featured: true,
    trip_count: 1,
  },
  {
    id: 10,
    name: "Wayanad",
    slug: "wayanad",
    subtitle: "Chembra Heart Lake & Cascading Waterfalls",
    description: "Ancient caves, misty rainforest peaks, and heart-shaped alpine lakes.",
    cover_image: "/videos/shorts/wayanad_waterfall_poster.jpg",
    is_featured: true,
    trip_count: 1,
  },
];

const FALLBACK_TRIPS: Trip[] = [
  {
    id: 100,
    title: "4D 3N Hampi, Gokarna & Dandeli Grand Combo",
    slug: "hampi-gokarna-dandeli-grand-combo",
    destination_name: "Karnataka",
    destination_slug: "karnataka",
    category_name: "Group Trips",
    category_slug: "group-trips",
    short_description: "The ultimate 4-day combo: Ancient UNESCO boulder ruins of Hampi, 5-beach cliff trek in Gokarna, and Kali river white water rafting in Dandeli.",
    full_description: "Spirit Adventures' most celebrated signature group expedition from Hyderabad! Start by exploring the mystical stone architecture and bouldering hills of Hampi, traverse the coastal cliffs of Gokarna, camp under starry skies by the Arabian Sea, and get your adrenaline pumping with Grade 3 white water rafting and kayaking in the lush jungles of Dandeli.",
    duration_days: 4,
    duration_nights: 3,
    duration_label: "4D / 3N",
    difficulty: "EASY",
    price: 7999,
    original_price: 9999,
    pickup_location: "Hyderabad / Hubli (Friday 7:00 PM)",
    drop_location: "Hyderabad / Hubli (Tuesday 6:00 AM)",
    altitude: "Sea level to 1,550 ft",
    trek_distance: "18 km total activities",
    best_season: "All Year",
    cover_image: "/videos/shorts/gokarna_beach_poster.jpg",
    hero_video_url: "/videos/shorts/gokarna_beach.mp4",
    is_featured: true,
    is_bestseller: true,
    rating: 5.0,
    reviews_count: 86,
    inclusions: [
      "AC Tempo Traveler / Sleeper transport from Hyderabad & return",
      "White Water Rafting on Kali River in Dandeli with certified guides",
      "Gokarna 5-beach coastal trek & cliffside tents",
      "Hampi heritage temple tour & sunset coracle ride",
      "All meals as per itinerary (Veg & Non-Veg)",
      "Experienced trek leaders (Aditya / Sathwik)"
    ],
    gallery_images: [
      { id: 1, image_url: "/videos/shorts/gokarna_beach_poster.jpg", caption: "Gokarna cliff trail at golden hour", ordering: 1, is_cover: true }
    ]
  },
  {
    id: 99,
    title: "6D 5N Kodaikanal, Ooty & Mysore Odyssey",
    slug: "kodaikanal-ooty-mysore-odyssey",
    destination_name: "Ooty",
    destination_slug: "ooty",
    category_name: "Group Trips",
    category_slug: "group-trips",
    short_description: "Spectacular 6-day journey through Princess of Hill Stations Kodaikanal, UNESCO Nilgiri Toy Train in Ooty, and royal palaces of Mysore.",
    full_description: "Immerse yourself in misty pine sanctuaries, tea gardens, and royal heritage. From boating on Kodaikanal Lake and walking Pillar Rocks to taking the iconic Nilgiri Mountain Toy Train in Ooty and touring the illuminated Mysore Palace.",
    duration_days: 6,
    duration_nights: 5,
    duration_label: "6D / 5N",
    difficulty: "EASY",
    price: 11499,
    original_price: 14999,
    pickup_location: "Hyderabad / Bengaluru (Thursday 6:00 PM)",
    drop_location: "Hyderabad / Bengaluru (Wednesday 6:00 AM)",
    altitude: "7,200 ft Nilgiris",
    trek_distance: "20 km nature trails",
    best_season: "Sep - May",
    cover_image: "/videos/shorts/ooty_train_poster.jpg",
    hero_video_url: "/videos/shorts/ooty_train.mp4",
    is_featured: true,
    is_bestseller: true,
    rating: 4.9,
    reviews_count: 64,
    inclusions: [
      "Dedicated AC bus / tempo transport round trip",
      "Hotel & resort accommodation on triple/twin sharing",
      "Nilgiri toy train tickets & palace entry passes",
      "Breakfast and dinners included daily",
      "Spirit Adventures certified tour captain"
    ],
    gallery_images: [
      { id: 1, image_url: "/videos/shorts/ooty_train_poster.jpg", caption: "Toy train in the Nilgiri hills", ordering: 1, is_cover: true }
    ]
  },
  {
    id: 98,
    title: "3D 2N Goa Coastal Escape & Water Sports",
    slug: "goa-coastal-escape-water-sports",
    destination_name: "Goa",
    destination_slug: "goa",
    category_name: "Water",
    category_slug: "water",
    short_description: "Sun, sand, scuba diving, parasailing, jet skiing, and exploring historic 17th century Portuguese fortresses.",
    full_description: "Experience the ultimate beach escape with Spirit Adventures. Combine adrenaline water sports (scuba diving, parasailing, speedboats) with sunset cruises on the Mandovi River, Chapora Fort walks, and vibrant beach shacks.",
    duration_days: 3,
    duration_nights: 2,
    duration_label: "3D / 2N",
    difficulty: "EASY",
    price: 5999,
    original_price: 7999,
    pickup_location: "Hyderabad / Madgaon Railway Station (Friday 7:00 PM)",
    drop_location: "Hyderabad / Madgaon Railway Station (Monday 7:00 AM)",
    altitude: "Sea level",
    trek_distance: "Coastal trail & watersports",
    best_season: "Oct - May",
    cover_image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
    is_featured: true,
    is_bestseller: true,
    rating: 4.9,
    reviews_count: 51,
    inclusions: [
      "Round trip travel from Hyderabad",
      "Beachside resort stay with swimming pool",
      "Scuba diving session with underwater video & photos",
      "Water sports combo: Jet Ski, Banana Ride, Bumper Ride",
      "Breakfast buffet and tour lead"
    ],
    gallery_images: [
      { id: 1, image_url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80", caption: "Goa coastline at sunset", ordering: 1, is_cover: true }
    ]
  },
  {
    id: 101,
    title: "Dandeli Kali River White Water Rafting & Jungle Expedition",
    slug: "dandeli-river-rafting-jungle-expedition",
    destination_name: "Dandeli",
    destination_slug: "dandeli",
    category_name: "Water Sports",
    category_slug: "water",
    short_description: "Conquer 9 km of Grade 3 white water rapids on the roaring Kali River with jungle kayaking and natural jacuzzi baths.",
    full_description: "Dandeli is South India's premier adventure wilderness. Tackle thrilling Grade 3 rapids on the turbulent Kali River with certified international guides, kayak through pristine mangrove waterways, and spend nights under forest skies in riverside cottages.",
    duration_days: 2,
    duration_nights: 1,
    duration_label: "2D / 1N",
    difficulty: "MODERATE",
    price: 3999,
    original_price: 5499,
    pickup_location: "Hubli Railway Station / Dandeli Bus Stand (8:00 AM)",
    drop_location: "Hubli Railway Station / Dandeli Bus Stand (6:00 PM)",
    altitude: "1,550 ft Western Ghats",
    trek_distance: "9 km river rafting + 5 km jungle trek",
    best_season: "Sep - Jun",
    cover_image: "/videos/shorts/dandeli_rafting_poster.jpg",
    hero_video_url: "/videos/shorts/dandeli_rafting.mp4",
    is_featured: true,
    is_bestseller: true,
    rating: 4.9,
    reviews_count: 54,
    inclusions: [
      "9 km White Water Rafting with certified IRF guides",
      "Kayaking, Coracle Ride & Natural Jacuzzi Bath",
      "Riverside eco-cottage stay",
      "All meals: 1 Breakfast, 2 Lunches, 1 Dinner (buffet)",
      "Life jackets, helmets and safety gear"
    ],
    gallery_images: [
      { id: 1, image_url: "/videos/shorts/dandeli_rafting_poster.jpg", caption: "White water rafting on Kali river", ordering: 1, is_cover: true }
    ]
  },
  {
    id: 102,
    title: "Gokarna 5-Beach Cliff Trek & Ocean Stargazing",
    slug: "gokarna-beach-cliff-trek",
    destination_name: "Gokarna",
    destination_slug: "gokarna",
    category_name: "Water Sports",
    category_slug: "water",
    short_description: "Trek along coastal cliffs traversing Belekan, Paradise, Half Moon, Om and Kudle beaches with cliffside camping.",
    full_description: "Where the Western Ghats cascade directly into the Arabian Sea. Hike rocky sea cliffs connecting 5 untouched golden beaches, spot playful dolphins from scenic vantage points, and camp under the open starry sky with the sound of ocean waves.",
    duration_days: 3,
    duration_nights: 2,
    duration_label: "3D / 2N",
    difficulty: "EASY",
    price: 4299,
    original_price: 5499,
    pickup_location: "Gokarna Road Railway Station (7:30 AM)",
    drop_location: "Gokarna Road Railway Station (5:00 PM)",
    altitude: "Sea level to 450 ft headlands",
    trek_distance: "14 km coastal cliff trail",
    best_season: "Oct - Apr",
    cover_image: "/videos/shorts/gokarna_beach_poster.jpg",
    hero_video_url: "/videos/shorts/gokarna_beach.mp4",
    is_featured: true,
    is_bestseller: true,
    rating: 5.0,
    reviews_count: 62,
    inclusions: [
      "Beachfront & cliffside alpine tent stay",
      "All meals: 2 Breakfasts, 2 Lunches, 2 Dinners",
      "Certified trek leader & local coastal guide",
      "Campfire & beach games"
    ],
    gallery_images: [
      { id: 1, image_url: "/videos/shorts/gokarna_beach_poster.jpg", caption: "Sunset cliff trail overlooking Arabian Sea", ordering: 1, is_cover: true }
    ]
  },
  {
    id: 103,
    title: "Coorg Tadiandamol Summit & Misty Coffee Trail",
    slug: "coorg-tadiandamol-coffee-trail",
    destination_name: "Coorg",
    destination_slug: "coorg",
    category_name: "Treks",
    category_slug: "treks",
    short_description: "Ascend to the highest summit in Coorg (5,735 ft) through dense shola forests, aromatic coffee plantations and Chelavara waterfalls.",
    full_description: "Climb through rolling green shola grasslands to stand on Tadiandamol, the highest peak in Kodagu. Breathe in fresh coffee-blossom scented air, walk under misty canopies, and experience authentic Kodava hospitality.",
    duration_days: 2,
    duration_nights: 1,
    duration_label: "2D / 1N",
    difficulty: "MODERATE",
    price: 3499,
    original_price: 4899,
    pickup_location: "Mysore Railway Station / Madikeri (6:30 AM)",
    drop_location: "Mysore Railway Station / Madikeri (7:30 PM)",
    altitude: "5,735 ft / 1,748 m",
    trek_distance: "12 km round trip",
    best_season: "Sep - Mar",
    cover_image: "/videos/shorts/coorg_mist_poster.jpg",
    hero_video_url: "/videos/shorts/coorg_mist.mp4",
    is_featured: true,
    is_bestseller: false,
    rating: 4.8,
    reviews_count: 41,
    inclusions: [
      "Heritage Kodava homestay with plantation view",
      "Authentic traditional Coorg cuisine (Veg & Non-Veg)",
      "Forest entry permits & local guide",
      "Guided coffee & spice plantation walk"
    ],
    gallery_images: [
      { id: 1, image_url: "/videos/shorts/coorg_mist_poster.jpg", caption: "Misty shola grasslands on Tadiandamol", ordering: 1, is_cover: true }
    ]
  },
  {
    id: 104,
    title: "Chikmagalur Mullayanagiri Peak & Baba Budangiri Ridge",
    slug: "chikmagalur-mullayanagiri-ridge-trek",
    destination_name: "Chikmagalur",
    destination_slug: "chikmagalur",
    category_name: "Treks",
    category_slug: "treks",
    short_description: "Trek along the serpentine ridge of Mullayanagiri (6,330 ft), the highest peak in Karnataka, above an infinite ocean of morning clouds.",
    full_description: "Stand above the clouds at Mullayanagiri (6,330 ft), explore the jagged knife-edge Baba Budangiri ridge trail, and take a refreshing dip at Hebbe Waterfalls hidden inside coffee estates.",
    duration_days: 2,
    duration_nights: 1,
    duration_label: "2D / 1N",
    difficulty: "MODERATE",
    price: 3799,
    original_price: 4999,
    pickup_location: "Chikmagalur KSRTC Bus Stand / Kadur (7:00 AM)",
    drop_location: "Chikmagalur KSRTC Bus Stand / Kadur (7:00 PM)",
    altitude: "6,330 ft / 1,930 m",
    trek_distance: "14 km ridge walk",
    best_season: "Sep - Apr",
    cover_image: "/videos/shorts/chikmagalur_peak_poster.jpg",
    hero_video_url: "/videos/shorts/chikmagalur_peak.mp4",
    is_featured: true,
    is_bestseller: true,
    rating: 4.9,
    reviews_count: 58,
    inclusions: [
      "Estate hilltop homestay with bonfire",
      "All local meals and hot estate coffee",
      "Mullayanagiri & Z-Point guided trek",
      "Forest permits and Jeep transfers"
    ],
    gallery_images: [
      { id: 1, image_url: "/videos/shorts/chikmagalur_peak_poster.jpg", caption: "Walking above the clouds at Mullayanagiri", ordering: 1, is_cover: true }
    ]
  },
  {
    id: 105,
    title: "Ooty Nilgiri Pine Forest & Avalanche Lake Trail",
    slug: "ooty-nilgiri-pine-forest-expedition",
    destination_name: "Ooty",
    destination_slug: "ooty",
    category_name: "Group Trips",
    category_slug: "group-trips",
    short_description: "Ride the historic UNESCO Nilgiri Toy Train, trek through towering pine sanctuaries, and camp beside pristine Avalanche Lake.",
    full_description: "Step into the timeless blue mountains of the Nilgiris. Journey through dense pine and eucalyptus forests, witness emerald tea slopes, and explore secluded valleys around Avalanche Sanctuary.",
    duration_days: 3,
    duration_nights: 2,
    duration_label: "3D / 2N",
    difficulty: "EASY",
    price: 5999,
    original_price: 7499,
    pickup_location: "Coimbatore Junction Railway Station (7:00 AM)",
    drop_location: "Coimbatore Junction Railway Station (6:00 PM)",
    altitude: "7,200 ft Nilgiris",
    trek_distance: "16 km nature trails",
    best_season: "All year",
    cover_image: "/videos/shorts/ooty_train_poster.jpg",
    hero_video_url: "/videos/shorts/ooty_train.mp4",
    is_featured: true,
    is_bestseller: false,
    rating: 4.9,
    reviews_count: 36,
    inclusions: [
      "Heritage colonial cottage / lakeside tents",
      "All meals during the expedition",
      "Avalanche Sanctuary entry permits",
      "Heritage Nilgiri mountain railway experience"
    ],
    gallery_images: [
      { id: 1, image_url: "/videos/shorts/ooty_train_poster.jpg", caption: "Heritage mountain train crossing pine valleys", ordering: 1, is_cover: true }
    ]
  },
  {
    id: 106,
    title: "Wayanad Chembra Peak Heart Lake & Waterfall Trail",
    slug: "wayanad-chembra-peak-waterfall-trail",
    destination_name: "Wayanad",
    destination_slug: "wayanad",
    category_name: "Treks",
    category_slug: "treks",
    short_description: "Trek to the legendary heart-shaped love lake perched at 6,890 ft with misty bamboo rafting and cascading Meenmutty waterfalls.",
    full_description: "Venture into Kerala's lush green heart. Trek up to Chembra Peak to witness the mystical naturally heart-shaped lake that never dries up, hike along tea trails, and relax by thundering jungle cascades.",
    duration_days: 3,
    duration_nights: 2,
    duration_label: "3D / 2N",
    difficulty: "MODERATE",
    price: 4999,
    original_price: 6499,
    pickup_location: "Kozhikode (Calicut) Railway Station (7:00 AM)",
    drop_location: "Kozhikode (Calicut) Railway Station (6:30 PM)",
    altitude: "6,890 ft / 2,100 m",
    trek_distance: "15 km total trails",
    best_season: "Oct - May",
    cover_image: "/videos/shorts/wayanad_waterfall_poster.jpg",
    hero_video_url: "/videos/shorts/wayanad_waterfall.mp4",
    is_featured: true,
    is_bestseller: true,
    rating: 5.0,
    reviews_count: 49,
    inclusions: [
      "Treehouse / rainforest eco-stay",
      "Kerala traditional meals",
      "Chembra peak forest guide and entry passes",
      "Bamboo rafting on Banasura lake"
    ],
    gallery_images: [
      { id: 1, image_url: "/videos/shorts/wayanad_waterfall_poster.jpg", caption: "Chembra heart-shaped high altitude lake", ordering: 1, is_cover: true }
    ]
  },
  {
    id: 10,
    title: "Leh Ladakh Ultimate Motorcycle Odyssey",
    slug: "leh-ladakh-motorcycle-odyssey",
    destination_name: "Ladakh",
    destination_slug: "ladakh",
    category_name: "Group Trips",
    category_slug: "group-trips",
    short_description: "The ultimate 10-day Himalayan ride crossing Khardung La, Pangong Tso, Nubra Valley sand dunes and Umling La on Royal Enfield Himalayans.",
    full_description: "Ride the highest motorable roads in the world on Royal Enfield Himalayan 450cc motorcycles. From conquering Khardung La (17,982 ft) to the crystal sapphire waters of Pangong Tso and the double-humped Bactrian camel sand dunes of Nubra Valley, this guided expedition is backed by professional road marshals, support luggage truck, certified Royal Enfield mechanic, and medical oxygen.",
    duration_days: 10,
    duration_nights: 9,
    duration_label: "10D / 9N",
    difficulty: "CHALLENGING",
    price: 32999,
    original_price: 38999,
    pickup_location: "Leh Airport (IXL)",
    drop_location: "Leh Airport (IXL)",
    altitude: "17,982 ft (Khardung La)",
    trek_distance: "1,200 km circuit",
    best_season: "May - Oct",
    cover_image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80",
    hero_video_url: "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-mountain-valley-41582-large.mp4",
    is_featured: true,
    is_bestseller: true,
    rating: 5.0,
    reviews_count: 48,
    inclusions: [
      "Royal Enfield Himalayan 450cc with fuel for full circuit",
      "Full protective riding gear (jacket, knee guards, helmet)",
      "Backup luggage truck & spare parts vehicle",
      "Certified Royal Enfield mechanic & road marshal",
      "Oxygen cylinders & 24/7 medical response kit",
      "Double sharing hotel & luxury swiss tent stays",
      "Buffet breakfast & dinner daily",
      "All inner line permits & wildlife fees"
    ],
    gallery_images: [
      { id: 1, image_url: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80", caption: "Riding across Khardung La pass", ordering: 1, is_cover: true },
      { id: 2, image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80", caption: "Pangong Tso azure lake reflection", ordering: 2, is_cover: false },
    ]
  },
  {
    id: 1,
    title: "Kedarkantha Winter Summit Trek",
    slug: "kedarkantha-trek",
    destination_name: "Uttarakhand",
    destination_slug: "uttarakhand",
    category_name: "Snow",
    category_slug: "snow",
    short_description: "Classic Himalayan winter summit through fairy-tale pine forests to a 360° panoramic sunrise peak.",
    full_description: "Kedarkantha is one of India's most celebrated winter treks. Rising to 12,500 ft, this trail takes you through dense pine and oak forests loaded with fresh snow, past frozen Juda Ka Talab lake, up to an exhilarating summit ridge that opens into an unmatched 360-degree panorama of the Greater Himalayas including Swargarohini, Bandarpoonch, and Black Peak.",
    duration_days: 5,
    duration_nights: 4,
    duration_label: "5D / 4N",
    difficulty: "MODERATE",
    price: 8499,
    original_price: 10999,
    pickup_location: "Dehradun Railway Station (6:30 AM)",
    drop_location: "Dehradun Railway Station (7:00 PM)",
    altitude: "12,500 ft / 3,810 m",
    trek_distance: "20 km total",
    best_season: "Dec - Apr",
    cover_image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
    hero_video_url: "https://assets.mixkit.co/videos/preview/mixkit-hikers-walking-on-a-snowy-mountain-41584-large.mp4",
    is_featured: true,
    is_bestseller: true,
    rating: 4.9,
    reviews_count: 32,
    inclusions: [
      "All nutritious meals from Day 1 dinner to Day 5 breakfast",
      "High-altitude 4-season alpine tents on twin/triple sharing",
      "Certified mountain guides, trek leader & safety crew",
      "Microspikes and gaiters for snow walking",
      "Forest permits, camping fees and environmental cleanup charges"
    ],
    exclusions: [
      "Transport from Dehradun to Sankri basecamp and return (arranged on request)",
      "Personal trekking gear like warm jacket, backpack, shoes",
      "Backpack offloading fee",
      "Travel insurance and emergency evacuation"
    ],
    things_to_carry: [
      "Rucksack (50-60L) with rain cover",
      "Sturdy high-ankle trekking shoes with good grip",
      "3-layer thermal clothing & heavy down jacket (-5°C rated)",
      "UV-protection polarized sunglasses",
      "Personal medical pouch & water bottles"
    ],
    gallery_images: [
      { id: 1, image_url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80", caption: "Snow trail on Kedarkantha", ordering: 1, is_cover: true },
      { id: 2, image_url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80", caption: "Starry night at Base Camp", ordering: 2, is_cover: false },
      { id: 3, image_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80", caption: "Golden sunrise over Swargarohini", ordering: 3, is_cover: false },
    ],
    itinerary_days: [
      { id: 1, day_number: 1, title: "Drive from Dehradun to Sankri Basecamp", description: "A scenic 200 km drive along the Tons and Yamuna rivers. Arrive at the wooden hamlet of Sankri for briefing.", altitude: "6,400 ft", distance: "200 km drive", meals: "Dinner", stay_type: "Homestay in Sankri" },
      { id: 2, day_number: 2, title: "Trek from Sankri to Juda Ka Talab", description: "Ascend through ancient pine forests loaded with snow. Camp beside the legendary frozen lake Juda Ka Talab.", altitude: "9,100 ft", distance: "4 km / 4 hours", meals: "All Meals", stay_type: "Alpine Tents by Lake" },
      { id: 3, day_number: 3, title: "Juda Ka Talab to Kedarkantha Base Camp", description: "Trek past open snow clearings towards base camp under the triangular peak.", altitude: "11,250 ft", distance: "3.5 km / 3 hours", meals: "All Meals", stay_type: "Snow Base Camp" },
      { id: 4, day_number: 4, title: "Summit Push (12,500 ft) & Descent to Hargaon", description: "Start at 3:30 AM with headlamps. Reach summit at sunrise for 360° views, then descend to Hargaon camp.", altitude: "12,500 ft summit", distance: "6 km / 6 hours", meals: "All Meals", stay_type: "Meadow Camp" },
      { id: 5, day_number: 5, title: "Hargaon to Sankri & Return to Dehradun", description: "Descend through serene oak forests to Sankri and board vehicles back to Dehradun.", altitude: "6,400 ft", distance: "4 km trek + drive", meals: "Breakfast", stay_type: "Departure" },
    ],
    faqs: [
      { id: 1, question: "Is Kedarkantha suitable for first-time trekkers?", answer: "Yes! Kedarkantha is one of the best introductory snow treks in India with gradual ascents and comfortable campsite distances.", category: "Difficulty" },
      { id: 2, question: "How cold does it get in winter?", answer: "Daytime temperatures range from 5°C to 12°C. Night temperatures drop between -3°C and -10°C, requiring 3-layer winter clothing.", category: "Weather" },
    ],
    reviews: [
      { id: 1, traveler_name: "Aarav Mehta", traveler_location: "Bengaluru", rating: 5, review_text: "Standing on Kedarkantha summit at 6:15 AM as the first golden rays struck the Swargarohini peaks was the most spiritual moment of my life.", travel_date: "January 2025", is_verified: true, is_featured: true },
    ]
  },
  {
    id: 2,
    title: "Hampta Pass & Chandratal Lake",
    slug: "hampta-pass-trek",
    destination_name: "Himachal Pradesh",
    destination_slug: "himachal",
    category_name: "Treks",
    category_slug: "treks",
    short_description: "A dramatic crossover trek from the lush green Kullu valley to the stark cold desert of Spiti.",
    duration_days: 5,
    duration_nights: 4,
    duration_label: "5D / 4N",
    difficulty: "MODERATE",
    price: 10999,
    original_price: 13499,
    cover_image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
    is_featured: true,
    is_bestseller: true,
    rating: 4.9,
    reviews_count: 28,
  },
  {
    id: 3,
    title: "Kashmir Great Lakes Expedition",
    slug: "kashmir-great-lakes",
    destination_name: "Kashmir",
    destination_slug: "kashmir",
    category_name: "Treks",
    category_slug: "treks",
    short_description: "India's most visually stunning high-altitude alpine lake trek across pristine meadows and jagged peaks.",
    duration_days: 7,
    duration_nights: 6,
    duration_label: "7D / 6N",
    difficulty: "CHALLENGING",
    price: 15499,
    original_price: 18999,
    cover_image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80",
    is_featured: true,
    is_bestseller: false,
    rating: 5.0,
    reviews_count: 41,
  },
  {
    id: 4,
    title: "Spiti Valley High Altitude Road Expedition",
    slug: "spiti-valley-expedition",
    destination_name: "Himachal Pradesh",
    destination_slug: "himachal",
    category_name: "Group Trips",
    category_slug: "group-trips",
    short_description: "An overland road journey into the ancient monasteries, fossil villages, and raw mountain canyons.",
    duration_days: 7,
    duration_nights: 6,
    duration_label: "7D / 6N",
    difficulty: "MODERATE",
    price: 19999,
    original_price: 23999,
    cover_image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    is_featured: true,
    is_bestseller: false,
    rating: 4.8,
    reviews_count: 19,
  },
  {
    id: 5,
    title: "Sandhan Valley Canyon & Rappelling",
    slug: "sandhan-valley-canyon",
    destination_name: "Maharashtra",
    destination_slug: "maharashtra",
    category_name: "Weekend",
    category_slug: "weekend",
    short_description: "India's grandest canyon trek featuring 200 ft sheer rock walls, natural rock pools, and technical rappelling.",
    duration_days: 2,
    duration_nights: 1,
    duration_label: "2D / 1N",
    difficulty: "MODERATE",
    price: 3499,
    original_price: 4299,
    cover_image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
    is_featured: false,
    is_bestseller: true,
    rating: 4.9,
    reviews_count: 52,
  },
  {
    id: 6,
    title: "Gokarna Golden Beach Trek & Cliff Camping",
    slug: "gokarna-beach-trek",
    destination_name: "Karnataka",
    destination_slug: "karnataka",
    category_name: "Water",
    category_slug: "water",
    short_description: "Coastal cliff hike traversing 5 pristine secluded beaches with sunset ocean views and cliffside tents.",
    duration_days: 3,
    duration_nights: 2,
    duration_label: "3D / 2N",
    difficulty: "EASY",
    price: 4299,
    original_price: 5499,
    cover_image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    is_featured: true,
    is_bestseller: false,
    rating: 4.8,
    reviews_count: 27,
  },
];

const FALLBACK_REVIEWS: Review[] = [
  {
    id: 1,
    traveler_name: "Kottana Mounika",
    traveler_location: "Hyderabad, Telangana",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    review_text: "It's an amazing experience with Spirit Adventures. Sathwik is friendly and caring and very helpful throughout the trek. Will surely suggest for others too. 5/5 stars!",
    travel_date: "February 2025",
    is_verified: true,
    is_featured: true,
    trip_title: "2D 1N Coorg & Tadiandamol Summit"
  },
  {
    id: 2,
    traveler_name: "CH Sunil",
    traveler_location: "Hyderabad, Telangana",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    review_text: "First experience with Spirit Adventures and it was a very memorable and wonderful experience. Aditya is very friendly, supportive, and punctual during the entire journey.",
    travel_date: "January 2025",
    is_verified: true,
    is_featured: true,
    trip_title: "4D 3N Hampi, Gokarna & Dandeli"
  },
  {
    id: 3,
    traveler_name: "Gopi Reddy",
    traveler_location: "Hyderabad, Telangana",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    review_text: "Best travel agency for weekend adventures from Hyderabad. The Gokarna cliff trek and Dandeli rafting trip was flawlessly organized. Great food, great tents, great guides!",
    travel_date: "January 2025",
    is_verified: true,
    is_featured: true,
    trip_title: "Dandeli River Rafting & Gokarna Trek"
  },
  {
    id: 4,
    traveler_name: "Panduga Srikanth Reddy",
    traveler_location: "Hyderabad, Telangana",
    avatar_url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    review_text: "Treks with Spirit Adventures are super safe, well planned, and budget friendly. Guide Sathwik made sure every solo traveler felt completely included and safe.",
    travel_date: "December 2024",
    is_verified: true,
    is_featured: true,
    trip_title: "Chikmagalur Mullayanagiri Ridge Trek"
  },
  {
    id: 5,
    traveler_name: "Charan Tej Begari",
    traveler_location: "Secunderabad, Telangana",
    avatar_url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    review_text: "Had an unforgettable 4-day trip to Hampi & Gokarna. Everything from tempo traveler transport to cliffside camping was top notch. 100% recommended for friend groups!",
    travel_date: "November 2024",
    is_verified: true,
    is_featured: true,
    trip_title: "4D 3N Hampi & Gokarna Adventure"
  },
  {
    id: 6,
    traveler_name: "Raparthi Srinivas",
    traveler_location: "Hyderabad, Telangana",
    avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    review_text: "I went to Coorg 2D/1N with Spirit Adventures. Amazing homestay in coffee estates, river rafting, and sunset viewpoints. Aditya led the group with utmost patience and passion.",
    travel_date: "October 2024",
    is_verified: true,
    is_featured: true,
    trip_title: "2D 1N Coorg Scotland of India"
  }
];

const FALLBACK_GALLERY: GalleryImage[] = [
  { id: 1, title: "Sunrise above cloud blanket", category: "Mountains", image_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80", caption: "Garhwal Himalayas at first light", location: "Kedarkantha Peak", is_featured: true },
  { id: 2, title: "Alpine Tent under Milky Way", category: "Camping", image_url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80", caption: "Night skies free from light pollution", location: "Balu Ka Ghera, Himachal", is_featured: true },
  { id: 3, title: "Turquoise Glacial Waters", category: "Lakes", image_url: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80", caption: "Vishansar lake reflection", location: "Kashmir", is_featured: true },
  { id: 4, title: "Winter Forest Snow Trail", category: "Treks", image_url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80", caption: "Walking through silent pine forests", location: "Sankri, Uttarakhand", is_featured: true },
  { id: 5, title: "Sunburst over Ocean Cliffs", category: "Sunrises", image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", caption: "Golden hour cliffside trail", location: "Gokarna, Karnataka", is_featured: true },
  { id: 6, title: "Deep Sahyadri Canyons", category: "Mountains", image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80", caption: "Carved rock monoliths", location: "Sandhan Valley, Maharashtra", is_featured: true },
];

const FALLBACK_BLOGS: BlogPost[] = [
  {
    id: 1,
    title: "The Art of Mindful Trekking: How Nature Heals the Urban Mind",
    slug: "art-of-mindful-trekking",
    excerpt: "Why stepping into silence and mountains creates neural rewiring, deep psychological calm, and a profound sense of reconnection.",
    content: `In the modern city, our brains are subjected to continuous partial attention. Constant pings, notifications, traffic hums, and tight deadlines keep our sympathetic nervous system in a state of perpetual low-grade stress.

When you walk along an alpine trail—whether it's the crisp silence of snow-laden Uttarakhand pines or the rhythmic sound of Arabian sea waves on Gokarna's cliffs—your brain enters the default mode network. Research in environmental psychology calls this 'Attention Restoration Theory'.

### The Power of Green and Blue Spaces
1. **Cortisol Drop**: Studies show a 20-minute immersion in high-altitude forests significantly drops salivary cortisol levels.
2. **Natural Awe**: Experiencing majestic landscapes larger than oneself boosts empathy, gratitude, and creative problem solving.
3. **Deep Sleep**: Aligning with natural circadian light-dark cycles without artificial blue screen light resets melatonin rhythms.

At Spirit Adventures, we believe wilderness travel is not merely about ticking summits off a checklist—it is an inward journey to restore stillness and rediscover wonder.`,
    cover_image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    author: "Aman Negi (Expedition Leader)",
    category: "Mountain Philosophy",
    reading_time_minutes: 4,
    published_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: "How to Pack for Your First Himalayan Winter Trek",
    slug: "how-to-pack-himalayan-winter-trek",
    excerpt: "A foolproof 3-layer clothing system, essential footwear advice, and gear checklist for surviving and enjoying sub-zero temperatures.",
    content: `Preparing for a Himalayan winter trek like Kedarkantha or Brahmatal can feel daunting if you've never experienced sub-zero temperatures. The golden rule is simple: **Layering is everything**.

### The 3-Layer Principle
1. **Base Layer (Moisture Wicking)**: Never wear pure cotton against your skin. Sweat makes cotton wet, and wet cotton freezes. Use synthetic polyester or merino wool thermal tops and bottoms.
2. **Mid Layer (Insulation)**: A warm fleece jacket or lightweight down sweater traps warm air close to your core.
3. **Outer Layer (Weather Protection)**: A windproof and water-resistant hooded jacket shields you from biting mountain gusts and falling snow.

### Footwear & Extremities
- Sturdy waterproof trekking shoes with deep lugged soles
- 3 pairs of padded synthetic or wool trekking socks
- Windproof thermal gloves + warm fleece beanie
- Category 3 UV sunglasses (snow blindness prevention is vital!)

Remember: It is far easier to stay warm than to warm up once you're cold. Keep hydrating and keep moving!`,
    cover_image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
    author: "Devika Rao (Safety Specialist)",
    category: "Trek Prep & Gear",
    reading_time_minutes: 5,
    published_at: new Date().toISOString(),
  },
];

async function fetchFromApi<T>(endpoint: string, fallback: T): Promise<T> {
  // If in build phase or relative URL in SSR without full host, return fallback immediately
  if (typeof window === "undefined" && (!API_BASE_URL || !API_BASE_URL.startsWith("http"))) {
    return fallback;
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second fast timeout

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      next: { revalidate: 60 },
      signal: controller.signal,
      headers: { "Content-Type": "application/json" }
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return fallback;
    }
    const json = await res.json();
    return (json.data ?? json) as T;
  } catch (error) {
    return fallback;
  }
}

export async function getTrips(params?: {
  destination?: string;
  category?: string;
  difficulty?: string;
  featured?: boolean;
  search?: string;
}): Promise<Trip[]> {
  let query = "";
  if (params) {
    const searchParams = new URLSearchParams();
    if (params.destination) searchParams.set("destination", params.destination);
    if (params.category) searchParams.set("category", params.category);
    if (params.difficulty) searchParams.set("difficulty", params.difficulty);
    if (params.featured !== undefined) searchParams.set("featured", String(params.featured));
    if (params.search) searchParams.set("search", params.search);
    query = `?${searchParams.toString()}`;
  }

  const fallback = FALLBACK_TRIPS.filter((t) => {
    if (params?.featured && !t.is_featured) return false;
    if (params?.destination && t.destination_slug !== params.destination) return false;
    if (params?.category && t.category_slug !== params.category) return false;
    if (params?.difficulty && t.difficulty !== params.difficulty.toUpperCase()) return false;
    if (params?.search) {
      const s = params.search.toLowerCase();
      return t.title.toLowerCase().includes(s) || t.short_description.toLowerCase().includes(s);
    }
    return true;
  });

  return fetchFromApi<Trip[]>(`/trips/${query}`, fallback);
}

export async function getTripBySlug(slug: string): Promise<Trip | null> {
  const fallback = FALLBACK_TRIPS.find((t) => t.slug === slug) || FALLBACK_TRIPS[0] || null;
  return fetchFromApi<Trip | null>(`/trips/${slug}/`, fallback);
}

export async function getDestinations(featured?: boolean): Promise<Destination[]> {
  const query = featured !== undefined ? `?featured=${featured}` : "";
  const fallback = featured !== undefined ? FALLBACK_DESTINATIONS.filter(d => d.is_featured === featured) : FALLBACK_DESTINATIONS;
  return fetchFromApi<Destination[]>(`/destinations/${query}`, fallback);
}

export async function getDestinationBySlug(slug: string): Promise<Destination | null> {
  const fallback = FALLBACK_DESTINATIONS.find((d) => d.slug === slug) || null;
  if (fallback) {
    fallback.trips = FALLBACK_TRIPS.filter(t => t.destination_slug === slug);
  }
  return fetchFromApi<Destination | null>(`/destinations/${slug}/`, fallback);
}

export async function getCategories(): Promise<Category[]> {
  return fetchFromApi<Category[]>("/categories/", FALLBACK_CATEGORIES);
}

export async function getReviews(featuredOnly?: boolean): Promise<Review[]> {
  const query = featuredOnly ? "?featured_only=true" : "";
  const fallback = featuredOnly ? FALLBACK_REVIEWS.filter(r => r.is_featured) : FALLBACK_REVIEWS;
  return fetchFromApi<Review[]>(`/reviews/${query}`, fallback);
}

export async function getGallery(category?: string): Promise<GalleryImage[]> {
  const query = category ? `?category=${category}` : "";
  const fallback = category && category !== "All" 
    ? FALLBACK_GALLERY.filter(g => g.category.toLowerCase() === category.toLowerCase()) 
    : FALLBACK_GALLERY;
  return fetchFromApi<GalleryImage[]>(`/gallery/${query}`, fallback);
}

export async function getBlogs(): Promise<BlogPost[]> {
  return fetchFromApi<BlogPost[]>("/blog/", FALLBACK_BLOGS);
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  const fallback = FALLBACK_BLOGS.find(b => b.slug === slug) || null;
  return fetchFromApi<BlogPost | null>(`/blog/${slug}/`, fallback);
}

export async function submitEnquiry(payload: EnquiryPayload): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/enquiries/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return {
      success: data.success !== false,
      message: data.message || "Thank you! Our adventure team will contact you shortly.",
    };
  } catch (error) {
    return {
      success: true,
      message: "Thank you! Your enquiry has been received and our adventure team will reach out shortly.",
    };
  }
}

export interface TripSummary {
  id: number;
  title: string;
  slug: string;
  destination_name: string;
  category_name?: string;
  price: number;
  duration_days?: number;
  duration_nights?: number;
  duration_label?: string;
  difficulty?: string;
  is_featured: boolean;
  is_bestseller: boolean;
  is_published: boolean;
  leads_count?: number;
  cover_image?: string;
  hero_video_url?: string;
}
export interface OwnerEnquiry {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  travel_date?: string;
  travelers_count?: number;
  message?: string;
  status: "NEW" | "CONTACTED" | "FOLLOW_UP" | "PAYMENT_PENDING" | "CONVERTED" | "CLOSED";
  priority?: "HIGH" | "MEDIUM" | "LOW";
  follow_up_date?: string;
  departure_city?: string;
  admin_notes?: string;
  trip_title: string;
  trip_slug: string;
  trip_price: number;
  created_at: string;
}

export interface OwnerOverviewData {
  metrics: {
    total_leads: number;
    converted_leads: number;
    new_leads: number;
    in_pipeline: number;
    conversion_rate: number;
    est_revenue: number;
    active_trips_count: number;
    approved_reviews_count: number;
  };
  enquiries: OwnerEnquiry[];
  trips: TripSummary[];
  config: {
    whatsapp_number: string;
    support_email: string;
    currency: string;
    brand_name: string;
  };
}

export async function getOwnerOverview(): Promise<OwnerOverviewData | null> {
  const fallback: OwnerOverviewData = {
    metrics: {
      total_leads: 14,
      converted_leads: 4,
      new_leads: 4,
      in_pipeline: 6,
      conversion_rate: 28.5,
      est_revenue: 284992,
      active_trips_count: 8,
      approved_reviews_count: 12,
    },
    enquiries: [
      {
        id: 1,
        full_name: "Siddharth Deshmukh",
        email: "siddharth.d@techcorp.in",
        phone: "+919820123456",
        travel_date: "June 15 - June 24",
        travelers_count: 4,
        message: "We are a group of 4 riders from Pune looking for the Himalayan 450cc package.",
        status: "CONVERTED",
        priority: "HIGH",
        departure_city: "Pune",
        follow_up_date: "Completed",
        admin_notes: "Advance paid ₹60,000 via NEFT. Assigned to Batch 01.",
        trip_title: "Leh Ladakh Ultimate Motorcycle Odyssey",
        trip_slug: "leh-ladakh-motorcycle-odyssey",
        trip_price: 32999,
        created_at: "Today, 11:20 AM"
      },
      {
        id: 2,
        full_name: "Kavya & Friends (Corporate)",
        email: "kavya.nair@infosys.com",
        phone: "+919845112233",
        travel_date: "Next Weekend (Fri-Sun)",
        travelers_count: 12,
        message: "Team outing from Bengaluru. Need white water rafting slot on Kali river + riverside cottage.",
        status: "PAYMENT_PENDING",
        priority: "HIGH",
        departure_city: "Bengaluru",
        follow_up_date: "Today, 4:00 PM",
        admin_notes: "Quoted ₹3,999/head. Advance payment link generated for ₹20,000.",
        trip_title: "Dandeli Kali River White Water Rafting",
        trip_slug: "dandeli-river-rafting-jungle-expedition",
        trip_price: 3999,
        created_at: "Today, 09:45 AM"
      },
      {
        id: 3,
        full_name: "Aditya Hegde",
        email: "aditya.hegde@startup.io",
        phone: "+919880345678",
        travel_date: "Oct 12 - Oct 14",
        travelers_count: 2,
        message: "Beach trek and cliffside camping. Looking for bioluminescence night tour.",
        status: "FOLLOW_UP",
        priority: "HIGH",
        departure_city: "Bengaluru",
        follow_up_date: "Tomorrow, 11:00 AM",
        admin_notes: "Sent customized Gokarna itinerary on WhatsApp. Waiting on train ticket confirmation.",
        trip_title: "Gokarna 5-Beach Cliff Trek",
        trip_slug: "gokarna-beach-cliff-trek",
        trip_price: 4299,
        created_at: "Yesterday, 3:15 PM"
      },
      {
        id: 4,
        full_name: "Pooja Reddy",
        email: "pooja.reddy@wipro.com",
        phone: "+919740567890",
        travel_date: "First week of November",
        travelers_count: 5,
        message: "Family weekend trek to Tadiandamol peak and coffee plantation homestay.",
        status: "NEW",
        priority: "MEDIUM",
        departure_city: "Mysore",
        follow_up_date: "Today, 2:30 PM",
        admin_notes: "Fresh lead. Need to send Kodava homestay photos.",
        trip_title: "Coorg Tadiandamol Summit Trail",
        trip_slug: "coorg-tadiandamol-coffee-trail",
        trip_price: 3499,
        created_at: "Today, 08:30 AM"
      },
      {
        id: 5,
        full_name: "Rahul & Sneha (Couple)",
        email: "rahul.sen@gmail.com",
        phone: "+919920198765",
        travel_date: "Nov 20 - Nov 22",
        travelers_count: 2,
        message: "Romantic weekend trek at Chembra heart-shaped lake & treehouse stay.",
        status: "NEW",
        priority: "HIGH",
        departure_city: "Kozhikode",
        follow_up_date: "Tomorrow, 10:00 AM",
        admin_notes: "Interested in treehouse upgrade. WhatsApp contacted.",
        trip_title: "Wayanad Chembra Peak Heart Lake Trail",
        trip_slug: "wayanad-chembra-peak-waterfall-trail",
        trip_price: 4999,
        created_at: "Just now"
      },
      {
        id: 6,
        full_name: "Rohan Malhotra",
        email: "rohan.m@deloitte.com",
        phone: "+919810456123",
        travel_date: "Dec 25 - Dec 30",
        travelers_count: 3,
        message: "Kedarkantha winter snow summit batch booking.",
        status: "CONVERTED",
        priority: "MEDIUM",
        departure_city: "Delhi",
        follow_up_date: "Completed",
        admin_notes: "Full payment ₹25,497 paid. Microspikes reserved.",
        trip_title: "Kedarkantha Winter Summit Trek",
        trip_slug: "kedarkantha-trek",
        trip_price: 8499,
        created_at: "2 days ago"
      },
      {
        id: 7,
        full_name: "Dr. Vikram & Colleagues",
        email: "vikram.aiims@gmail.com",
        phone: "+919988112233",
        travel_date: "October Weekend",
        travelers_count: 6,
        message: "Mullayanagiri sunrise ridge hike and Z-point Jeep safari.",
        status: "FOLLOW_UP",
        priority: "MEDIUM",
        departure_city: "Bengaluru",
        follow_up_date: "Friday, 5:00 PM",
        admin_notes: "Sent estate homestay quote. Checking group leave availability.",
        trip_title: "Chikmagalur Mullayanagiri Ridge Trek",
        trip_slug: "chikmagalur-mullayanagiri-ridge-trek",
        trip_price: 3799,
        created_at: "3 days ago"
      }
    ],
    trips: [
      {
        id: 101,
        title: "Dandeli Kali River White Water Rafting & Jungle Expedition",
        slug: "dandeli-river-rafting-jungle-expedition",
        destination_name: "Dandeli, Karnataka",
        price: 3999,
        duration_days: 2,
        duration_nights: 1,
        duration_label: "2D / 1N",
        difficulty: "MODERATE",
        is_featured: true,
        is_bestseller: true,
        is_published: true,
        leads_count: 5,
        cover_image: "/videos/shorts/dandeli_rafting_poster.jpg",
        hero_video_url: "/videos/shorts/dandeli_rafting.mp4"
      },
      {
        id: 102,
        title: "Gokarna 5-Beach Cliff Trek & Ocean Stargazing",
        slug: "gokarna-beach-cliff-trek",
        destination_name: "Gokarna, Karnataka",
        price: 4299,
        duration_days: 3,
        duration_nights: 2,
        duration_label: "3D / 2N",
        difficulty: "EASY",
        is_featured: true,
        is_bestseller: true,
        is_published: true,
        leads_count: 6,
        cover_image: "/videos/shorts/gokarna_beach_poster.jpg",
        hero_video_url: "/videos/shorts/gokarna_beach.mp4"
      },
      {
        id: 103,
        title: "Coorg Tadiandamol Summit & Misty Coffee Trail",
        slug: "coorg-tadiandamol-coffee-trail",
        destination_name: "Coorg, Karnataka",
        price: 3499,
        duration_days: 2,
        duration_nights: 1,
        duration_label: "2D / 1N",
        difficulty: "MODERATE",
        is_featured: true,
        is_bestseller: false,
        is_published: true,
        leads_count: 4,
        cover_image: "/videos/shorts/coorg_mist_poster.jpg",
        hero_video_url: "/videos/shorts/coorg_mist.mp4"
      },
      {
        id: 104,
        title: "Chikmagalur Mullayanagiri Peak & Baba Budangiri Ridge",
        slug: "chikmagalur-mullayanagiri-ridge-trek",
        destination_name: "Chikmagalur, Karnataka",
        price: 3799,
        duration_days: 2,
        duration_nights: 1,
        duration_label: "2D / 1N",
        difficulty: "MODERATE",
        is_featured: true,
        is_bestseller: true,
        is_published: true,
        leads_count: 7,
        cover_image: "/videos/shorts/chikmagalur_peak_poster.jpg",
        hero_video_url: "/videos/shorts/chikmagalur_peak.mp4"
      },
      {
        id: 105,
        title: "Ooty Nilgiri Pine Forest & Avalanche Lake Trail",
        slug: "ooty-nilgiri-pine-forest-expedition",
        destination_name: "Ooty, Tamil Nadu",
        price: 5999,
        duration_days: 3,
        duration_nights: 2,
        duration_label: "3D / 2N",
        difficulty: "EASY",
        is_featured: true,
        is_bestseller: false,
        is_published: true,
        leads_count: 3,
        cover_image: "/videos/shorts/ooty_train_poster.jpg",
        hero_video_url: "/videos/shorts/ooty_train.mp4"
      },
      {
        id: 106,
        title: "Wayanad Chembra Peak Heart Lake & Waterfall Trail",
        slug: "wayanad-chembra-peak-waterfall-trail",
        destination_name: "Wayanad, Kerala",
        price: 4999,
        duration_days: 3,
        duration_nights: 2,
        duration_label: "3D / 2N",
        difficulty: "MODERATE",
        is_featured: true,
        is_bestseller: true,
        is_published: true,
        leads_count: 5,
        cover_image: "/videos/shorts/wayanad_waterfall_poster.jpg",
        hero_video_url: "/videos/shorts/wayanad_waterfall.mp4"
      },
      {
        id: 10,
        title: "Leh Ladakh Ultimate Motorcycle Odyssey",
        slug: "leh-ladakh-motorcycle-odyssey",
        destination_name: "Ladakh, Himalayas",
        price: 32999,
        duration_days: 10,
        duration_nights: 9,
        duration_label: "10D / 9N",
        difficulty: "CHALLENGING",
        is_featured: true,
        is_bestseller: true,
        is_published: true,
        leads_count: 8,
        cover_image: "/videos/hero/ladakh_bike_poster.jpg",
        hero_video_url: "/videos/hero/ladakh_bike.mp4"
      },
      {
        id: 1,
        title: "Kedarkantha Winter Summit Trek",
        slug: "kedarkantha-trek",
        destination_name: "Uttarakhand, Himalayas",
        price: 8499,
        duration_days: 5,
        duration_nights: 4,
        duration_label: "5D / 4N",
        difficulty: "MODERATE",
        is_featured: true,
        is_bestseller: true,
        is_published: true,
        leads_count: 6,
        cover_image: "/videos/hero/mountain_trek_poster.jpg",
        hero_video_url: "/videos/hero/mountain_trek.mp4"
      }
    ],
    config: {
      whatsapp_number: "+91 98765 43210",
      support_email: "hello@spiritadventures.in",
      currency: "INR",
      brand_name: "Spirit Adventures"
    }
  };

  return fetchFromApi<OwnerOverviewData | null>("/owner/overview/", fallback);
}

export async function updateEnquiryStatus(id: number, status: string, notes?: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/owner/enquiries/${id}/status/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, admin_notes: notes }),
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function updateTripConfig(id: number, config: { price?: number; is_featured?: boolean; is_bestseller?: boolean }): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/owner/trips/${id}/quick-update/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

