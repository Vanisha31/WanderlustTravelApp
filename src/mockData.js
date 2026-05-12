export const travelData = {
  manali: {
    title: "Plan Your Ultimate Himalayan Escape",
    subtitle: "Discover hidden gems, plan detailed itineraries, and explore safely with our Smart AI Travel Assistant.",
    bgUrl: "/hero-bg.png", // Or a high alpine mountain stock
    exploreCards: [
      { id: 1, title: 'Solang Valley', location: 'Manali', tag: 'Nature', desc: 'A magnificent valley known for summer & winter sports.', img: 'https://images.unsplash.com/photo-1626014496264-b0a34b2ce0b2?q=80&w=600&auto=format&fit=crop' },
      { id: 2, title: 'Key Monastery', location: 'Spiti', tag: 'Adventure', desc: 'A spectacular Tibetan Buddhist monastery overlooking the valley.', img: 'https://images.unsplash.com/photo-1596423735880-5c6fa476dc36?q=80&w=600&auto=format&fit=crop' }
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
      { id: 2, title: 'Kufri Snow Point', location: 'Outside Shimla', tag: 'Snow & Ride', desc: 'A scenic spot known for horse riding and winter skiing.', img: 'https://plus.unsplash.com/premium_photo-1661858826830-58c9735d4ff3?q=80&w=600&auto=format&fit=crop' }
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
      { id: 2, title: 'Chokling Monastery', location: 'Bir Colony', tag: 'Culture', desc: 'Stunning Tibetan architecture and peaceful chanting sessions.', img: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=600&auto=format&fit=crop' }
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
