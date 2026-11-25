// Anmol Art Gallery - Backend MySQL API Client with Intelligent Offline Fallback

const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.replace(/\/$/, '') + '/api';
  }
  // If running locally in development, use /api which Vite proxies to localhost:5000
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return '/api';
    }
  }
  // Production fallback: directly point to the live Render backend
  return 'https://anmolartgalley.onrender.com/api';
};

const API_BASE = getApiBase();

export const api = {
  // 1. Health & Database connection check
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
      if (!res.ok) return { connected: false, mysql: false };
      const data = await res.json();
      return { connected: true, mysql: Boolean(data.mysql), data };
    } catch (err) {
      return { connected: false, mysql: false, error: err.message };
    }
  },

  // 2. Settings
  async getSettings() {
    try {
      const res = await fetch(`${API_BASE}/settings`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      return null;
    }
  },

  async updateSettings(settings) {
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      return res.ok;
    } catch (err) {
      return false;
    }
  },

  // 3. Artworks
  async getArtworks() {
    try {
      const res = await fetch(`${API_BASE}/artworks`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      return null;
    }
  },

  async createArtwork(artwork) {
    try {
      const res = await fetch(`${API_BASE}/artworks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(artwork),
      });
      const data = await res.json();
      return res.ok ? data : { success: false, error: data?.error || 'Failed to save artwork' };
    } catch (err) {
      console.error('[API Error] createArtwork:', err);
      return { success: false, error: err.message };
    }
  },

  async updateArtwork(id, artwork) {
    try {
      const res = await fetch(`${API_BASE}/artworks/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(artwork),
      });
      const data = await res.json();
      return res.ok ? data : { success: false, error: data?.error || 'Failed to update artwork' };
    } catch (err) {
      console.error('[API Error] updateArtwork:', err);
      return { success: false, error: err.message };
    }
  },

  async updateArtworkListingType(id, listingType) {
    try {
      const res = await fetch(`${API_BASE}/artworks/${encodeURIComponent(id)}/listing-type`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingType }),
      });
      return res.ok;
    } catch (err) {
      return false;
    }
  },

  async deleteArtwork(id) {
    try {
      const res = await fetch(`${API_BASE}/artworks/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (err) {
      return false;
    }
  },

  // 4. Orders
  async getOrders() {
    try {
      const res = await fetch(`${API_BASE}/orders`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      return null;
    }
  },

  async createOrder(order) {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      return await res.json();
    } catch (err) {
      return null;
    }
  },

  async updateOrderStatus(id, status) {
    try {
      const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return res.ok;
    } catch (err) {
      return false;
    }
  },

  async deleteOrder(id) {
    try {
      const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (err) {
      return false;
    }
  },

  // 5. Reviews
  async getReviews() {
    try {
      const res = await fetch(`${API_BASE}/reviews`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      return null;
    }
  },

  async createReview(review) {
    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });
      const data = await res.json();
      return res.ok ? data : { success: false, error: data?.error || 'Failed to save review' };
    } catch (err) {
      console.error('[API Error] createReview:', err);
      return { success: false, error: err.message };
    }
  },

  async deleteReview(id) {
    try {
      const res = await fetch(`${API_BASE}/reviews/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (err) {
      return false;
    }
  },
};
