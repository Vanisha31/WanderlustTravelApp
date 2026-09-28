import { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './index.css';
import { travelData, packagesData } from './mockData';
import { api, getAuthToken, setAuthToken } from './api';

// Fix for default Leaflet markers in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper to auto-center map when day changes
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13, { duration: 1.5 });
  }, [center, map]);
  return null;
}

// Custom pulsing radar icon
const radarIcon = new L.divIcon({
  className: 'custom-radar-icon-container',
  html: '<div class="radar-marker"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const storage = {
  get(key, fallback) {
    try {
      const saved = window.localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Demo app: storage can fail in private browsing, so keep the UI usable.
    }
  }
};

const defaultExpenses = [
  { id: 1, title: 'Flight Tickets', amount: 15000, cat: 'Flight', by: 'Me' },
  { id: 2, title: 'Cafe 1947 Lunch', amount: 1200, cat: 'Food', by: 'Rahul' }
];

const destinationKeyMap = {
  manali: 'manali',
  himachal: 'manali',
  kasol: 'manali',
  kheerganga: 'manali',
  shimla: 'shimla',
  bir: 'bir',
  'bir billing': 'bir',
  jaipur: 'jaipur',
  jodhpur: 'jaipur',
  udaipur: 'jaipur',
  rajasthan: 'jaipur',
  bali: 'ubud',
  ubud: 'ubud',
  'nusa penida': 'ubud',
  paris: 'paris',
  zurich: 'paris',
  switzerland: 'paris',
  'dubai city': 'dubai',
  dubai: 'dubai',
  safari: 'dubai',
  kerala: 'alleppey',
  kerela: 'alleppey',
  alleppey: 'alleppey',
  munnar: 'alleppey',
  kochi: 'alleppey',
  cochin: 'alleppey',
  kovalam: 'alleppey'
};

const destinationSearchGroups = [
  { key: 'manali', destination: 'Manali', terms: ['manali', 'himachal', 'kasol', 'kheerganga'] },
  { key: 'shimla', destination: 'Shimla', terms: ['shimla', 'kufri'] },
  { key: 'bir', destination: 'Bir Billing', terms: ['bir billing', 'bir'] },
  { key: 'jaipur', destination: 'Rajasthan', terms: ['rajasthan', 'jaipur', 'jodhpur', 'udaipur'] },
  { key: 'ubud', destination: 'Bali', terms: ['bali', 'ubud', 'nusa penida'] },
  { key: 'paris', destination: 'Paris', terms: ['paris', 'zurich', 'switzerland', 'swiss'] },
  { key: 'dubai', destination: 'Dubai', terms: ['dubai', 'burj khalifa', 'marina', 'desert safari'] },
  { key: 'alleppey', destination: 'Kerala', terms: ['kerala', 'kerela', 'alleppey', 'munnar', 'kochi', 'cochin', 'kovalam'] }
];

function toTitleCase(value) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function findPackageDestination(query) {
  const normalizedQuery = query.toLowerCase();

  for (const pkg of packagesData) {
    const match = pkg.destinations.find((destination) => normalizedQuery.includes(destination.toLowerCase()));
    if (match) return match;
  }

  return null;
}

function resolveDestinationSearch(query) {
  const normalizedQuery = query.trim().toLowerCase();
  const directMatch = destinationSearchGroups.find((group) =>
    group.terms.some((term) => normalizedQuery.includes(term))
  );

  if (directMatch) return directMatch;

  const packageDestination = findPackageDestination(normalizedQuery);
  if (!packageDestination) return null;

  const key = getLocalDestinationKey(packageDestination);
  return key ? { key, destination: getDestinationDisplayName(key) } : null;
}

const destinationFallbackImage = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1600&auto=format&fit=crop';

function createDestinationGuide(location, nearbyPlaces = []) {
  const destination = location.name;
  const points = nearbyPlaces.length ? nearbyPlaces : [
    { name: `${destination} City Centre`, category: 'Local orientation', latitude: location.latitude, longitude: location.longitude },
    { name: `${destination} Cultural District`, category: 'Sightseeing', latitude: location.latitude + 0.015, longitude: location.longitude + 0.01 },
    { name: `${destination} Local Food Quarter`, category: 'Food and culture', latitude: location.latitude - 0.01, longitude: location.longitude - 0.012 }
  ];
  const sightseeing = points.filter((place) => !['cafe', 'restaurant'].includes(place.category)).slice(0, 6);
  const food = points.filter((place) => ['cafe', 'restaurant'].includes(place.category)).slice(0, 3);
  const itineraryPoints = [...sightseeing, ...points].slice(0, 3);
  const defaultDay = (index) => itineraryPoints[index] || points[index] || points[0];

  return {
    title: `Explore ${destination} Your Way`,
    subtitle: `${location.country ? `${location.country} | ` : ''}Live map, nearby highlights, and a flexible first-time visitor plan for ${destination}.`,
    bgUrl: location.imageUrl || destinationFallbackImage,
    exploreCards: sightseeing.map((place, index) => ({
      id: `place-${index}-${place.name}`,
      title: place.name,
      location: destination,
      tag: place.category.replace(/^./, (letter) => letter.toUpperCase()),
      desc: `A nearby ${place.category.toLowerCase()} to consider while planning your ${destination} itinerary.`,
      img: place.imageUrl || location.imageUrl || destinationFallbackImage
    })),
    cafesAndRentals: [...(food.length ? food : [
      { name: `${destination} Local Cafe`, category: 'Cafe' }
    ]),
      { name: `${destination} Local Train / Metro`, category: 'Local transport' }
    ].slice(0, 3).map((place, index) => ({
      id: `local-${index}-${place.name}`,
      name: place.name,
      type: place.category === 'Local transport' ? 'Local transport | Check official route map' : `${place.category} | Nearby recommendation`,
      cost: 'Check live price',
      desc: place.category === 'Local transport'
        ? `Use the official ${destination} transit map for current routes, fares, and service notices.`
        : `A location-based suggestion found for your ${destination} trip.`
    })),
    itinerary: [0, 1, 2].map((index) => {
      const place = defaultDay(index);
      return {
        id: `day-${index + 1}-${destination}`,
        title: `Day ${index + 1}: ${index === 0 ? 'Arrival and orientation' : index === 1 ? 'Local highlights' : 'Flexible discovery'}`,
        details: place.name,
        coords: [place.latitude, place.longitude],
        altitude: 'Local conditions vary',
        temp: 'Check local forecast',
        gear: ['Comfortable shoes', 'Phone charger', 'Water bottle'],
        emergency: { hospital: 'Use local emergency services', police: 'Check local emergency number' }
      };
    })
  };
}

function getLocalDestinationKey(destination) {
  return destinationKeyMap[destination.toLowerCase()];
}

function getDestinationDisplayName(key) {
  const names = {
    manali: 'Manali & Himachal',
    shimla: 'Shimla',
    bir: 'Bir Billing',
    jaipur: 'Rajasthan',
    ubud: 'Bali',
    paris: 'Paris & Switzerland',
    dubai: 'Dubai',
    alleppey: 'Kerala'
  };

  return names[key] || toTitleCase(key);
}

function getInitialDestinationState() {
  const savedBookingDestination = storage.get('wanderlust.bookingDestination', 'Manali');
  const savedCurrentKey = storage.get('wanderlust.currentDestination', 'manali');
  const mappedKey = getLocalDestinationKey(savedBookingDestination);

  return {
    currentKey: mappedKey || savedCurrentKey,
    bookingDestination: savedBookingDestination
  };
}

const bookingTabLabels = {
  flights: 'Flights',
  hotels: 'Hotels',
  homestays: 'Homestays',
  packages: 'Holiday Packages',
  trains: 'Trains',
  buses: 'Buses'
};

const trustStats = [
  { value: '50+', label: 'Curated destinations' },
  { value: '24/7', label: 'Travel assistance' },
  { value: '4.9/5', label: 'Guest experience' },
  { value: 'Secure', label: 'Checkout and PDF tickets' }
];

const luxuryBadges = ['Premium Stay', 'Private Transfer', 'Visa Assistance', 'Breakfast Included', 'Top Rated'];

const testimonials = [
  {
    name: 'Aarohi Mehta',
    trip: 'Dubai luxury escape',
    text: 'Voyara made the first-time Dubai plan feel clear, premium, and easy to book from one place.'
  },
  {
    name: 'Riya Sharma',
    trip: 'Kerala family retreat',
    text: 'The stay, transfers, famous places, and day-wise plan were all visible before booking. It felt very reliable.'
  },
  {
    name: 'Kabir Anand',
    trip: 'Paris and Zurich',
    text: 'The package cards and ticket flow looked polished, like a real travel product rather than a college demo.'
  }
];

const travelCompanions = [
  { value: 'Solo', title: 'Solo', detail: 'Safe stays, flexible timing, compact budget' },
  { value: 'Couple', title: 'Couple', detail: 'Romantic hotels, private transfers, photo spots' },
  { value: 'Family', title: 'Family', detail: 'Family rooms, easy routes, kid-friendly stops' },
  { value: 'Friends', title: 'Friends', detail: 'Group stays, nightlife, adventure picks' }
];

const premiumAddOns = [
  { id: 'airport-transfer', label: 'Airport transfer', price: 1800 },
  { id: 'travel-insurance', label: 'Travel insurance', price: 900 },
  { id: 'guided-tour', label: 'Guided city tour', price: 2500 },
  { id: 'visa-support', label: 'Visa support', price: 3200 }
];

const couponOffers = [
  { code: 'WANDERLUXURY', title: '15% off luxury stays', detail: 'Use on 5 star hotels, resorts, and premium suites.' },
  { code: 'FAMILYFIRST', title: 'Free extra bed support', detail: 'Best for family rooms and multi-room bookings.' },
  { code: 'SOLOSAFE', title: 'Solo safety bundle', detail: 'Includes verified stay picks and group activity suggestions.' },
  { code: 'FRIENDSTRIP', title: 'Group booking saver', detail: 'Split expenses and unlock local experience add-ons.' }
];

const recommendedHotels = [
  {
    name: 'The Oberoi Udaivilas',
    city: 'Udaipur',
    rating: '5.0',
    price: 28500,
    tag: 'Luxury Palace Stay',
    img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=700&auto=format&fit=crop'
  },
  {
    name: 'Atlantis The Palm',
    city: 'Dubai',
    rating: '4.9',
    price: 42600,
    tag: 'Family Resort',
    img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=700&auto=format&fit=crop'
  },
  {
    name: 'Marari Beach Resort',
    city: 'Kerala',
    rating: '4.8',
    price: 14800,
    tag: 'Couple Friendly',
    img: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=700&auto=format&fit=crop'
  },
  {
    name: 'Paris Boutique Grand',
    city: 'Paris',
    rating: '4.9',
    price: 33800,
    tag: 'Romantic Stay',
    img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=700&auto=format&fit=crop'
  }
];

const popularDomesticRoutes = [
  { city: 'Mumbai', price: 11566, img: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?q=80&w=500&auto=format&fit=crop' },
  { city: 'Bangalore', price: 15964, img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=500&auto=format&fit=crop' },
  { city: 'Goa', price: 12539, img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=500&auto=format&fit=crop' },
  { city: 'Jaipur', price: 9178, img: 'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=500&auto=format&fit=crop' },
  { city: 'Kerala', price: 14250, img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=500&auto=format&fit=crop' }
];

const popularInternationalRoutes = [
  { city: 'Dubai', price: 28650, img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=500&auto=format&fit=crop' },
  { city: 'Paris', price: 48900, img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=500&auto=format&fit=crop' },
  { city: 'Bali', price: 39200, img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=500&auto=format&fit=crop' },
  { city: 'Zurich', price: 52700, img: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?q=80&w=500&auto=format&fit=crop' },
  { city: 'Singapore', price: 33400, img: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=500&auto=format&fit=crop' }
];

function isStayBooking(tab) {
  return ['hotels', 'homestays', 'packages'].includes(tab);
}

function getTravelerTags(companion) {
  const tags = {
    Solo: ['Solo Favorite', 'Safety Rated', 'Group-Join Activities', 'Budget Hostels'],
    Couple: ['Couple-Friendly Verified', 'Private Transfer', 'Romantic Stay', 'Safe Policies'],
    Family: ['Family Suites Available', 'Extra Bed Option', 'Child-Friendly Hotel', 'Multi-Room Layout'],
    Friends: ['Friends-Friendly Stay', 'Cost Splitter Ready', 'Group Rooms', 'Nightlife Nearby']
  };

  return tags[companion] || tags.Family;
}

function getAirportCode(destination) {
  const normalized = destination.toLowerCase();
  if (normalized.includes('dubai')) return 'DXB';
  if (normalized.includes('ubud') || normalized.includes('bali')) return 'DPS';
  if (normalized.includes('paris')) return 'CDG';
  if (normalized.includes('zurich')) return 'ZRH';
  if (normalized.includes('jaipur')) return 'JAI';
  if (normalized.includes('alleppey') || normalized.includes('kerala')) return 'COK';
  if (normalized.includes('shimla')) return 'SLV';
  if (normalized.includes('bir')) return 'DHM';
  return 'KUU';
}

function getBookingOptions(tab, destination) {
  const airportCode = getAirportCode(destination);
  const city = destination.replace(' City', '');
  const international = ['DXB', 'DPS', 'CDG', 'ZRH'].includes(airportCode);

  if (tab === 'flights') {
    const base = international ? 18000 : 5200;
    const premium = international ? 32400 : 8400;
    const budget = international ? 14600 : 3900;

    return [
      { id: `${tab}-1`, name: `${airportCode === 'DXB' ? 'Emirates' : 'Air India'} Smart Saver`, time: `DEL 09:45 - ${airportCode} 12:05`, price: base, type: `Economy • ${international ? 'Non-stop' : 'Direct'}`, action: 'Select Seats' },
      { id: `${tab}-2`, name: `${airportCode === 'DXB' ? 'IndiGo Dubai Connect' : 'IndiGo Value Fare'}`, time: `DEL 13:20 - ${airportCode} 16:10`, price: budget, type: 'Economy • 15kg baggage included', action: 'Select Seats' },
      { id: `${tab}-3`, name: `${airportCode === 'DXB' ? 'Vistara Premium Economy' : 'Vistara Flexi Plus'}`, time: `DEL 21:30 - ${airportCode} 00:20`, price: premium, type: 'Premium Economy • Meal included', action: 'Select Seats' }
    ];
  }

  if (tab === 'hotels') {
    return [
      { id: `${tab}-1`, name: `The Grand ${city} Resort`, time: 'Check-in 14:00 • 3 nights', price: international ? 28500 : 12500, type: 'Deluxe Room • Breakfast included', action: 'Choose Room' },
      { id: `${tab}-2`, name: `${city} Central Boutique Stay`, time: 'Check-in 13:00 • Free cancellation', price: international ? 18200 : 7600, type: 'Superior Room • Couple friendly', action: 'Choose Room' },
      { id: `${tab}-3`, name: `${city} Skyline Premium Suites`, time: 'Check-in 15:00 • Pay at hotel', price: international ? 42600 : 18900, type: 'Suite • Pool and city view', action: 'Choose Room' }
    ];
  }

  if (tab === 'homestays') {
    return [
      { id: `${tab}-1`, name: `${city} Heritage Homestay`, time: '2 rooms • Hosted local breakfast', price: international ? 16500 : 6200, type: 'Verified host • Family and couple friendly', action: 'Reserve Stay' },
      { id: `${tab}-2`, name: `${city} Scenic Villa Stay`, time: 'Entire villa • Flexible check-in', price: international ? 24800 : 11800, type: 'Group stay • Kitchen and lounge access', action: 'Reserve Stay' },
      { id: `${tab}-3`, name: `${city} Budget Social Hostel`, time: 'Dorm/private room • Group activities', price: international ? 6400 : 2100, type: 'Solo favorite • Safety rated', action: 'Reserve Stay' }
    ];
  }

  if (tab === 'packages') {
    return [
      { id: `${tab}-1`, name: `${city} Complete Holiday Bundle`, time: 'Flight + hotel + transfer + sightseeing', price: international ? 68900 : 28900, type: 'Most booked • Itinerary included', action: 'Review Package' },
      { id: `${tab}-2`, name: `${city} Family Comfort Package`, time: 'Multi-room stay • Easy routes • Extra bed', price: international ? 82400 : 36500, type: 'Family suites • Child-friendly plan', action: 'Review Package' },
      { id: `${tab}-3`, name: `${city} Luxury Concierge Package`, time: 'Premium flights • 5 star stay • private guide', price: international ? 148000 : 76000, type: 'Luxury tier • Visa support available', action: 'Review Package' }
    ];
  }

  if (tab === 'trains') {
    if (international) {
      return [
        { id: `${tab}-1`, name: `${city} Airport Rail Link`, time: 'Every 20 min • Fast city transfer', price: 950, type: 'Metro/Rail Pass • Digital QR ticket', action: 'Book Pass' },
        { id: `${tab}-2`, name: `${city} City Mobility Pass`, time: '24 hour validity', price: 1650, type: 'Unlimited local transit pass', action: 'Book Pass' },
        { id: `${tab}-3`, name: `${city} Premium Transfer Rail`, time: 'Reserved transfer slot', price: 3200, type: 'First-class airport transfer', action: 'Book Pass' }
      ];
    }

    return [
      { id: `${tab}-1`, name: `${city} Express Chair Car`, time: '06:15 - 13:40', price: 1450, type: 'AC Chair Car • Pantry available', action: 'Select Seats' },
      { id: `${tab}-2`, name: `${city} Overnight Superfast`, time: '21:10 - 07:45', price: 2200, type: '3AC Sleeper • Bedding included', action: 'Select Seats' },
      { id: `${tab}-3`, name: `${city} Vista Coach`, time: '08:30 - 15:25', price: 3100, type: 'Executive Chair Car • Scenic route', action: 'Select Seats' }
    ];
  }

  return [
    { id: `${tab}-1`, name: `${city} Luxury Airport Shuttle`, time: '09:00 - 10:30', price: international ? 2200 : 1200, type: 'AC Coach • Luggage support', action: 'Select Seats' },
    { id: `${tab}-2`, name: `${city} City Sightseeing Coach`, time: '11:30 - 17:00', price: international ? 3600 : 1800, type: 'Guided route • Major attractions', action: 'Select Seats' },
    { id: `${tab}-3`, name: `${city} Private Group Transfer`, time: 'Flexible pickup', price: international ? 6800 : 3200, type: 'Private van • Doorstep pickup', action: 'Select Seats' }
  ];
}

function App() {
  const initialDestination = useMemo(() => getInitialDestinationState(), []);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentKey, setCurrentKey] = useState(initialDestination.currentKey);
  const [bookingDestination, setBookingDestination] = useState(initialDestination.bookingDestination);
  const [externalDestination, setExternalDestination] = useState(null);
  const [destinationSearchError, setDestinationSearchError] = useState('');
  const [isDestinationSearching, setIsDestinationSearching] = useState(false);
  
  // New Features State
  const [currentUser, setCurrentUser] = useState(() => storage.get('wanderlust.currentUser', null));
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(getAuthToken() || storage.get('wanderlust.isLoggedIn', false)));
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({
    name: 'Vanisha Singh',
    email: 'vanisha@example.com',
    password: 'vanisha123'
  });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [bookingTab, setBookingTab] = useState('flights');
  
  // Real-time Booking Flow State
  const [bookingFlowState, setBookingFlowState] = useState('search'); // 'search', 'results', 'seats', 'checkout', 'success'
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [latestBooking, setLatestBooking] = useState(() => storage.get('wanderlust.latestBooking', null));
  const [savedBookings, setSavedBookings] = useState(() => storage.get('wanderlust.savedBookings', []));
  const [bookingError, setBookingError] = useState('');
  const [isBookingSaving, setIsBookingSaving] = useState(false);
  const [isResultsLoading, setIsResultsLoading] = useState(false);
  const [bookingSearch, setBookingSearch] = useState(() => storage.get('wanderlust.bookingSearch', {
    from: 'Delhi',
    departure: '',
    returnDate: '',
    passengers: '2 Adults'
  }));
  const [bookingPreferences, setBookingPreferences] = useState(() => storage.get('wanderlust.bookingPreferences', {
    companion: 'Family',
    cabinClass: 'Premium Economy',
    hotelCategory: '5 Star Luxury',
    addOns: ['airport-transfer']
  }));
  const [paxDetails, setPaxDetails] = useState(() => storage.get('wanderlust.paxDetails', {
    adults: 2,
    children: 0,
    infants: 0,
    rooms: 1
  }));
  const [traveler, setTraveler] = useState(() => storage.get('wanderlust.traveler', {
    name: 'Vanisha Singh',
    email: 'vanisha@example.com',
    phone: '9876543210'
  }));

  // Packages Filter State
  const [allPackages, setAllPackages] = useState(packagesData);
  const [regionFilter, setRegionFilter] = useState('All');
  const [budgetFilter, setBudgetFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('Recommended');
  const [adminStats, setAdminStats] = useState(null);
  const [adminError, setAdminError] = useState('');
  const [newPackage, setNewPackage] = useState({
    title: 'Singapore Smart City Escape',
    region: 'World',
    budget: 'Middle Class',
    destinations: 'Singapore, Sentosa',
    duration: '4N / 5D',
    priceRaw: 72000
  });
  const [aiRequest, setAiRequest] = useState({
    destination: initialDestination.bookingDestination,
    days: 4,
    budget: 80000,
    style: 'Balanced'
  });
  const [aiPlan, setAiPlan] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  let filteredPackages = allPackages.filter(pkg => {
    const regionMatch = regionFilter === 'All' || pkg.region === regionFilter;
    const budgetMatch = budgetFilter === 'All' || pkg.budget === budgetFilter;
    return regionMatch && budgetMatch;
  });

  if (sortOrder === 'Price: Low to High') {
    filteredPackages.sort((a, b) => a.priceRaw - b.priceRaw);
  } else if (sortOrder === 'Price: High to Low') {
    filteredPackages.sort((a, b) => b.priceRaw - a.priceRaw);
  }

  const handleBookPackage = (pkg) => {
    const primaryDestination = pkg.destinations[0];
    const localDestinationKey = getLocalDestinationKey(primaryDestination);

    // Scroll to booking section
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
    setBookingTab('flights'); // default to flights for global packages
    setSearchQuery(primaryDestination);
    setBookingDestination(primaryDestination);
    if (localDestinationKey) {
      setCurrentKey(localDestinationKey);
      setItinerary(travelData[localDestinationKey].itinerary);
      setSelectedDay(travelData[localDestinationKey].itinerary[0]);
      storage.set('wanderlust.currentDestination', localDestinationKey);
    }
  };

  const bookingOptions = useMemo(() => getBookingOptions(bookingTab, bookingDestination), [bookingTab, bookingDestination]);
  const selectedAddOnsTotal = premiumAddOns
    .filter((addOn) => bookingPreferences.addOns.includes(addOn.id))
    .reduce((total, addOn) => total + addOn.price, 0);
  const selectedBookingUnits = selectedVehicle
    ? (isStayBooking(bookingTab) ? paxDetails.rooms : selectedSeats.length)
    : 0;
  const selectedBaseAmount = selectedVehicle ? selectedVehicle.price * selectedBookingUnits : 0;

  const toggleAddOn = (addOnId) => {
    setBookingPreferences((current) => ({
      ...current,
      addOns: current.addOns.includes(addOnId)
        ? current.addOns.filter((id) => id !== addOnId)
        : [...current.addOns, addOnId]
    }));
  };

  const handleSearchBooking = () => {
    setIsResultsLoading(true);
    setBookingFlowState('results');
    window.setTimeout(() => setIsResultsLoading(false), 450);
  };
  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setSelectedSeats(isStayBooking(bookingTab) ? [`${paxDetails.rooms} Room${paxDetails.rooms > 1 ? 's' : ''}`] : []);
    setBookingFlowState(isStayBooking(bookingTab) ? 'checkout' : 'seats');
  };
  const toggleSeat = (seatNum) => {
    if (selectedSeats.includes(seatNum)) setSelectedSeats(selectedSeats.filter(s => s !== seatNum));
    else setSelectedSeats([...selectedSeats, seatNum]);
  };
  const handleCheckout = () => setBookingFlowState('checkout');
  const handleConfirm = async () => {
    setBookingError('');

    if (!isLoggedIn || !getAuthToken()) {
      setBookingError('Please sign in or create an account before confirming your booking.');
      setAuthMode('login');
      setShowLoginModal(true);
      return;
    }

    setIsBookingSaving(true);

    const bookingPayload = {
      vehicleName: selectedVehicle.name,
      vehicleType: selectedVehicle.type,
      route: `${bookingSearch.from} to ${bookingDestination}`,
      transportType: bookingTab,
      seats: selectedSeats,
      amount: selectedBaseAmount + selectedAddOnsTotal + 150,
      search: bookingSearch,
      preferences: bookingPreferences,
      traveler,
      destination: bookingDestination
    };

    try {
      const savedBooking = await api.createBooking(bookingPayload);
      setLatestBooking(savedBooking);
      setSavedBookings((current) => [savedBooking, ...current.filter((item) => item.id !== savedBooking.id)]);
      setBookingFlowState('success');
    } catch (error) {
      setBookingError(error.message || 'We could not save this booking. Please try again.');
    } finally {
      setIsBookingSaving(false);
    }
  };
  const resetBooking = () => { setBookingFlowState('search'); setSelectedVehicle(null); setSelectedSeats([]); };

  const refreshAdminData = async () => {
    try {
      const [packages, stats] = await Promise.all([api.getPackages(), api.getAdminStats()]);
      setAllPackages(packages);
      setAdminStats(stats);
    } catch {
      setAllPackages(packagesData);
    }
  };

  const handleCreatePackage = async (event) => {
    event.preventDefault();
    setAdminError('');
    try {
      const created = await api.createPackage({
        ...newPackage,
        priceRaw: Number(newPackage.priceRaw)
      });
      setAllPackages((current) => [created, ...current]);
      await refreshAdminData();
    } catch (error) {
      setAdminError(error.message);
    }
  };

  const handleGenerateAiPlan = async (event) => {
    event.preventDefault();
    setAiLoading(true);
    try {
      const plan = await api.createAiPlan(aiRequest);
      setAiPlan(plan);
    } finally {
      setAiLoading(false);
    }
  };
  
  const destData = useMemo(() => externalDestination || travelData[currentKey] || travelData.manali, [currentKey, externalDestination]);
  const plannerDestinationName = externalDestination?.name || getDestinationDisplayName(currentKey);
  
  // State for interactive features
  const [itinerary, setItinerary] = useState(() => storage.get('wanderlust.itinerary.manali', travelData.manali.itinerary));
  const [selectedDay, setSelectedDay] = useState(destData.itinerary[0]);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  // --- NEW KILLER FEATURES STATE ---
  // 1. Live Radar
  const [radarActive, setRadarActive] = useState(false);
  const [mapLayer, setMapLayer] = useState('street');
  const radarPoints = radarActive ? [
    { id: 1, pos: [selectedDay.coords[0] + 0.005, selectedDay.coords[1] + 0.005], label: 'ðŸ¥ Medical Shop' },
    { id: 2, pos: [selectedDay.coords[0] - 0.003, selectedDay.coords[1] + 0.008], label: 'ðŸ” Street Food' },
    { id: 3, pos: [selectedDay.coords[0] + 0.006, selectedDay.coords[1] - 0.004], label: 'ðŸ§ ATM' }
  ] : [];

  // 2. Trip Wallet
  const [expenses, setExpenses] = useState(() => storage.get('wanderlust.expenses', defaultExpenses));
  const [newExpense, setNewExpense] = useState({ title: '', amount: '', cat: 'Shopping' });
  const [splitter, setSplitter] = useState(() => storage.get('wanderlust.splitter', {
    people: 4,
    paidBy: 'Vanisha'
  }));
  const totalBudget = 50000;
  const spentAmount = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const progressPercent = Math.min((spentAmount / totalBudget) * 100, 100);
  const perPersonSplit = splitter.people > 0 ? Math.ceil(spentAmount / splitter.people) : spentAmount;

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpense.title || !newExpense.amount) return;
    setExpenses([{ id: Date.now(), ...newExpense, by: 'Me' }, ...expenses]);
    setNewExpense({ title: '', amount: '', cat: 'Shopping' });
  };

  // 3. Offline Vault
  const [isVaultLocked, setIsVaultLocked] = useState(true);
  const [pinInput, setPinInput] = useState('');
  
  const handlePinPress = (num) => {
    if (pinInput.length < 4) {
      const newPin = pinInput + num;
      setPinInput(newPin);
      if (newPin === '1234') {
        setTimeout(() => setIsVaultLocked(false), 300);
      } else if (newPin.length === 4) {
        setTimeout(() => setPinInput(''), 400); // wrong pin reset
      }
    }
  };

  // Sync state when destination changes
  useEffect(() => {
    const savedItinerary = storage.get(`wanderlust.itinerary.${currentKey}`, destData.itinerary);
    setItinerary(savedItinerary);
    setSelectedDay(savedItinerary[0] || destData.itinerary[0]);
    storage.set('wanderlust.currentDestination', currentKey);
  }, [currentKey, destData]);

  useEffect(() => {
    storage.set(`wanderlust.itinerary.${currentKey}`, itinerary);
  }, [currentKey, itinerary]);

  useEffect(() => {
    storage.set('wanderlust.expenses', expenses);
  }, [expenses]);

  useEffect(() => {
    storage.set('wanderlust.isLoggedIn', isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    storage.set('wanderlust.currentUser', currentUser);
  }, [currentUser]);

  useEffect(() => {
    storage.set('wanderlust.latestBooking', latestBooking);
  }, [latestBooking]);

  useEffect(() => {
    storage.set('wanderlust.savedBookings', savedBookings);
  }, [savedBookings]);

  useEffect(() => {
    storage.set('wanderlust.bookingSearch', bookingSearch);
  }, [bookingSearch]);

  useEffect(() => {
    storage.set('wanderlust.bookingPreferences', bookingPreferences);
  }, [bookingPreferences]);

  useEffect(() => {
    storage.set('wanderlust.paxDetails', paxDetails);
  }, [paxDetails]);

  useEffect(() => {
    storage.set('wanderlust.splitter', splitter);
  }, [splitter]);

  useEffect(() => {
    storage.set('wanderlust.bookingDestination', bookingDestination);
    const localDestinationKey = getLocalDestinationKey(bookingDestination);
    if (localDestinationKey && localDestinationKey !== currentKey) {
      setCurrentKey(localDestinationKey);
    }
  }, [bookingDestination, currentKey]);

  useEffect(() => {
    storage.set('wanderlust.traveler', traveler);
  }, [traveler]);

  useEffect(() => {
    let isMounted = true;

    Promise.all([api.getBookings(), api.getPackages(), api.getAdminStats().catch(() => null), api.me().catch(() => ({ user: null }))])
      .then(([bookings, packages, stats, session]) => {
        if (isMounted) {
          setSavedBookings(bookings);
          setAllPackages(packages);
          setAdminStats(stats);
          if (session.user) {
            setCurrentUser(session.user);
            setIsLoggedIn(true);
          } else if (!getAuthToken()) {
            setIsLoggedIn(false);
          }
        }
      })
      .catch(() => {
        // Keep locally saved bookings visible if the API is not running.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const match = resolveDestinationSearch(searchQuery);

    if (match) {
      setDestinationSearchError('');
      setExternalDestination(null);
      setCurrentKey(match.key);
      setBookingDestination(match.destination);
      return;
    }

    const query = searchQuery.trim();
    if (!query) return;

    setDestinationSearchError('');
    setIsDestinationSearching(true);
    api.findDestination(query)
      .then((location) => {
        setExternalDestination({ ...createDestinationGuide(location), name: location.name });
        setCurrentKey('custom');
        setBookingDestination(location.name);
        return api.getNearbyPlaces(location.latitude, location.longitude)
          .then((nearbyPlaces) => {
            setExternalDestination({ ...createDestinationGuide(location, nearbyPlaces), name: location.name });
          })
          .catch(() => {
            // The map and starter plan are already visible if the nearby directory is unavailable.
          });
      })
      .catch((error) => setDestinationSearchError(error.message || 'Destination search is unavailable right now.'))
      .finally(() => setIsDestinationSearching(false));
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => { e.target.style.opacity = '0.5'; }, 0);
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    if (draggedItemIndex === index) return;
    const newList = [...itinerary];
    const draggedItemContent = newList[draggedItemIndex];
    newList.splice(draggedItemIndex, 1);
    newList.splice(index, 0, draggedItemContent);
    setDraggedItemIndex(index);
    setItinerary(newList);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItemIndex(null);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const result = authMode === 'register'
        ? await api.register(authForm)
        : await api.login({ email: authForm.email, password: authForm.password });
      setAuthToken(result.token);
      setCurrentUser(result.user);
      setTraveler((savedTraveler) => ({
        ...savedTraveler,
        name: result.user.name,
        email: result.user.email
      }));
      setIsLoggedIn(true);
      setShowLoginModal(false);
      const bookings = await api.getBookings();
      setSavedBookings(bookings);
      await refreshAdminData();
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setIsLoggedIn(false);
    setSavedBookings([]);
  };

  return (
    <>
      {/* Login Modal */}
      {showLoginModal && (
        <div className="modal-overlay">
          <div className="login-modal">
            <button className="close-btn" onClick={() => setShowLoginModal(false)}>Ã—</button>
            <h2 style={{ marginBottom: '8px', color: 'var(--secondary)' }}>{authMode === 'register' ? 'Create Voyara Account' : 'Welcome Back'}</h2>
            <p style={{ marginBottom: '20px', color: '#6b7280', lineHeight: 1.5 }}>
              {authMode === 'register' ? 'Register to save bookings to your account.' : 'Login to see your saved trips and admin access.'}
            </p>
            <form onSubmit={handleLoginSubmit}>
              {authMode === 'register' && (
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    value={authForm.name}
                    onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })}
                    required
                  />
                </div>
              )}
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={authForm.email}
                  onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={authForm.password}
                  onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                  required
                />
              </div>
              {authError && <div className="auth-error">{authError}</div>}
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                {authLoading ? 'Please wait...' : authMode === 'register' ? 'Create Account' : 'Login Securely'}
              </button>
            </form>
            <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
              {authMode === 'register' ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                className="auth-mode-btn"
                onClick={() => {
                  setAuthError('');
                  setAuthMode(authMode === 'register' ? 'login' : 'register');
                }}
              >
                {authMode === 'register' ? 'Login' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      )}

      <nav className="nav container">
        <div className="nav-brand">Voy<span>ara</span></div>
        <div className="nav-links">
          <a href="#packages">Packages</a>
          <a href="#booking">Bookings</a>
          <a href="#trips">My Trips</a>
          <a href="#ai-planner">AI Planner</a>
          <a href="#admin">Admin</a>
          <a href="#explore">Explore</a>
          <a href="#planner">Planner</a>
          <a href="#wallet">Wallet</a>
          <a href="#vault">Vault</a>
        </div>
        {isLoggedIn ? (
          <div className="user-profile">
            <div className="avatar">{(currentUser?.name || 'Vanisha Singh').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</div>
            <span style={{ color: 'white', fontWeight: 'bold', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{currentUser?.name || 'Vanisha Singh'}</span>
            <button className="logout-btn" type="button" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <button className="btn-primary" onClick={() => setShowLoginModal(true)}>Sign In</button>
        )}
      </nav>

      {/* Hero Section Dynamic */}
      <header className="hero" style={{ background: `url('${destData.bgUrl}') center/cover no-repeat` }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-kicker">Curated luxury journeys by Voyara</div>
          <h1 className="hero-title">{destData.title}</h1>
          <p className="hero-subtitle">{destData.subtitle}</p>
          <div className="luxury-badge-row hero-badges">
            {luxuryBadges.slice(0, 4).map((badge) => (
              <span className="luxury-badge" key={badge}>{badge}</span>
            ))}
          </div>
          
          <form className="search-bar" onSubmit={handleSearch}>
            <input 
              type="text" 
              className="search-input" 
              placeholder="e.g. Try typing 'Bir Billing' or 'Shimla'..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn" disabled={isDestinationSearching}>{isDestinationSearching ? 'Finding place...' : 'Search & Go'}</button>
          </form>
          {destinationSearchError && <p className="destination-search-error">{destinationSearchError}</p>}
        </div>
      </header>

      <main className="container">
        <section className="luxury-trust-section">
          <div className="trust-grid">
            {trustStats.map((stat) => (
              <div className="trust-card" key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="luxury-intro-section">
          <div className="luxury-intro-copy">
            <span className="eyebrow">Premium travel desk</span>
            <h2>Book like a real travel platform, plan like a personal concierge.</h2>
            <p>
              Choose flights, premium hotels, transfers, local experiences, and a travel style for solo, couple, family, or friends trips.
            </p>
          </div>
          <div className="luxury-mini-panel">
            <div className="mini-panel-top">
              <span>Popular today</span>
              <strong>{bookingDestination}</strong>
            </div>
            <div className="luxury-badge-row">
              {luxuryBadges.map((badge) => (
                <span className="luxury-badge dark" key={badge}>{badge}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="offers-section" aria-label="Offers and coupons">
          <div className="offers-header">
            <div>
              <span className="eyebrow">Live style offers</span>
              <h2>Offers and coupons</h2>
            </div>
            <p>Commercial booking platforms show deals early, so these cards make Voyara feel more market-ready.</p>
          </div>
          <div className="offers-grid">
            {couponOffers.map((offer) => (
              <article className="offer-card" key={offer.code}>
                <span>{offer.code}</span>
                <h3>{offer.title}</h3>
                <p>{offer.detail}</p>
              </article>
            ))}
          </div>
        </section>
        
        {/* MakeMyTrip Style Booking Dashboard */}
        <section id="booking" className="section" style={{ paddingTop: '40px' }}>
          <div className="booking-dashboard">
            <div className="booking-tabs">
              {['flights', 'hotels', 'homestays', 'packages', 'trains', 'buses'].map(tab => (
                <button 
                  key={tab} 
                  className={`tab-btn ${bookingTab === tab ? 'active' : ''}`}
                  onClick={() => setBookingTab(tab)}
                >
                  {bookingTabLabels[tab]}
                </button>
              ))}
            </div>
            
            <div className="booking-form-area">
              {bookingFlowState === 'search' && (
                <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  <div className="service-switcher-note">
                    <strong>Compare and book</strong>
                    <span>Flights, hotels, homestays, holiday packages, trains, and buses from one search panel.</span>
                  </div>
                  <div className="form-row">
                    <div className="input-box">
                      <label>FROM</label>
                      <input
                        type="text"
                        placeholder="Delhi"
                        value={bookingSearch.from}
                        onChange={(e) => setBookingSearch({ ...bookingSearch, from: e.target.value })}
                      />
                    </div>
                    <div className="swap-icon">⇄</div>
                    <div className="input-box">
                      <label>TO</label>
                      <input type="text" placeholder="Destination" value={bookingDestination} readOnly />
                    </div>
                    <div className="input-box">
                      <label>DEPARTURE</label>
                      <input
                        type="date"
                        value={bookingSearch.departure}
                        onChange={(e) => setBookingSearch({ ...bookingSearch, departure: e.target.value })}
                      />
                    </div>
                    {bookingTab === 'flights' && (
                      <div className="input-box">
                        <label>RETURN</label>
                        <input
                          type="date"
                          value={bookingSearch.returnDate}
                          onChange={(e) => setBookingSearch({ ...bookingSearch, returnDate: e.target.value })}
                        />
                      </div>
                    )}
                    <div className="input-box">
                      <label>PASSENGERS</label>
                      <input
                        type="text"
                        value={`${paxDetails.adults} Adults, ${paxDetails.children} Children, ${paxDetails.infants} Infants, ${paxDetails.rooms} Room${paxDetails.rooms > 1 ? 's' : ''}`}
                        onChange={(e) => setBookingSearch({ ...bookingSearch, passengers: e.target.value })}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="pax-selector">
                    {[
                      { key: 'adults', label: 'Adults', hint: '12+ years', min: 1 },
                      { key: 'children', label: 'Children', hint: '2-11 years', min: 0 },
                      { key: 'infants', label: 'Infants', hint: 'Below 2 years', min: 0 },
                      { key: 'rooms', label: 'Rooms', hint: 'Hotel rooms', min: 1 }
                    ].map((item) => (
                      <div className="pax-row" key={item.key}>
                        <div>
                          <strong>{item.label}</strong>
                          <span>{item.hint}</span>
                        </div>
                        <div className="stepper">
                          <button
                            type="button"
                            onClick={() => setPaxDetails({ ...paxDetails, [item.key]: Math.max(item.min, paxDetails[item.key] - 1) })}
                          >
                            -
                          </button>
                          <span>{paxDetails[item.key]}</span>
                          <button
                            type="button"
                            onClick={() => setPaxDetails({ ...paxDetails, [item.key]: paxDetails[item.key] + 1 })}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="trip-style-panel">
                    <div className="trip-style-header">
                      <div>
                        <span className="eyebrow">Traveller type</span>
                        <h3>Who is this trip for?</h3>
                      </div>
                      <p>We will show more useful hotels, flights, and add-ons for this travel style.</p>
                    </div>
                    <div className="companion-grid">
                      {travelCompanions.map((item) => (
                        <button
                          type="button"
                          key={item.value}
                          className={`companion-card ${bookingPreferences.companion === item.value ? 'active' : ''}`}
                          onClick={() => setBookingPreferences({ ...bookingPreferences, companion: item.value })}
                        >
                          <strong>{item.title}</strong>
                          <span>{item.detail}</span>
                        </button>
                      ))}
                    </div>
                    <div className="premium-controls">
                      <label>
                        <span>{isStayBooking(bookingTab) ? 'Stay category' : 'Flight class'}</span>
                        <select
                          className="filter-select"
                          value={isStayBooking(bookingTab) ? bookingPreferences.hotelCategory : bookingPreferences.cabinClass}
                          onChange={(e) => {
                            const key = isStayBooking(bookingTab) ? 'hotelCategory' : 'cabinClass';
                            setBookingPreferences({ ...bookingPreferences, [key]: e.target.value });
                          }}
                        >
                          {isStayBooking(bookingTab) ? (
                            <>
                              <option>5 Star Luxury</option>
                              <option>Boutique Premium</option>
                              <option>Family Resort</option>
                              <option>Budget Comfort</option>
                            </>
                          ) : (
                            <>
                              <option>Economy</option>
                              <option>Premium Economy</option>
                              <option>Business Class</option>
                              <option>First Class</option>
                            </>
                          )}
                        </select>
                      </label>
                      <div className="add-ons-group">
                        <span>Add services</span>
                        <div className="add-on-chips">
                          {premiumAddOns.map((addOn) => (
                            <button
                              type="button"
                              key={addOn.id}
                              className={`add-on-chip ${bookingPreferences.addOns.includes(addOn.id) ? 'selected' : ''}`}
                              onClick={() => toggleAddOn(addOn.id)}
                            >
                              {addOn.label} + Rs. {addOn.price.toLocaleString()}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="search-booking-btn" onClick={handleSearchBooking}>SEARCH</button>
                </div>
              )}

              {bookingFlowState === 'results' && (
                <div className="booking-results" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  <h3 style={{ marginBottom: '8px', color: 'var(--secondary)' }}>{bookingTabLabels[bookingTab]} from {bookingSearch.from} to {bookingDestination}</h3>
                  <p className="results-context">
                    {bookingPreferences.companion} trip - {paxDetails.adults + paxDetails.children + paxDetails.infants} travellers - {paxDetails.rooms} room{paxDetails.rooms > 1 ? 's' : ''} - Add-ons Rs. {selectedAddOnsTotal.toLocaleString()}
                  </p>
                  {isResultsLoading ? [1, 2, 3].map((item) => (
                    <div className="vehicle-card booking-skeleton" key={item} aria-label="Loading travel options">
                      <div className="skeleton-lines"><span></span><span></span><span></span></div>
                      <div className="skeleton-action"></div>
                    </div>
                  )) : bookingOptions.map(v => (
                    <div key={v.id} className="vehicle-card">
                      <div>
                        <h4 style={{ fontSize: '18px', marginBottom: '4px', color: 'var(--secondary)' }}>{v.name}</h4>
                        <p style={{ color: '#6b7280', fontSize: '14px' }}>{v.type} • {v.time}</p>
                        <div className="result-perks">
                          {getTravelerTags(bookingPreferences.companion).map((tag) => (
                            <span key={tag}>{tag}</span>
                          ))}
                          <span>{isStayBooking(bookingTab) ? bookingPreferences.hotelCategory : bookingPreferences.cabinClass}</span>
                          {bookingPreferences.addOns.slice(0, 2).map((id) => (
                            <span key={id}>{premiumAddOns.find((addOn) => addOn.id === id)?.label}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <h3 style={{ color: 'var(--primary)', marginBottom: '8px', fontSize: '24px' }}>Rs. {v.price.toLocaleString()}</h3>
                        <button className="btn-primary" onClick={() => handleSelectVehicle(v)} style={{ padding: '8px 20px' }}>{v.action}</button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setBookingFlowState('search')} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}>Back to Search</button>
                </div>
              )}

              {bookingFlowState === 'seats' && (
                <div className="seat-selection" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  <h3 style={{ marginBottom: '20px', color: 'var(--secondary)', textAlign: 'center' }}>Select Your Seats</h3>
                  
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px', fontSize: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div className="seat-legend available"></div> Available</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div className="seat-legend booked"></div> Booked</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div className="seat-legend selected"></div> Selected</div>
                  </div>

                  <div className="bus-layout">
                    <div className="steering-wheel">Driver</div>
                    <div className="seats-grid">
                      {Array.from({ length: 40 }).map((_, i) => {
                        const seatNum = i + 1;
                        const isBooked = [3, 7, 12, 18, 22, 29, 31].includes(seatNum);
                        const isSelected = selectedSeats.includes(seatNum);
                        // Add an aisle empty space in CSS grid logic
                        return (
                          <div 
                            key={seatNum} 
                            className={`seat ${isBooked ? 'booked' : isSelected ? 'selected' : 'available'}`}
                            onClick={() => !isBooked && toggleSeat(seatNum)}
                          >
                            {seatNum}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="seat-footer">
                    <button onClick={() => setBookingFlowState('results')} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}>Back</button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>Selected: {selectedSeats.length} seats</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--secondary)' }}>Total: Rs. {(selectedVehicle.price * selectedSeats.length).toLocaleString()}</div>
                      </div>
                      <button className="btn-primary" disabled={selectedSeats.length === 0} onClick={handleCheckout} style={{ opacity: selectedSeats.length === 0 ? 0.5 : 1 }}>Proceed</button>
                    </div>
                  </div>
                </div>
              )}

              {bookingFlowState === 'checkout' && (
                <div className="checkout-view" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  <h3 style={{ marginBottom: '20px', color: 'var(--secondary)' }}>Review Booking</h3>
                  <div className="checkout-grid">
                    <div className="checkout-summary">
                      <h4>{selectedVehicle.name}</h4>
                      <p style={{ color: '#6b7280', marginBottom: '12px' }}>{selectedVehicle.time}</p>
                      <div className="summary-row">
                        <span>Route</span>
                        <span>{bookingSearch.from} to {bookingDestination}</span>
                      </div>
                      <div className="summary-row">
                        <span>Travel date</span>
                        <span>{bookingSearch.departure || 'Flexible date'}</span>
                      </div>
                      <div className="summary-row">
                        <span>Trip type</span>
                        <span>{bookingPreferences.companion}</span>
                      </div>
                      <div className="summary-row">
                        <span>{isStayBooking(bookingTab) ? 'Stay category' : 'Travel class'}</span>
                        <span>{isStayBooking(bookingTab) ? bookingPreferences.hotelCategory : bookingPreferences.cabinClass}</span>
                      </div>
                      <div className="summary-row">
                        <span>{isStayBooking(bookingTab) ? `Rooms (${paxDetails.rooms})` : `Seats (${selectedSeats.join(', ')})`}</span>
                        <span>Rs. {selectedBaseAmount.toLocaleString()}</span>
                      </div>
                      <div className="summary-row">
                        <span>Premium add-ons</span>
                        <span>Rs. {selectedAddOnsTotal.toLocaleString()}</span>
                      </div>
                      <div className="summary-row">
                        <span>Taxes & Fees</span>
                        <span>Rs. 150</span>
                      </div>
                      <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '12px 0' }} />
                      <div className="summary-row total">
                        <span>Total Amount</span>
                        <span>Rs. {(selectedBaseAmount + selectedAddOnsTotal + 150).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="traveler-form">
                      <h4>Traveler Details</h4>
                      <div className="form-group">
                        <label>Full Name</label>
                        <input value={traveler.name} onChange={(e) => setTraveler({ ...traveler, name: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={traveler.email} onChange={(e) => setTraveler({ ...traveler, email: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Phone</label>
                        <input value={traveler.phone} onChange={(e) => setTraveler({ ...traveler, phone: e.target.value })} />
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px' }}>
                    <button onClick={() => setBookingFlowState(isStayBooking(bookingTab) ? 'results' : 'seats')} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}>Back</button>
                    <button className="btn-primary" disabled={isBookingSaving} onClick={handleConfirm} style={{ background: '#22c55e', padding: '16px 40px', fontSize: '18px', opacity: isBookingSaving ? 0.65 : 1 }}>
                      {isBookingSaving ? 'Saving Booking...' : 'Confirm & Pay securely'}
                    </button>
                  </div>
                </div>
              )}

              {bookingFlowState === 'success' && (
                <div className="success-view" style={{ textAlign: 'center', padding: '20px', animation: 'fadeIn 0.5s ease-out' }}>
                  <div style={{ fontSize: '80px', marginBottom: '16px', animation: 'bounce 1s infinite' }}>✓</div>
                  <h2 style={{ color: '#22c55e', marginBottom: '8px', fontSize: '32px' }}>Booking Confirmed!</h2>
                  <p style={{ color: '#6b7280', marginBottom: '40px', fontSize: '18px' }}>Your tickets have been successfully generated.</p>
                  {bookingError && <div className="booking-error">{bookingError}</div>}
                  
                  <div className="ticket-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
                      <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--secondary)' }}>DEL</span>
                      <span style={{ color: 'var(--primary)', fontSize: '20px' }}>→</span>
                      <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--secondary)' }}>{getAirportCode(bookingDestination)}</span>
                    </div>
                    <h3 style={{ marginBottom: '4px', fontSize: '20px' }}>{selectedVehicle.name}</h3>
                    <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>{selectedVehicle.time}</p>
                    
                    <div className="ticket-details">
                      <div>
                        <p className="label">SEATS</p>
                        <p className="value">{selectedSeats.join(', ')}</p>
                      </div>
                      <div>
                        <p className="label">TRIP TYPE</p>
                        <p className="value">{bookingPreferences.companion}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p className="label">PNR / BOOKING ID</p>
                        <p className="value" style={{ color: 'var(--primary)' }}>{latestBooking?.id}</p>
                      </div>
                    </div>
                    <div className="ticket-barcode" aria-label="Digital boarding barcode"></div>
                  </div>
                  
                  <button className="btn-primary" onClick={resetBooking} style={{ marginTop: '40px', background: 'var(--secondary)' }}>Done / Book Another</button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="marketplace-section" aria-label="Recommended hotels and popular routes">
          <div className="marketplace-block">
            <div className="marketplace-heading">
              <div>
                <span className="eyebrow">Recommended stays</span>
                <h2>Hotels guests love</h2>
              </div>
              <button className="market-link" type="button">View all hotels</button>
            </div>
            <div className="hotel-rail">
              {recommendedHotels.map((hotel) => (
                <article className="hotel-card" key={hotel.name}>
                  <div className="hotel-image" style={{ backgroundImage: `url('${hotel.img}')` }}>
                    <span>{hotel.tag}</span>
                  </div>
                  <div className="hotel-content">
                    <div>
                      <h3>{hotel.name}</h3>
                      <p>{hotel.city}</p>
                    </div>
                    <div className="hotel-price">
                      <span>Star {hotel.rating}</span>
                      <strong>Rs. {hotel.price.toLocaleString()}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="marketplace-block">
            <div className="marketplace-heading">
              <div>
                <span className="eyebrow">Popular from Delhi</span>
                <h2>Domestic and international routes</h2>
              </div>
              <button className="market-link" type="button">See all locations</button>
            </div>
            <div className="route-rails">
              <div className="route-group">
                <h3>Domestic</h3>
                <div className="route-grid">
                  {popularDomesticRoutes.map((route) => (
                    <button
                      type="button"
                      className="route-card"
                      key={route.city}
                      style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,.74), rgba(0,0,0,.12)), url('${route.img}')` }}
                      onClick={() => {
                        setSearchQuery(route.city);
                        setBookingDestination(route.city);
                      }}
                    >
                      <strong>{route.city}</strong>
                      <span>Starting from Rs. {route.price.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="route-group">
                <h3>International</h3>
                <div className="route-grid">
                  {popularInternationalRoutes.map((route) => (
                    <button
                      type="button"
                      className="route-card"
                      key={route.city}
                      style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,.74), rgba(0,0,0,.12)), url('${route.img}')` }}
                      onClick={() => {
                        setSearchQuery(route.city);
                        setBookingDestination(route.city);
                      }}
                    >
                      <strong>{route.city}</strong>
                      <span>Starting from Rs. {route.price.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="trips" className="section" style={{ paddingTop: 0 }}>
          <div className="trips-header">
            <div>
              <h2 className="section-title compact-title">My Trips</h2>
              <p className="section-note trip-note">Bookings created through the REST backend appear here like a real travel account dashboard.</p>
            </div>
            <div className="api-status">Live API connected</div>
          </div>

          <div className="trips-grid">
            {savedBookings.length > 0 ? savedBookings.map((booking) => (
              <div className="trip-card" key={booking.id}>
                <div className="trip-card-top">
                  <div>
                    <span className="trip-status">{booking.status}</span>
                    <h3>{booking.route}</h3>
                  </div>
                  <strong>{booking.id}</strong>
                </div>
                <div className="trip-meta-grid">
                  <div>
                    <span>Traveler</span>
                    <strong>{booking.traveler?.name}</strong>
                  </div>
                  <div>
                    <span>Service</span>
                    <strong>{booking.vehicleName}</strong>
                  </div>
                  <div>
                    <span>Seats</span>
                    <strong>{booking.seats?.join(', ')}</strong>
                  </div>
                  <div>
                    <span>Total</span>
                    <strong>Rs. {Number(booking.amount).toLocaleString()}</strong>
                  </div>
                </div>
                <a className="download-ticket" href={api.ticketUrl(booking.id)} target="_blank" rel="noreferrer">
                  Download PDF Ticket
                </a>
              </div>
            )) : (
              <div className="empty-trips">
                <h3>No trips booked yet</h3>
                <p>Search a journey, select seats, and confirm checkout to create your first backend booking.</p>
              </div>
            )}
          </div>
        </section>

        <section id="ai-planner" className="section" style={{ paddingTop: 0 }}>
          <h2 className="section-title">AI Trip Planner</h2>
          <p className="section-note">Generate a day-wise plan from destination, budget, days, and travel style.</p>

          <div className="ai-planner-panel">
            <form className="ai-form" onSubmit={handleGenerateAiPlan}>
              <div className="form-group">
                <label>Destination</label>
                <input value={aiRequest.destination} onChange={(e) => setAiRequest({ ...aiRequest, destination: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Days</label>
                <input type="number" min="1" max="10" value={aiRequest.days} onChange={(e) => setAiRequest({ ...aiRequest, days: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Budget</label>
                <input type="number" value={aiRequest.budget} onChange={(e) => setAiRequest({ ...aiRequest, budget: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Style</label>
                <select className="filter-select" value={aiRequest.style} onChange={(e) => setAiRequest({ ...aiRequest, style: e.target.value })}>
                  <option>Balanced</option>
                  <option>Luxury</option>
                  <option>Budget</option>
                  <option>Adventure</option>
                  <option>Family</option>
                </select>
              </div>
              <button className="btn-primary" type="submit">{aiLoading ? 'Generating...' : 'Generate Plan'}</button>
            </form>

            <div className="ai-result">
              {aiPlan ? (
                <>
                  <h3>{aiPlan.title}</h3>
                  <p>{aiPlan.summary}</p>
                  <div className="ai-days">
                    {aiPlan.days.map((day) => (
                      <div className="ai-day" key={day.day}>
                        <strong>{day.title}</strong>
                        <span>{day.plan}</span>
                        <small>{day.tip}</small>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty-trips">
                  <h3>Your smart itinerary will appear here</h3>
                  <p>Try Dubai, Kerala, Paris, Bali, Rajasthan, Manali, Shimla, or Bir Billing.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="admin" className="section" style={{ paddingTop: 0 }}>
          <h2 className="section-title">Admin Dashboard</h2>
          <p className="section-note">Manage packages through protected admin APIs. Login with the admin account to unlock package creation and live stats.</p>

          <div className="admin-grid">
            <div className="admin-stats">
              <div className="admin-stat"><span>Total Bookings</span><strong>{adminStats?.bookings ?? savedBookings.length}</strong></div>
              <div className="admin-stat"><span>Revenue</span><strong>Rs. {Number(adminStats?.revenue || 0).toLocaleString()}</strong></div>
              <div className="admin-stat"><span>Custom Packages</span><strong>{adminStats?.customPackages ?? 0}</strong></div>
              <div className="admin-stat"><span>Booked Destinations</span><strong>{adminStats?.destinations ?? 0}</strong></div>
              <div className="admin-stat"><span>Registered Users</span><strong>{adminStats?.users ?? (currentUser ? 1 : 0)}</strong></div>
              <div className="admin-stat"><span>Database</span><strong>{adminStats?.database || 'Login required'}</strong></div>
            </div>

            <form className="admin-form" onSubmit={handleCreatePackage}>
              <h3>Add New Package</h3>
              {adminError && <div className="auth-error">{adminError}</div>}
              <div className="form-group">
                <label>Package Title</label>
                <input value={newPackage.title} onChange={(e) => setNewPackage({ ...newPackage, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Destinations</label>
                <input value={newPackage.destinations} onChange={(e) => setNewPackage({ ...newPackage, destinations: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input type="number" value={newPackage.priceRaw} onChange={(e) => setNewPackage({ ...newPackage, priceRaw: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Region</label>
                <select className="filter-select" value={newPackage.region} onChange={(e) => setNewPackage({ ...newPackage, region: e.target.value })}>
                  <option>India</option>
                  <option>World</option>
                </select>
              </div>
              <button className="btn-primary" type="submit">Add Package</button>
            </form>
          </div>
        </section>

        {/* Dynamic Explore Section */}
        <section id="explore" className="section">
          <h2 className="section-title">Must Visit in {plannerDestinationName}</h2>
          <p className="section-note">Search any city, region, or country. Featured destinations include curated guides; new destinations use real map search and nearby place data.</p>
          <div className="cards-grid">
            {destData.exploreCards.map(place => (
              <div className="place-card" key={place.id}>
                <div className="place-card-img" style={{ backgroundImage: `url('${place.img}')`, backgroundSize: 'cover' }}></div>
                <div className="place-card-content">
                  <div className="place-card-meta"><span>ðŸ“ {place.location}</span><span className="badge">{place.tag}</span></div>
                  <h3 className="place-card-title" style={{ marginTop: '12px' }}>{place.title}</h3>
                  <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>{place.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- NEW FEATURE: Curated Travel Packages --- */}
        <section id="packages" className="section" style={{ paddingTop: 0 }}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <span style={{ background: 'rgba(251, 133, 0, 0.1)', color: 'var(--primary)', padding: '6px 16px', borderRadius: '50px', fontSize: '14px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>Exclusive Offers</span>
          </div>
          <h2 className="section-title" style={{ marginBottom: '24px' }}>Curated Travel Packages</h2>
          
          <div className="filters-container">
            <div className="filter-group">
              <span className="filter-label">Destination Region:</span>
              <select className="filter-select" value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}>
                <option value="All">Globe (All)</option>
                <option value="India">Incredible India</option>
                <option value="World">Around the World</option>
              </select>
            </div>
            <div className="filter-group">
              <span className="filter-label">Family Budget:</span>
              <select className="filter-select" value={budgetFilter} onChange={(e) => setBudgetFilter(e.target.value)}>
                <option value="All">All Budgets</option>
                <option value="Middle Class">Middle Class / Budget</option>
                <option value="Luxury (Rich)">Luxury / Rich Family</option>
              </select>
            </div>
            <div className="filter-group">
              <span className="filter-label">Sort By:</span>
              <select className="filter-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="Recommended">Recommended</option>
                <option value="Price: Low to High">Price: Low to High</option>
                <option value="Price: High to Low">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="packages-grid">
            {filteredPackages.length > 0 ? filteredPackages.map(pkg => (
              <div key={pkg.id} className="package-card">
                <div className="package-img" style={{ backgroundImage: `url('${pkg.img}')` }}>
                  <div className="package-badges-top">
                    {pkg.trending && <span className="trending-badge">ðŸ”¥ Trending</span>}
                    <span className="package-badge">{pkg.region}</span>
                  </div>
                </div>
                <div className="package-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: pkg.budget.includes('Luxury') ? '#8b5cf6' : '#10b981', background: pkg.budget.includes('Luxury') ? '#ede9fe' : '#d1fae5', padding: '4px 8px', borderRadius: '8px' }}>{pkg.budget}</span>
                    <span className="package-duration">{pkg.duration}</span>
                  </div>
                  <div className="package-audience-tags">
                    {(pkg.budget.includes('Luxury')
                      ? ['Couple-Friendly Verified', 'Family Suites Available', 'Private Transfer']
                      : ['Solo Favorite', 'Friends-Friendly Stay', 'Budget Comfort']
                    ).map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <h3 className="package-title">{pkg.title}</h3>
                  
                  <div className="package-features">
                    {pkg.features.map((feature, i) => (
                      <span key={i} className="feature-tag">âœ“ {feature}</span>
                    ))}
                  </div>

                  <div className="package-info" style={{ marginTop: '16px' }}>
                    <div className="package-info-row">
                      <span className="package-info-icon">ðŸ“</span>
                      <span>{pkg.destinations.join(' â€¢ ')}</span>
                    </div>
                    <div className="package-info-row">
                      <span className="package-info-icon">ðŸšŒ</span>
                      <span>{pkg.transport.join(' + ')}</span>
                    </div>
                  </div>
                  
                  <div className="package-footer">
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold' }}>STARTING FROM</div>
                      <div className="package-price">{pkg.price}</div>
                    </div>
                    <button className="btn-primary package-book-btn" onClick={() => handleBookPackage(pkg)}>Book Now</button>
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', background: 'white', borderRadius: '20px' }}>
                <span style={{ fontSize: '40px' }}>ðŸ”</span>
                <h3 style={{ color: 'var(--secondary)', marginTop: '16px' }}>No packages found</h3>
                <p style={{ color: '#6b7280' }}>Try adjusting your filters to see more amazing destinations.</p>
              </div>
            )}
          </div>
        </section>

        <section className="section luxury-proof-section" style={{ paddingTop: 0 }}>
          <div className="proof-copy">
            <span className="eyebrow">Trusted by travellers</span>
            <h2 className="section-title compact-title">Luxury confidence before every booking</h2>
            <p className="section-note trip-note">
              These trust signals make the app feel more like a public travel platform where people can compare, choose, and book confidently.
            </p>
          </div>
          <div className="testimonial-grid">
            {testimonials.map((review) => (
              <article className="testimonial-card" key={review.name}>
                <div className="stars">★★★★★</div>
                <p>{review.text}</p>
                <div>
                  <strong>{review.name}</strong>
                  <span>{review.trip}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* NEW FEATURE: Budget Cafes & Rentals */}
        <section id="cafes" className="section" style={{ paddingTop: 0 }}>
          <h2 className="section-title">Budget Cafes & Local Rentals</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {destData.cafesAndRentals.map(cafe => (
              <div key={cafe.id} style={{ background: 'white', padding: '24px', borderRadius: '16px', borderLeft: '4px solid var(--accent)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--secondary)' }}>{cafe.name}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', fontWeight: 'bold' }}>
                  <span style={{ color: '#fb8500' }}>{cafe.type}</span>
                  <span style={{ color: '#22c55e' }}>{cafe.cost}</span>
                </div>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>{cafe.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Planner Dashboard - Interactive */}
        <section id="planner" className="section" style={{ paddingTop: 0 }}>
          <h2 className="section-title">Your Custom Itinerary (Drag to Reorder)</h2>
          <p className="section-note">Showing planner for {plannerDestinationName}. Your itinerary order, wallet expenses, and latest booking are saved in this browser.</p>
          
          <div className="planner-panel">
            {/* Draggable Sidebar */}
            <div className="planner-sidebar">
              {itinerary.map((day, index) => (
                <div 
                  key={day.id}
                  className="day-item"
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnter={(e) => handleDragEnter(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => setSelectedDay(day)}
                  style={{
                    borderLeft: selectedDay.id === day.id ? '6px solid var(--primary)' : '4px solid #e5e7eb',
                    background: selectedDay.id === day.id ? '#fff3e0' : 'white',
                    transform: draggedItemIndex === index ? 'scale(1.02)' : 'scale(1)',
                    cursor: 'grab'
                  }}
                >
                  <div className="day-item-title">{day.title}</div>
                  <div className="day-item-details">{day.details}</div>
                </div>
              ))}
              <button className="btn-primary" style={{ width: '100%', marginTop: '10px', background: 'white', color: 'var(--primary)', border: '2px dashed var(--primary)' }}>
                + Add Day
              </button>
            </div>
            
            {/* Interactive Leaflet Map with Google Maps-like Layers */}
            <div className="planner-map" style={{ zIndex: 1, padding: 0 }}>
              <MapContainer center={selectedDay.coords} zoom={13} maxZoom={19} style={{ height: '100%', width: '100%', borderRadius: '20px' }} zoomControl={true}>
                <TileLayer
                  key={mapLayer}
                  url={mapLayer === 'satellite'
                    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                    : mapLayer === 'minimal'
                      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
                      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
                  attribution={mapLayer === 'satellite' ? '&copy; Esri and contributors' : '&copy; OpenStreetMap contributors'}
                  maxZoom={19}
                />

                <MapUpdater center={selectedDay.coords} />
                {itinerary.map((day) => (
                  <Marker key={day.id} position={day.coords}>
                    <Popup className="voyara-popup"><strong>{day.title}</strong><br/>{day.details}</Popup>
                  </Marker>
                ))}

                {/* --- LIVE RADAR MARKERS --- */}
                {radarPoints.map((pt) => (
                  <Marker key={`radar-${pt.id}`} position={pt.pos} icon={radarIcon}>
                    <Popup className="voyara-popup"><strong>{pt.label}</strong><br/>Nearby travel essential</Popup>
                  </Marker>
                ))}
              </MapContainer>

              <div className="map-layer-switcher" aria-label="Map style">
                {[
                  ['street', 'Street'],
                  ['satellite', 'Satellite'],
                  ['minimal', 'Minimal']
                ].map(([id, label]) => (
                  <button key={id} type="button" className={mapLayer === id ? 'active' : ''} onClick={() => setMapLayer(id)}>{label}</button>
                ))}
              </div>

              <button 
                className={`radar-btn ${radarActive ? 'active' : ''}`}
                onClick={() => setRadarActive(!radarActive)}
              >
                {radarActive ? 'ðŸ“¡ Radar Active (Nearby)' : 'ðŸ” Scan Nearby'}
              </button>
            </div>
          </div>
        </section>

        {/* The "Killer Feature": Smart Assistant Dashboard */}
        <section id="smart-assist" className="section" style={{ paddingTop: 0 }}>
          <h2 className="section-title">AI Travel Assistant: {selectedDay.title}</h2>
          
          <div className="assistant-grid">
            {/* Environment & AI Packing */}
            <div className="assistant-card glass-card">
              <div className="assistant-header">
                <span style={{ fontSize: '32px' }}>ðŸ”ï¸</span>
                <div>
                  <h3>Altitude & Weather Intel</h3>
                  <p>Dynamic predictions for your selected day</p>
                </div>
              </div>
              <div className="intel-metrics">
                <div className="metric">
                  <span className="metric-label">Altitude</span>
                  <span className="metric-value">{selectedDay.altitude}</span>
                </div>
                <div className="metric" style={{ borderLeft: '1px solid #e5e7eb', paddingLeft: '20px' }}>
                  <span className="metric-label">Est. Temp</span>
                  <span className="metric-value" style={{ color: selectedDay.temp.includes('-') ? '#219ebc' : '#fb8500'}}>{selectedDay.temp}</span>
                </div>
              </div>
              <div className="packing-list">
                <h4><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg> Smart Packing Requirement:</h4>
                <ul>
                  {selectedDay.gear.map((item, i) => (
                    <li key={i}>âœ… {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Offline SOS Hub */}
            <div className="assistant-card alert-card">
              <div className="assistant-header">
                <span style={{ fontSize: '32px' }}>ðŸš¨</span>
                <div>
                  <h3 style={{ color: '#d32f2f' }}>Solo SOS Toolkit</h3>
                  <p>Critical offline contacts for this location</p>
                </div>
              </div>
              <div className="sos-buttons">
                <button className="sos-btn">
                  <strong>Nearest Hospital</strong>
                  <span>{selectedDay.emergency.hospital}</span>
                </button>
                <button className="sos-btn police">
                  <strong>Local Police / Authority</strong>
                  <span>{selectedDay.emergency.police}</span>
                </button>
                <div className="translation-box">
                  <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280', marginBottom: '4px' }}>QUICK TRANSLATION (HINDI)</p>
                  <p style={{ fontStyle: 'italic' }}>&quot;Mujhe madad chahiye, kripya hospital bataiye.&quot;</p>
                  <p style={{ fontSize: '12px', marginTop: '4px' }}>(I need help, where is the hospital)</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            KILLER FEATURE 2: TRIP WALLET
            ========================================= */}
        <section id="wallet" className="section">
          <h2 className="section-title">AI Trip Wallet & Splitter</h2>
          <div className="wallet-dashboard">
            <div className="wallet-overview">
              <div className="wallet-title">ðŸ’³ My Trip Budget</div>
              <div className="budget-card">
                <p style={{ color: '#9ca3af', fontSize: '14px', fontWeight: 'bold', letterSpacing: '1px' }}>TOTAL SPENT</p>
                <h3 className="budget-amount">â‚¹{spentAmount.toLocaleString()}</h3>
                <p style={{ color: '#6b7280' }}>out of â‚¹{totalBudget.toLocaleString()}</p>
                
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${progressPercent}%`, background: progressPercent > 80 ? 'linear-gradient(to right, #f59e0b, #ec4899)' : progressPercent > 55 ? 'linear-gradient(to right, #22c55e, #facc15)' : 'linear-gradient(to right, #22c55e, #10b981)' }}></div>
                </div>
                <p className="budget-status">{progressPercent > 80 ? 'Budget limit is close' : progressPercent > 55 ? 'You are entering your comfort buffer' : 'You are comfortably within budget'}</p>
              </div>

              <div className="expense-list">
                <h4 style={{ marginBottom: '10px', fontSize: '16px' }}>Recent Transactions</h4>
                {expenses.map(exp => (
                  <div key={exp.id} className="expense-item">
                    <div className="expense-cat">
                      <div className="expense-icon">{exp.cat}</div>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{exp.title}</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>Paid by {exp.by}</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 'bold', color: '#fff' }}>â‚¹{Number(exp.amount).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="expense-form">
              <h4>+ Add New Expense</h4>
              <div className="splitter-card">
                <div>
                  <span>Cost splitter</span>
                  <strong>Rs. {perPersonSplit.toLocaleString()} / person</strong>
                </div>
                <label>
                  People
                  <input
                    type="number"
                    min="1"
                    value={splitter.people}
                    onChange={(e) => setSplitter({ ...splitter, people: Number(e.target.value) || 1 })}
                  />
                </label>
                <label>
                  Paid by
                  <input
                    value={splitter.paidBy}
                    onChange={(e) => setSplitter({ ...splitter, paidBy: e.target.value })}
                  />
                </label>
              </div>
              <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label>Expense Title</label>
                  <input type="text" placeholder="e.g. Dinner at Cafe" value={newExpense.title} onChange={e => setNewExpense({...newExpense, title: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Amount (â‚¹)</label>
                  <input type="number" placeholder="Enter amount" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select className="filter-select" value={newExpense.cat} onChange={e => setNewExpense({...newExpense, cat: e.target.value})} style={{ width: '100%', background: '#f9fafb' }}>
                    <option value="Food">Food & Dining</option>
                    <option value="Transport">Transport</option>
                    <option value="Accommodation">Accommodation</option>
                    <option value="Shopping">Shopping</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '10px', width: '100%' }}>Split & Save</button>
              </form>
            </div>
          </div>
        </section>

        {/* =========================================
            KILLER FEATURE 3: OFFLINE VAULT
            ========================================= */}
        <section id="vault" className="section">
          <h2 className="section-title">Offline Travel Vault</h2>
          <div className="vault-container">
            {/* PIN LOCK SCREEN */}
            <div className={`pin-pad-overlay ${!isVaultLocked ? 'unlocked' : ''}`}>
              <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', color: 'var(--secondary)' }}>Enter PIN to Unlock</h3>
              <p style={{ color: '#6b7280', marginBottom: '30px' }}>(Hint: Enter 1234)</p>
              
              <div className="pin-display">
                {[0,1,2,3].map(i => (
                  <div key={i} className={`pin-dot ${pinInput.length > i ? 'filled' : ''}`}></div>
                ))}
              </div>

              <div className="pin-grid">
                {[1,2,3,4,5,6,7,8,9].map(num => (
                  <button key={num} className="pin-btn" onClick={() => handlePinPress(num.toString())}>{num}</button>
                ))}
                <div></div>
                <button className="pin-btn" onClick={() => handlePinPress('0')}>0</button>
                <button className="pin-btn" onClick={() => setPinInput(pinInput.slice(0, -1))} style={{ fontSize: '18px' }}>DEL</button>
              </div>
            </div>

            {/* UNLOCKED CONTENT */}
            {!isVaultLocked && (
              <div className="vault-content" style={{ animation: 'fadeIn 0.5s ease-out' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                  <h3 style={{ fontSize: '24px', color: 'var(--secondary)' }}>ðŸ” Your Secure Documents</h3>
                  <button onClick={() => {setIsVaultLocked(true); setPinInput('');}} style={{ border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', padding: '8px 16px', borderRadius: '8px', background: '#fef2f2' }}>ðŸ”’ Lock Vault</button>
                </div>
                {!latestBooking && (
                  <div className="vault-empty-note">
                    Complete a booking to save a real demo ticket here. A sample boarding pass is shown for the vault preview.
                  </div>
                )}

                <div className="digital-ticket">
                  <div className="ticket-left">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                      <span style={{ fontWeight: '800', color: 'var(--secondary)', fontSize: '20px' }}>BOARDING PASS</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>WNDR-AIR</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                      <div style={{ fontSize: '32px', fontWeight: '800' }}>DEL</div>
                      <div style={{ color: '#9ca3af', fontSize: '24px' }}>→</div>
                      <div style={{ fontSize: '32px', fontWeight: '800' }}>{getAirportCode(bookingDestination)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '40px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 'bold' }}>PASSENGER</div>
                        <div style={{ fontWeight: '700' }}>{latestBooking?.traveler?.name || traveler.name || 'Vanisha Singh'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 'bold' }}>SEAT</div>
                        <div style={{ fontWeight: '700' }}>{latestBooking?.seats?.join(', ') || '14A'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 'bold' }}>BOOKING</div>
                        <div style={{ fontWeight: '700' }}>{latestBooking?.id || 'WA-802'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="ticket-right">
                    <div className="barcode"></div>
                    <div style={{ fontSize: '12px', letterSpacing: '2px', fontWeight: 'bold', color: '#4b5563' }}>2984719284710</div>
                  </div>
                </div>

                <div className="digital-ticket" style={{ borderLeft: '6px solid var(--accent)' }}>
                  <div className="ticket-left">
                    <span style={{ fontWeight: '800', color: 'var(--secondary)', fontSize: '18px', display: 'block', marginBottom: '16px' }}>HOTEL VOUCHER</span>
                    <h3 style={{ marginBottom: '8px' }}>The Grand {bookingDestination} Resort</h3>
                    <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>Check-in: 14:00 • 3 Nights • Deluxe Room</p>
                    <div style={{ display: 'inline-block', background: '#d1fae5', color: '#10b981', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>PAID IN FULL</div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </section>

      </main>
    </>
  );
}

export default App;

