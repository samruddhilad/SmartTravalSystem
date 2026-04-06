// src/api/client.js — Axios instance with auth header injection
import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://smarttravalsystem.onrender.com',
  headers: { 'Content-Type': 'application/json' },
});

// Inject JWT token on every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('voyager_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('voyager_token');
      localStorage.removeItem('voyager_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default client;

// ── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  login:    (data) => client.post('/api/auth/login', data),
  register: (data) => client.post('/api/auth/register', data),
  me:       ()     => client.get('/api/auth/me'),
  updateMe: (data) => client.put('/api/auth/me', data),
};

// ── Travel API ────────────────────────────────────────────────────────────────
export const travelApi = {
  generateItinerary:  (prefs)  => client.post('/api/generate-itinerary', prefs),
  getDestinations:    (params) => client.get('/api/destinations', { params }),
  getHiddenGems:      (params) => client.get('/api/hidden-gems', { params }),
  getPackingList:     (data)   => client.post('/api/packing-list', data),
  getAlternativePlan: (data)   => client.post('/api/alternative-plan', data),
  getMoods:           ()       => client.get('/api/dataset/moods'),
  getInterests:       ()       => client.get('/api/dataset/interests'),
  getTrips:           ()       => client.get('/api/trips'),
};
