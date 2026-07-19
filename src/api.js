const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

export const api = {
  getPackages() {
    return request('/packages');
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
