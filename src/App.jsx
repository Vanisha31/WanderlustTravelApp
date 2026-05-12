import { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './index.css';
import { travelData, packagesData } from './mockData';

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

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentKey, setCurrentKey] = useState('manali');
  
  // New Features State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [bookingTab, setBookingTab] = useState('flights');
  
  // Real-time Booking Flow State
  const [bookingFlowState, setBookingFlowState] = useState('search'); // 'search', 'results', 'seats', 'checkout', 'success'
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Packages Filter State
  const [regionFilter, setRegionFilter] = useState('All');
  const [budgetFilter, setBudgetFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('Recommended');

  let filteredPackages = packagesData.filter(pkg => {
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
    // Scroll to booking section
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
    setBookingTab('flights'); // default to flights for global packages
    setSearchQuery(pkg.destinations[0]); // Pretend we are searching this destination
    setCurrentKey('manali'); // Set a fallback or real destination if mapped
    // In a real app we would map pkg.id to a real destination key, here we just show the user the booking area
  };

  const dummyVehicles = [
    { id: 1, name: 'Himalayan Express Volvo', time: '18:30 - 08:00', price: 1200, type: 'AC Semi-Sleeper' },
    { id: 2, name: 'State Transport AC', time: '20:00 - 10:00', price: 850, type: 'AC Seater' },
    { id: 3, name: 'Private AC Sleeper', time: '21:30 - 09:30', price: 1500, type: 'AC Sleeper' }
  ];

  const handleSearchBooking = () => setBookingFlowState('results');
  const handleSelectVehicle = (vehicle) => { setSelectedVehicle(vehicle); setBookingFlowState('seats'); setSelectedSeats([]); };
  const toggleSeat = (seatNum) => {
    if (selectedSeats.includes(seatNum)) setSelectedSeats(selectedSeats.filter(s => s !== seatNum));
    else setSelectedSeats([...selectedSeats, seatNum]);
  };
  const handleCheckout = () => setBookingFlowState('checkout');
  const handleConfirm = () => setBookingFlowState('success');
  const resetBooking = () => { setBookingFlowState('search'); setSelectedVehicle(null); setSelectedSeats([]); };
  
  const destData = useMemo(() => travelData[currentKey], [currentKey]);
  
  // State for interactive features
  const [itinerary, setItinerary] = useState(destData.itinerary);
  const [selectedDay, setSelectedDay] = useState(destData.itinerary[0]);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  // --- NEW KILLER FEATURES STATE ---
  // 1. Live Radar
  const [radarActive, setRadarActive] = useState(false);
  const radarPoints = radarActive ? [
    { id: 1, pos: [selectedDay.coords[0] + 0.005, selectedDay.coords[1] + 0.005], label: 'ðŸ¥ Medical Shop' },
    { id: 2, pos: [selectedDay.coords[0] - 0.003, selectedDay.coords[1] + 0.008], label: 'ðŸ” Street Food' },
    { id: 3, pos: [selectedDay.coords[0] + 0.006, selectedDay.coords[1] - 0.004], label: 'ðŸ§ ATM' }
  ] : [];

  // 2. Trip Wallet
  const [expenses, setExpenses] = useState([
    { id: 1, title: 'Flight Tickets', amount: 15000, cat: 'âœˆï¸', by: 'Me' },
    { id: 2, title: 'Cafe 1947 Lunch', amount: 1200, cat: 'ðŸ”', by: 'Rahul' }
  ]);
  const [newExpense, setNewExpense] = useState({ title: '', amount: '', cat: 'ðŸ›ï¸' });
  const totalBudget = 50000;
  const spentAmount = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const progressPercent = Math.min((spentAmount / totalBudget) * 100, 100);

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpense.title || !newExpense.amount) return;
    setExpenses([{ id: Date.now(), ...newExpense }, ...expenses]);
    setNewExpense({ title: '', amount: '', cat: 'ðŸ›ï¸' });
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
    setItinerary(destData.itinerary);
    setSelectedDay(destData.itinerary[0]);
  }, [destData]);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.toLowerCase();
    
    if (query.includes('shimla')) {
      setCurrentKey('shimla');
    } else if (query.includes('bir')) {
      setCurrentKey('bir');
    } else {
      setCurrentKey('manali');
    }
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

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  return (
    <>
      {/* Login Modal */}
      {showLoginModal && (
        <div className="modal-overlay">
          <div className="login-modal">
            <button className="close-btn" onClick={() => setShowLoginModal(false)}>Ã—</button>
            <h2 style={{ marginBottom: '20px', color: 'var(--secondary)' }}>Welcome Back</h2>
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" placeholder="Enter your email" required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="Enter your password" required />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>Login Securely</button>
            </form>
            <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
              Don&apos;t have an account? <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}>Sign Up</span>
            </p>
          </div>
        </div>
      )}

      <nav className="nav container">
        <div className="nav-brand">Wander<span>lust</span></div>
        <div className="nav-links">
          <a href="#packages">Packages</a>
          <a href="#booking">Bookings</a>
          <a href="#explore">Explore</a>
          <a href="#planner">Planner</a>
          <a href="#wallet">Wallet</a>
          <a href="#vault">Vault</a>
        </div>
        {isLoggedIn ? (
          <div className="user-profile">
            <div className="avatar">JD</div>
            <span style={{ color: 'white', fontWeight: 'bold', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>John Doe</span>
          </div>
        ) : (
          <button className="btn-primary" onClick={() => setShowLoginModal(true)}>Sign In</button>
        )}
      </nav>

      {/* Hero Section Dynamic */}
      <header className="hero" style={{ background: `url('${destData.bgUrl}') center/cover no-repeat` }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">{destData.title}</h1>
          <p className="hero-subtitle">{destData.subtitle}</p>
          
          <form className="search-bar" onSubmit={handleSearch}>
            <input 
              type="text" 
              className="search-input" 
              placeholder="e.g. Try typing 'Bir Billing' or 'Shimla'..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn">Search & Go</button>
          </form>
        </div>
      </header>

      <main className="container">
        
        {/* MakeMyTrip Style Booking Dashboard */}
        <section id="booking" className="section" style={{ paddingTop: '40px' }}>
          <div className="booking-dashboard">
            <div className="booking-tabs">
              {['flights', 'hotels', 'trains', 'buses'].map(tab => (
                <button 
                  key={tab} 
                  className={`tab-btn ${bookingTab === tab ? 'active' : ''}`}
                  onClick={() => setBookingTab(tab)}
                >
                  {tab === 'flights' && 'âœˆï¸ Flights'}
                  {tab === 'hotels' && 'ðŸ¨ Hotels'}
                  {tab === 'trains' && 'ðŸš† Trains'}
                  {tab === 'buses' && 'ðŸšŒ Buses'}
                </button>
              ))}
            </div>
            
            <div className="booking-form-area">
              {bookingFlowState === 'search' && (
                <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  <div className="form-row">
                    <div className="input-box">
                      <label>FROM</label>
                      <input type="text" placeholder="Delhi" defaultValue="Delhi" />
                    </div>
                    <div className="swap-icon">â‡„</div>
                    <div className="input-box">
                      <label>TO</label>
                      <input type="text" placeholder="Destination" value={currentKey.charAt(0).toUpperCase() + currentKey.slice(1)} readOnly />
                    </div>
                    <div className="input-box">
                      <label>DEPARTURE</label>
                      <input type="date" />
                    </div>
                    {bookingTab === 'flights' && (
                      <div className="input-box">
                        <label>RETURN</label>
                        <input type="date" />
                      </div>
                    )}
                    <div className="input-box">
                      <label>PASSENGERS</label>
                      <input type="text" defaultValue="2 Adults" />
                    </div>
                  </div>
                  <button className="search-booking-btn" onClick={handleSearchBooking}>SEARCH</button>
                </div>
              )}

              {bookingFlowState === 'results' && (
                <div className="booking-results" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  <h3 style={{ marginBottom: '20px', color: 'var(--secondary)' }}>Available Options</h3>
                  {dummyVehicles.map(v => (
                    <div key={v.id} className="vehicle-card">
                      <div>
                        <h4 style={{ fontSize: '18px', marginBottom: '4px', color: 'var(--secondary)' }}>{v.name}</h4>
                        <p style={{ color: '#6b7280', fontSize: '14px' }}>{v.type} â€¢ {v.time}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <h3 style={{ color: 'var(--primary)', marginBottom: '8px', fontSize: '24px' }}>â‚¹{v.price}</h3>
                        <button className="btn-primary" onClick={() => handleSelectVehicle(v)} style={{ padding: '8px 20px' }}>Select Seats</button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setBookingFlowState('search')} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}>â† Back to Search</button>
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
                    <div className="steering-wheel">ðŸ›ž Driver</div>
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
                    <button onClick={() => setBookingFlowState('results')} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}>â† Back</button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>Selected: {selectedSeats.length} seats</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--secondary)' }}>Total: â‚¹{selectedVehicle.price * selectedSeats.length}</div>
                      </div>
                      <button className="btn-primary" disabled={selectedSeats.length === 0} onClick={handleCheckout} style={{ opacity: selectedSeats.length === 0 ? 0.5 : 1 }}>Proceed</button>
                    </div>
                  </div>
                </div>
              )}

              {bookingFlowState === 'checkout' && (
                <div className="checkout-view" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  <h3 style={{ marginBottom: '20px', color: 'var(--secondary)' }}>Review Booking</h3>
                  <div className="checkout-summary">
                    <h4>{selectedVehicle.name}</h4>
                    <p style={{ color: '#6b7280', marginBottom: '12px' }}>{selectedVehicle.time}</p>
                    <div className="summary-row">
                      <span>Seats ({selectedSeats.join(', ')})</span>
                      <span>â‚¹{selectedVehicle.price * selectedSeats.length}</span>
                    </div>
                    <div className="summary-row">
                      <span>Taxes & Fees</span>
                      <span>â‚¹150</span>
                    </div>
                    <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '12px 0' }} />
                    <div className="summary-row total">
                      <span>Total Amount</span>
                      <span>â‚¹{(selectedVehicle.price * selectedSeats.length) + 150}</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px' }}>
                    <button onClick={() => setBookingFlowState('seats')} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}>â† Back to Seats</button>
                    <button className="btn-primary" onClick={handleConfirm} style={{ background: '#22c55e', padding: '16px 40px', fontSize: '18px' }}>Confirm & Pay securely</button>
                  </div>
                </div>
              )}

              {bookingFlowState === 'success' && (
                <div className="success-view" style={{ textAlign: 'center', padding: '20px', animation: 'fadeIn 0.5s ease-out' }}>
                  <div style={{ fontSize: '80px', marginBottom: '16px', animation: 'bounce 1s infinite' }}>ðŸŽ‰</div>
                  <h2 style={{ color: '#22c55e', marginBottom: '8px', fontSize: '32px' }}>Booking Confirmed!</h2>
                  <p style={{ color: '#6b7280', marginBottom: '40px', fontSize: '18px' }}>Your tickets have been successfully generated.</p>
                  
                  <div className="ticket-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
                      <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--secondary)' }}>DEL</span>
                      <span style={{ color: 'var(--primary)', fontSize: '20px' }}>â†’</span>
                      <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--secondary)' }}>{currentKey.substring(0, 3).toUpperCase()}</span>
                    </div>
                    <h3 style={{ marginBottom: '4px', fontSize: '20px' }}>{selectedVehicle.name}</h3>
                    <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>{selectedVehicle.time}</p>
                    
                    <div className="ticket-details">
                      <div>
                        <p className="label">SEATS</p>
                        <p className="value">{selectedSeats.join(', ')}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p className="label">PNR / BOOKING ID</p>
                        <p className="value" style={{ color: 'var(--primary)' }}>WNDR{Math.floor(10000 + Math.random() * 90000)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <button className="btn-primary" onClick={resetBooking} style={{ marginTop: '40px', background: 'var(--secondary)' }}>Done / Book Another</button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Dynamic Explore Section */}
        <section id="explore" className="section">
          <h2 className="section-title">Must Visit in {currentKey.charAt(0).toUpperCase() + currentKey.slice(1)}</h2>
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
                <LayersControl position="topright">
                  {/* Detailed Street Map (Like Google Maps Default) */}
                  <LayersControl.BaseLayer checked name="Detailed Street Map">
                    <TileLayer 
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; OpenStreetMap contributors'
                      maxZoom={19}
                    />
                  </LayersControl.BaseLayer>
                  {/* Satellite View (Like Google Earth/Maps Satellite) */}
                  <LayersControl.BaseLayer name="Satellite View">
                    <TileLayer 
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                      maxZoom={19}
                    />
                  </LayersControl.BaseLayer>
                  {/* Minimal Voyager (Original) */}
                  <LayersControl.BaseLayer name="Minimal View">
                    <TileLayer 
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
                      maxZoom={19}
                    />
                  </LayersControl.BaseLayer>
                </LayersControl>

                <MapUpdater center={selectedDay.coords} />
                {itinerary.map((day) => (
                  <Marker key={day.id} position={day.coords}>
                    <Popup><strong>{day.title}</strong><br/>{day.details}</Popup>
                  </Marker>
                ))}

                {/* --- LIVE RADAR MARKERS --- */}
                {radarPoints.map((pt) => (
                  <Marker key={`radar-${pt.id}`} position={pt.pos} icon={radarIcon}>
                    <Popup><strong>{pt.label}</strong></Popup>
                  </Marker>
                ))}
              </MapContainer>

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
                  <div className="progress-bar-fill" style={{ width: `${progressPercent}%`, background: progressPercent > 80 ? 'linear-gradient(to right, #ef4444, #dc2626)' : 'linear-gradient(to right, #22c55e, #10b981)' }}></div>
                </div>
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
                    <option value="ðŸ”">ðŸ” Food & Dining</option>
                    <option value="ðŸš•">ðŸš• Transport</option>
                    <option value="ðŸ¨">ðŸ¨ Accommodation</option>
                    <option value="ðŸ›ï¸">ðŸ›ï¸ Shopping</option>
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

                <div className="digital-ticket">
                  <div className="ticket-left">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                      <span style={{ fontWeight: '800', color: 'var(--secondary)', fontSize: '20px' }}>BOARDING PASS</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>WNDR-AIR</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                      <div style={{ fontSize: '32px', fontWeight: '800' }}>DEL</div>
                      <div style={{ color: '#9ca3af', fontSize: '24px' }}>âœˆï¸</div>
                      <div style={{ fontSize: '32px', fontWeight: '800' }}>{currentKey.substring(0, 3).toUpperCase()}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '40px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 'bold' }}>PASSENGER</div>
                        <div style={{ fontWeight: '700' }}>John Doe</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 'bold' }}>SEAT</div>
                        <div style={{ fontWeight: '700' }}>14A</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 'bold' }}>FLIGHT</div>
                        <div style={{ fontWeight: '700' }}>WA-802</div>
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
                    <h3 style={{ marginBottom: '8px' }}>The Grand {currentKey.charAt(0).toUpperCase() + currentKey.slice(1)} Resort</h3>
                    <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>Check-in: 14:00 â€¢ 3 Nights â€¢ Deluxe Room</p>
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

