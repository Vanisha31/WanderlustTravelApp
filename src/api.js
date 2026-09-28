const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const TOKEN_KEY = 'voyara.authToken';

export function getAuthToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token) {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Keep the app usable even if browser storage is blocked.
  }
}

async function request(path, options = {}) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

export const api = {
  register(credentials) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },
  login(credentials) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },
  me() {
    return request('/auth/me');
  },
  getPackages() {
    return request('/packages');
  },
  findDestination(query) {
    return request(`/locations/search?q=${encodeURIComponent(query)}`);
  },
  getNearbyPlaces(latitude, longitude) {
    return request(`/locations/nearby?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`);
  },
  getBookings() {
    return request('/bookings');
  },
  createBooking(booking) {
    return request('/bookings', {
      method: 'POST',
      body: JSON.stringify(booking)
    });
  },
  createPackage(pkg) {
    return request('/packages', {
      method: 'POST',
      body: JSON.stringify(pkg)
    });
  },
  getAdminStats() {
    return request('/admin/stats');
  },
  createAiPlan(planRequest) {
    return request('/ai/plan', {
      method: 'POST',
      body: JSON.stringify(planRequest)
    });
  },
  ticketUrl(bookingId) {
    return `${API_BASE}/bookings/${bookingId}/ticket.pdf`;
  }
};
