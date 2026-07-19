export const travelData = {
  manali: {
    title: "Plan Your Ultimate Himalayan Escape",
    subtitle: "Discover hidden gems, plan detailed itineraries, and explore safely with our Smart AI Travel Assistant.",
    bgUrl: "/hero-bg.png", // Or a high alpine mountain stock
    exploreCards: [
      { id: 1, title: 'Solang Valley', location: 'Manali', tag: 'Nature', desc: 'A magnificent valley known for summer & winter sports.', img: 'https://images.unsplash.com/photo-1626014496264-b0a34b2ce0b2?q=80&w=600&auto=format&fit=crop' },
      { id: 2, title: 'Key Monastery', location: 'Spiti', tag: 'Adventure', desc: 'A spectacular Tibetan Buddhist monastery overlooking the valley.', img: 'https://images.unsplash.com/photo-1596423735880-5c6fa476dc36?q=80&w=600&auto=format&fit=crop' },
      { id: 3, title: 'Hadimba Temple', location: 'Old Manali', tag: 'Culture', desc: 'A peaceful cedar forest temple and one of Manali classic first-time stops.', img: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=600&auto=format&fit=crop' },
      { id: 4, title: 'Rohtang Pass', location: 'Manali', tag: 'Snow', desc: 'High-altitude snow views, mountain roads, and dramatic Himalayan scenery.', img: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=600&auto=format&fit=crop' },
      { id: 5, title: 'Atal Tunnel', location: 'Himachal', tag: 'Road Trip', desc: 'A modern mountain tunnel route for scenic drives toward Lahaul and Spiti.', img: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=600&auto=format&fit=crop' },
      { id: 6, title: 'Old Manali Cafes', location: 'Old Manali', tag: 'Food', desc: 'Relaxed cafes, music, river views, and backpacker-friendly evenings.', img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop' }
    ],
    cafesAndRentals: [
      { id: 1, name: 'Cafe 1947', type: 'Cafe • Budget Friendly', cost: '₹500 for two', desc: 'Iconic spot to grab legendary burgers and listen to the river.' },
      { id: 2, name: 'Himalayan Bike Rentals', type: 'Transport • Rent', cost: '₹800/day', desc: 'Rent Royal Enfields and heavy mountain bikes nearby.' }
    ],
    itinerary: [
      { id: 'm1', title: 'Day 1: Arrival & Local Exploration', details: 'Mall Road • Hadimba Temple', coords: [32.2396, 77.1887], altitude: '6,726 ft', temp: '15°C', gear: ['Light Jacket', 'Walking Shoes', 'Power Bank'], emergency: { hospital: 'Lady Willingdon Hospital (1km)', police: 'Manali PS (100)' } },
      { id: 'm2', title: 'Day 2: The Snow Point', details: 'Rohtang Pass Tour • Vashisht Baths', coords: [32.3716, 77.2466], altitude: '13,058 ft', temp: '-2°C', gear: ['Heavy Thermal Wear', 'Snow Boots', 'Oxygen Canister'], emergency: { hospital: 'Base Camp Medical Tent (Local)', police: 'Border Police (112)' } },
      { id: 'm3', title: 'Day 3: Adventure & Valleys', details: 'Solang Valley Paragliding', coords: [32.3168, 77.1578], altitude: '8,400 ft', temp: '10°C', gear: ['Windcheater Jacket', 'Sturdy Trail Shoes'], emergency: { hospital: 'Mission Hospital (8km)', police: 'Manali PS (100)' } },
      { id: 'm4', title: 'Day 4: Ancient Villages', details: 'Old Manali • Cafes', coords: [32.2530, 77.1750], altitude: '7,000 ft', temp: '14°C', gear: ['Casual Wear', 'Comfortable Sneakers'], emergency: { hospital: 'Lady Willingdon (2km)', police: 'Manali PS (100)' } }
    ]
  },
  shimla: {
    title: "Experience the Queen of Hills: Shimla",
    subtitle: "Heritage walks, colonial bakeries, and stunning ridge views await you here.",
    bgUrl: "https://images.unsplash.com/photo-1596773539129-8f438a221f7c?q=80&w=1920&auto=format&fit=crop",
    exploreCards: [
      { id: 1, title: 'The Historic Ridge', location: 'Shimla Center', tag: 'Heritage', desc: 'Panoramic views of the snow-clad mountains from the city center.', img: 'https://images.unsplash.com/photo-1599827552599-eccf51a5dd53?q=80&w=600&auto=format&fit=crop' },
      { id: 2, title: 'Kufri Snow Point', location: 'Outside Shimla', tag: 'Snow & Ride', desc: 'A scenic spot known for horse riding and winter skiing.', img: 'https://plus.unsplash.com/premium_photo-1661858826830-58c9735d4ff3?q=80&w=600&auto=format&fit=crop' },
      { id: 3, title: 'Christ Church', location: 'The Ridge', tag: 'Landmark', desc: 'A beautiful colonial-era church and one of Shimla most photographed places.', img: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?q=80&w=600&auto=format&fit=crop' },
      { id: 4, title: 'Jakhoo Temple', location: 'Jakhoo Hill', tag: 'Temple', desc: 'Hilltop temple with city views and a ropeway experience.', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=600&auto=format&fit=crop' },
      { id: 5, title: 'Mall Road', location: 'Shimla', tag: 'Shopping', desc: 'The main walking street for cafes, bakeries, shopping, and evening strolls.', img: 'https://images.unsplash.com/photo-1516406742981-2b7d67ec4ae8?q=80&w=600&auto=format&fit=crop' },
      { id: 6, title: 'Viceregal Lodge', location: 'Shimla', tag: 'History', desc: 'A grand heritage building surrounded by gardens and colonial architecture.', img: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=600&auto=format&fit=crop' }
    ],
    cafesAndRentals: [
      { id: 1, name: 'Wake & Bake', type: 'Cafe • Budget Friendly', cost: '₹400 for two', desc: 'Cozy cafe overlooking Mall Road making incredible crepes and coffee.' },
      { id: 2, name: 'Sita Ram & Son', type: 'Street Food • Local', cost: '₹100 for two', desc: 'World-famous Chole Bhature right on the street corner.' },
      { id: 3, name: 'Heritage Walk Tours', type: 'Activity', cost: '₹500/head', desc: 'Guided walks through British colonial architecture.' }
    ],
    itinerary: [
      { id: 's1', title: 'Day 1: The Mall & Ridge', details: 'Scandal Point • Christ Church', coords: [31.1048, 77.1734], altitude: '7,467 ft', temp: '18°C', gear: ['Comfortable Walking Shoes', 'Camera', 'Light Sweater'], emergency: { hospital: 'IGMC Shimla (2km)', police: 'Shimla Mall Road PS (100)' } },
      { id: 's2', title: 'Day 2: High Altitude Fun', details: 'Kufri & Himalayan Nature Park', coords: [31.0979, 77.2678], altitude: '8,600 ft', temp: '8°C', gear: ['Thick Jacket', 'Warm Gloves', 'Thermals'], emergency: { hospital: 'IGMC Shimla', police: 'Kufri Outpost' } },
      { id: 's3', title: 'Day 3: Heritage & Temples', details: 'Jakhoo Temple Ropeway • Viceregal Lodge', coords: [31.1011, 77.1834], altitude: '8,000 ft', temp: '16°C', gear: ['Water Bottle', 'Windcheater'], emergency: { hospital: 'IGMC Shimla', police: 'Shimla PS' } }
    ]
  },
  bir: {
    title: "Fly High in Bir Billing",
    subtitle: "The Paragliding capital of India. Explore monasteries, cycle trails, and bohemian cafes.",
    bgUrl: "https://images.unsplash.com/photo-1627885060762-cb03f4e3c500?q=80&w=1920&auto=format&fit=crop",
    exploreCards: [
      { id: 1, title: 'Billing Launch Pad', location: 'Billing Peak', tag: 'Paragliding', desc: 'The world\'s second highest paragliding launch site.', img: 'https://images.unsplash.com/photo-1520626880946-b6f7fdf08967?q=80&w=600&auto=format&fit=crop' },
      { id: 2, title: 'Chokling Monastery', location: 'Bir Colony', tag: 'Culture', desc: 'Stunning Tibetan architecture and peaceful chanting sessions.', img: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=600&auto=format&fit=crop' },
      { id: 3, title: 'Bir Landing Site', location: 'Bir', tag: 'Sunset', desc: 'The landing area for paragliders with open lawns and sunset views.', img: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=600&auto=format&fit=crop' },
      { id: 4, title: 'Sherab Ling Monastery', location: 'Bhattu', tag: 'Peace', desc: 'A calm Tibetan monastery complex with prayer halls and mountain air.', img: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=600&auto=format&fit=crop' },
      { id: 5, title: 'Deer Park Institute', location: 'Bir', tag: 'Learning', desc: 'A cultural learning center with talks, workshops, and peaceful campus paths.', img: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=600&auto=format&fit=crop' },
      { id: 6, title: 'Bangoru Waterfall', location: 'Bir', tag: 'Nature', desc: 'A short nature escape for relaxed hiking and waterfall views.', img: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=600&auto=format&fit=crop' }
    ],
    cafesAndRentals: [
      { id: 1, name: 'Northern Cafe', type: 'Cafe • Budget Friendly', cost: '₹350 for two', desc: 'Hidden gem in the pine woods offering mesmerizing sunset views.' },
      { id: 2, name: 'MTB Bir Cycles', type: 'Rentals • Cycles', cost: '₹500/day', desc: 'Rent mountain bikes for easy and beautiful exploring.' },
      { id: 3, name: 'Skyhigh Aviators', type: 'Paragliding • Booking', cost: '₹2,500/flight', desc: 'Safest tandem paragliding operators in Bir Landing Site.' }
    ],
    itinerary: [
      { id: 'b1', title: 'Day 1: Touchdown & Monasteries', details: 'Bir Colony • Sherab Ling Monastery • Cycles', coords: [32.0463, 76.7161], altitude: '5,000 ft', temp: '22°C', gear: ['Cycling Shorts', 'Sunglasses', 'Casual T-Shirts'], emergency: { hospital: 'Baijnath Hospital (14km)', police: 'Bir Police Post' } },
      { id: 'b2', title: 'Day 2: The Flight of a Lifetime', details: 'Billing Peak • Tandem Paragliding', coords: [32.0717, 76.7214], altitude: '8,020 ft', temp: '14°C', gear: ['Action Camera / GoPro', 'Windproof Jacket', 'Tight Shoes'], emergency: { hospital: 'Palampur Civil (25km)', police: 'Bir Police Post' } },
      { id: 'b3', title: 'Day 3: Waterfalls & Sunset', details: 'Bangoru Waterfall • Northern Cafe Sunset', coords: [32.0520, 76.7110], altitude: '4,800 ft', temp: '20°C', gear: ['Hiking Shoes', 'Waterproof Bag'], emergency: { hospital: 'Baijnath Hospital', police: 'Bir Police Post' } }
    ]
  },
  jaipur: {
    title: "Royal Rajasthan Heritage Trails",
    subtitle: "Palaces, desert roads, blue cities, lake views, and handcrafted royal experiences.",
    bgUrl: "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1920&auto=format&fit=crop",
    exploreCards: [
      { id: 1, title: 'Amber Fort', location: 'Jaipur', tag: 'Palace', desc: 'A grand hilltop fort with courtyards, mirror work, and royal views.', img: 'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=600&auto=format&fit=crop' },
      { id: 2, title: 'Lake Pichola', location: 'Udaipur', tag: 'Lake', desc: 'Romantic palace views and sunset boat rides in Rajasthan.', img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=600&auto=format&fit=crop' },
      { id: 3, title: 'Hawa Mahal', location: 'Jaipur', tag: 'Iconic', desc: 'The famous Palace of Winds with a pink sandstone facade.', img: 'https://images.unsplash.com/photo-1599661046827-dacde6976549?q=80&w=600&auto=format&fit=crop' },
      { id: 4, title: 'City Palace Jaipur', location: 'Jaipur', tag: 'Royal', desc: 'Museum rooms, royal courtyards, textiles, and grand palace architecture.', img: 'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=600&auto=format&fit=crop' },
      { id: 5, title: 'Mehrangarh Fort', location: 'Jodhpur', tag: 'Fort', desc: 'A massive blue-city fort with museums, walls, and desert views.', img: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=600&auto=format&fit=crop' },
      { id: 6, title: 'Jal Mahal', location: 'Jaipur', tag: 'Photo Stop', desc: 'A beautiful water palace best viewed during golden hour.', img: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=600&auto=format&fit=crop' }
    ],
    cafesAndRentals: [
      { id: 1, name: 'Peacock Rooftop', type: 'Cafe • Heritage View', cost: '₹900 for two', desc: 'Rooftop dining with fort-style ambience and city views.' },
      { id: 2, name: 'Royal SUV Rentals', type: 'Transport • Chauffeur', cost: '₹3,500/day', desc: 'Private SUV routes for Jaipur, Jodhpur, and Udaipur.' }
    ],
    itinerary: [
      { id: 'r1', title: 'Day 1: Pink City Icons', details: 'Hawa Mahal • City Palace • Jantar Mantar', coords: [26.9124, 75.7873], altitude: '1,410 ft', temp: '31°C', gear: ['Sunglasses', 'Cotton Clothes', 'Water Bottle'], emergency: { hospital: 'SMS Hospital Jaipur', police: 'Jaipur Police (100)' } },
      { id: 'r2', title: 'Day 2: Forts & Markets', details: 'Amber Fort • Nahargarh • Johari Bazaar', coords: [26.9855, 75.8513], altitude: '1,950 ft', temp: '29°C', gear: ['Walking Shoes', 'Hat', 'Camera'], emergency: { hospital: 'Fortis Jaipur', police: 'Tourist Police Jaipur' } },
      { id: 'r3', title: 'Day 3: Blue City Drive', details: 'Jodhpur • Mehrangarh Fort', coords: [26.2389, 73.0243], altitude: '761 ft', temp: '32°C', gear: ['Scarf', 'Sunscreen', 'Power Bank'], emergency: { hospital: 'AIIMS Jodhpur', police: 'Jodhpur Police' } }
    ]
  },
  ubud: {
    title: "Bali Island Getaway",
    subtitle: "Rice terraces, beach clubs, temples, snorkeling, and scooter-friendly island routes.",
    bgUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1920&auto=format&fit=crop",
    exploreCards: [
      { id: 1, title: 'Tegallalang Rice Terrace', location: 'Ubud', tag: 'Nature', desc: 'Layered green rice fields with sunrise walks and cafes.', img: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?q=80&w=600&auto=format&fit=crop' },
      { id: 2, title: 'Nusa Penida Cliffs', location: 'Nusa Penida', tag: 'Beach', desc: 'Dramatic cliffs, turquoise water, and snorkeling points.', img: 'https://images.unsplash.com/photo-1573790387438-4da905039392?q=80&w=600&auto=format&fit=crop' },
      { id: 3, title: 'Ubud Monkey Forest', location: 'Ubud', tag: 'Wildlife', desc: 'A forest sanctuary with temples, walking paths, and playful monkeys.', img: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?q=80&w=600&auto=format&fit=crop' },
      { id: 4, title: 'Tanah Lot Temple', location: 'Bali', tag: 'Temple', desc: 'A sea temple famous for sunset views and ocean waves.', img: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=600&auto=format&fit=crop' },
      { id: 5, title: 'Kelingking Beach', location: 'Nusa Penida', tag: 'Viewpoint', desc: 'A dramatic cliff viewpoint and one of Bali most famous photos.', img: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?q=80&w=600&auto=format&fit=crop' },
      { id: 6, title: 'Uluwatu Temple', location: 'Uluwatu', tag: 'Sunset', desc: 'Clifftop temple, ocean views, and traditional evening performances.', img: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?q=80&w=600&auto=format&fit=crop' }
    ],
    cafesAndRentals: [
      { id: 1, name: 'Alchemy Ubud', type: 'Cafe • Vegan', cost: '₹1,200 for two', desc: 'Healthy bowls and smoothie breakfasts near Ubud center.' },
      { id: 2, name: 'Island Scooter Hire', type: 'Transport • Scooter', cost: '₹650/day', desc: 'Scooter rentals for temples, beaches, and rice terrace routes.' }
    ],
    itinerary: [
      { id: 'u1', title: 'Day 1: Ubud Culture', details: 'Monkey Forest • Ubud Palace • Art Market', coords: [-8.5069, 115.2625], altitude: '600 ft', temp: '27°C', gear: ['Light Clothes', 'Rain Poncho', 'Comfortable Sandals'], emergency: { hospital: 'Ubud Clinic', police: 'Bali Tourist Police' } },
      { id: 'u2', title: 'Day 2: Rice Terraces & Waterfalls', details: 'Tegallalang • Tegenungan Waterfall', coords: [-8.4310, 115.2792], altitude: '900 ft', temp: '26°C', gear: ['Waterproof Bag', 'Mosquito Repellent', 'Camera'], emergency: { hospital: 'Ari Canti Hospital', police: 'Gianyar Police' } },
      { id: 'u3', title: 'Day 3: Nusa Penida', details: 'Kelingking Beach • Crystal Bay', coords: [-8.7278, 115.5444], altitude: '300 ft', temp: '29°C', gear: ['Swimwear', 'Sunscreen', 'Dry Bag'], emergency: { hospital: 'Nusa Penida Clinic', police: 'Harbor Authority' } }
    ]
  },
  paris: {
    title: "Swiss Alps & Paris Romance",
    subtitle: "Iconic city walks, Eiffel evenings, scenic rail journeys, and alpine day trips.",
    bgUrl: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1920&auto=format&fit=crop",
    exploreCards: [
      { id: 1, title: 'Eiffel Tower', location: 'Paris', tag: 'Iconic', desc: 'Classic Paris views, evening lights, and riverside walks.', img: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?q=80&w=600&auto=format&fit=crop' },
      { id: 2, title: 'Zurich Old Town', location: 'Zurich', tag: 'Alps Gateway', desc: 'Lake views, historic lanes, and easy alpine connections.', img: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?q=80&w=600&auto=format&fit=crop' },
      { id: 3, title: 'Louvre Museum', location: 'Paris', tag: 'Museum', desc: 'World-class art, palace architecture, and the famous glass pyramid.', img: 'https://images.unsplash.com/photo-1566139887414-4a6332fe22d7?q=80&w=600&auto=format&fit=crop' },
      { id: 4, title: 'Montmartre', location: 'Paris', tag: 'Culture', desc: 'Art streets, cafes, Sacre-Coeur views, and old Paris charm.', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600&auto=format&fit=crop' },
      { id: 5, title: 'Lake Zurich', location: 'Zurich', tag: 'Lake', desc: 'Clean lakeside walks, mountain views, cruises, and calm city scenes.', img: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?q=80&w=600&auto=format&fit=crop' },
      { id: 6, title: 'Mount Titlis', location: 'Switzerland', tag: 'Alps', desc: 'Snow activities, rotating cable cars, and Swiss alpine views.', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=600&auto=format&fit=crop' }
    ],
    cafesAndRentals: [
      { id: 1, name: 'Seine Dinner Cruise', type: 'Experience • Premium', cost: '₹8,500/person', desc: 'A romantic dinner cruise with illuminated Paris landmarks.' },
      { id: 2, name: 'Eurail Pass Desk', type: 'Transport • Rail', cost: '₹18,000+', desc: 'Rail pass support for Paris, Zurich, and alpine routes.' }
    ],
    itinerary: [
      { id: 'p1', title: 'Day 1: Paris Classics', details: 'Eiffel Tower • Seine • Louvre Outside Walk', coords: [48.8584, 2.2945], altitude: '115 ft', temp: '18°C', gear: ['Light Jacket', 'Walking Shoes', 'Power Bank'], emergency: { hospital: 'Hôpital Européen Georges-Pompidou', police: 'Paris Police (112)' } },
      { id: 'p2', title: 'Day 2: Art & Cafes', details: 'Montmartre • Louvre • Latin Quarter', coords: [48.8867, 2.3431], altitude: '430 ft', temp: '17°C', gear: ['Scarf', 'Comfortable Shoes', 'Umbrella'], emergency: { hospital: 'Hôpital Saint-Louis', police: 'Paris Police' } },
      { id: 'p3', title: 'Day 3: Zurich Rail', details: 'Eurail Journey • Lake Zurich', coords: [47.3769, 8.5417], altitude: '1,339 ft', temp: '12°C', gear: ['Warm Layer', 'Passport Pouch', 'Travel Adapter'], emergency: { hospital: 'University Hospital Zurich', police: 'Zurich Police' } }
    ]
  },
  dubai: {
    title: "Dubai Desert & Smart City Escape",
    subtitle: "Skyscrapers, desert safaris, marina cruises, luxury malls, and futuristic attractions.",
    bgUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1920&auto=format&fit=crop",
    exploreCards: [
      { id: 1, title: 'Burj Khalifa', location: 'Downtown Dubai', tag: 'Smart City', desc: 'World-famous skyline views, fountains, malls, and observation decks.', img: 'https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?q=80&w=600&auto=format&fit=crop' },
      { id: 2, title: 'Dubai Marina', location: 'Marina', tag: 'Waterfront', desc: 'Skyscraper views, yacht cruises, restaurants, and evening walks.', img: 'https://images.unsplash.com/photo-1526495124232-a04e1849168c?q=80&w=600&auto=format&fit=crop' },
      { id: 3, title: 'Burj Al Arab', location: 'Jumeirah', tag: 'Luxury', desc: 'The sail-shaped luxury hotel and one of Dubai most iconic photo stops.', img: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=600&auto=format&fit=crop' },
      { id: 4, title: 'Platinum Heritage Desert Safari', location: 'Dubai Desert', tag: 'Premium Safari', desc: 'Vintage Land Rover rides, desert wildlife, falconry, and cultural camp experiences.', img: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=600&auto=format&fit=crop' },
      { id: 5, title: 'Dubai Miracle Garden', location: 'Al Barsha South', tag: 'Garden', desc: 'A colorful seasonal flower park with huge floral sculptures and photo spots.', img: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=600&auto=format&fit=crop' },
      { id: 6, title: 'Palm Jumeirah & Atlantis', location: 'Palm Jumeirah', tag: 'Resort', desc: 'Palm-shaped island, beach clubs, Atlantis views, and Aquaventure waterpark.', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600&auto=format&fit=crop' },
      { id: 7, title: 'Dubai Frame', location: 'Zabeel Park', tag: 'Viewpoint', desc: 'A giant frame with old Dubai on one side and the modern skyline on the other.', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600&auto=format&fit=crop' },
      { id: 8, title: 'Global Village', location: 'Dubai', tag: 'Evening', desc: 'Food, shopping, cultural pavilions, live shows, and family-friendly night vibes.', img: 'https://images.unsplash.com/photo-1526495124232-a04e1849168c?q=80&w=600&auto=format&fit=crop' }
    ],
    cafesAndRentals: [
      { id: 1, name: 'Dubai Marina Dinner Cruise', type: 'Experience • Luxury', cost: '₹5,500/person', desc: 'Evening skyline cruise with buffet dinner and live music.' },
      { id: 2, name: 'Premium Chauffeur Desk', type: 'Transport • Limousine', cost: '₹9,000/day', desc: 'Airport transfers and city sightseeing with private driver.' }
    ],
    itinerary: [
      { id: 'd1', title: 'Day 1: Downtown Icons', details: 'Burj Khalifa • Dubai Mall • Fountain Show', coords: [25.1972, 55.2744], altitude: '52 ft', temp: '34°C', gear: ['Sunglasses', 'Smart Casuals', 'Power Bank'], emergency: { hospital: 'Mediclinic City Hospital', police: 'Dubai Police (999)' } },
      { id: 'd2', title: 'Day 2: Marina & Palm', details: 'Dubai Marina • Palm Jumeirah • Atlantis', coords: [25.0800, 55.1400], altitude: '20 ft', temp: '33°C', gear: ['Light Clothes', 'Sunscreen', 'Comfortable Shoes'], emergency: { hospital: 'Saudi German Hospital Dubai', police: 'Dubai Tourist Police' } },
      { id: 'd3', title: 'Day 3: Desert Safari', details: 'Dune Bashing • Camel Ride • Camp Dinner', coords: [24.8219, 55.6620], altitude: '350 ft', temp: '31°C', gear: ['Scarf', 'Closed Shoes', 'Water Bottle'], emergency: { hospital: 'Desert Safari First Aid Camp', police: 'Dubai Police' } }
    ]
  },
  alleppey: {
    title: "Kerala Backwaters Relax",
    subtitle: "Houseboats, tea gardens, Ayurveda, calm canals, beaches, and green hill escapes.",
    bgUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1920&auto=format&fit=crop",
    exploreCards: [
      { id: 1, title: 'Alleppey Houseboats', location: 'Alleppey', tag: 'Backwaters', desc: 'Slow houseboat stays through canals, villages, and coconut groves.', img: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=600&auto=format&fit=crop' },
      { id: 2, title: 'Munnar Tea Gardens', location: 'Munnar', tag: 'Hills', desc: 'Rolling tea estates, cool weather, waterfalls, and viewpoint drives.', img: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?q=80&w=600&auto=format&fit=crop' },
      { id: 3, title: 'Marari Beach', location: 'Alleppey', tag: 'Beach', desc: 'A peaceful beach for sunset, seafood, and slow coastal relaxation.', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop' },
      { id: 4, title: 'Kumarakom', location: 'Backwaters', tag: 'Birding', desc: 'Lake views, bird sanctuary routes, canoe rides, and village stays.', img: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=600&auto=format&fit=crop' },
      { id: 5, title: 'Eravikulam National Park', location: 'Munnar', tag: 'Nature', desc: 'Hill views, wildlife, and beautiful green walking routes.', img: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?q=80&w=600&auto=format&fit=crop' },
      { id: 6, title: 'Mattupetty Dam', location: 'Munnar', tag: 'Viewpoint', desc: 'Boating, mountain scenery, and a classic Munnar family stop.', img: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=600&auto=format&fit=crop' }
    ],
    cafesAndRentals: [
      { id: 1, name: 'Private Houseboat Stay', type: 'Stay • Backwater', cost: '₹8,000/night', desc: 'AC houseboat with meals and sunset canal route.' },
      { id: 2, name: 'Munnar Cab Desk', type: 'Transport • Hill Route', cost: '₹3,200/day', desc: 'Cab support for tea gardens, waterfalls, and viewpoints.' }
    ],
    itinerary: [
      { id: 'k1', title: 'Day 1: Backwater Check-in', details: 'Alleppey Houseboat • Village Canal Route', coords: [9.4981, 76.3388], altitude: '3 ft', temp: '29°C', gear: ['Cotton Clothes', 'Mosquito Repellent', 'Sunscreen'], emergency: { hospital: 'Medical College Alappuzha', police: 'Alappuzha Police' } },
      { id: 'k2', title: 'Day 2: Beach & Ayurveda', details: 'Marari Beach • Ayurveda Spa', coords: [9.6017, 76.2961], altitude: '5 ft', temp: '28°C', gear: ['Beachwear', 'Flip Flops', 'Waterproof Pouch'], emergency: { hospital: 'KVM Hospital', police: 'Mararikulam Police' } },
      { id: 'k3', title: 'Day 3: Munnar Tea Trail', details: 'Tea Museum • Mattupetty Dam', coords: [10.0889, 77.0595], altitude: '5,200 ft', temp: '19°C', gear: ['Light Jacket', 'Walking Shoes', 'Camera'], emergency: { hospital: 'Tata General Hospital Munnar', police: 'Munnar Police' } }
    ]
  }
};

export const packagesData = [
  {
    id: 'p1',
    title: 'Himalayan Backpacking',
    region: 'India',
    budget: 'Middle Class',
    transport: ['Volvo Bus', 'Local Train'],
    destinations: ['Manali', 'Kasol', 'Kheerganga'],
    duration: '5N / 6D',
    priceRaw: 12500,
    price: '₹12,500',
    img: 'https://images.unsplash.com/photo-1626014496264-b0a34b2ce0b2?q=80&w=600&auto=format&fit=crop',
    trending: true,
    features: ['Hostels', 'Trekking', 'Campfire']
  },
  {
    id: 'p2',
    title: 'Royal Rajasthan Heritage',
    region: 'India',
    budget: 'Luxury (Rich)',
    transport: ['Flight', 'Private SUV'],
    destinations: ['Jaipur', 'Jodhpur', 'Udaipur'],
    duration: '7N / 8D',
    priceRaw: 85000,
    price: '₹85,000',
    img: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=600&auto=format&fit=crop',
    trending: false,
    features: ['5-Star Palace', 'Private Guide', 'Fine Dining']
  },
  {
    id: 'p3',
    title: 'Bali Island Getaway',
    region: 'World',
    budget: 'Middle Class',
    transport: ['Economy Flight', 'Scooter'],
    destinations: ['Ubud', 'Nusa Penida'],
    duration: '6N / 7D',
    priceRaw: 45000,
    price: '₹45,000',
    img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=600&auto=format&fit=crop',
    trending: true,
    features: ['Beach Villa', 'Snorkeling', 'Breakfast']
  },
  {
    id: 'p4',
    title: 'Swiss Alps & Paris Romance',
    region: 'World',
    budget: 'Luxury (Rich)',
    transport: ['First-Class Flight', 'Eurail'],
    destinations: ['Paris', 'Zurich'],
    duration: '10N / 11D',
    priceRaw: 350000,
    price: '₹3,50,000',
    img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=600&auto=format&fit=crop',
    trending: false,
    features: ['Luxury Suite', 'Ski Pass', 'Eiffel Dinner']
  },
  {
    id: 'p5',
    title: 'Dubai Desert & City',
    region: 'World',
    budget: 'Luxury (Rich)',
    transport: ['Flight', 'Limousine'],
    destinations: ['Dubai City', 'Safari'],
    duration: '4N / 5D',
    priceRaw: 120000,
    price: '₹1,20,000',
    img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600&auto=format&fit=crop',
    trending: true,
    features: ['Burj Khalifa', 'Yacht Ride', 'Desert Safari']
  },
  {
    id: 'p6',
    title: 'Kerala Backwaters Relax',
    region: 'India',
    budget: 'Middle Class',
    transport: ['Train', 'Houseboat'],
    destinations: ['Alleppey', 'Munnar'],
    duration: '4N / 5D',
    priceRaw: 18000,
    price: '₹18,000',
    img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=600&auto=format&fit=crop',
    trending: true,
    features: ['Houseboat Stay', 'Ayurveda', 'All Meals']
  }
];
