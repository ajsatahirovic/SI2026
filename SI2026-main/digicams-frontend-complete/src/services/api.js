import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7139/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Automatski dodaj JWT token u svaki request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Auth ───────────────────────────────────────────────
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

// ─── Products ───────────────────────────────────────────
export const productService = {
  getAll: () => api.get('/products').then(r => r.data),
  getById: (id) => api.get(`/products/${id}`).then(r => r.data),
  getForSale: () => api.get('/products/sale').then(r => r.data),
  getForRent: () => api.get('/products/rent').then(r => r.data),
  create: (data) => api.post('/products', data).then(r => r.data),
  update: (id, data) => api.put(`/products/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/products/${id}`).then(r => r.data),
};

// ─── Orders ─────────────────────────────────────────────
export const orderService = {
  getMyOrders: () => api.get('/orders/my').then(r => r.data),
  getAll: () => api.get('/orders').then(r => r.data),
  create: (data) => api.post('/orders', data).then(r => r.data),
};

// ─── Reservations ───────────────────────────────────────
export const reservationService = {
  getMyReservations: () => api.get('/reservations/my').then(r => r.data),
  getAll: () => api.get('/reservations').then(r => r.data),
  create: (data) => api.post('/reservations', data).then(r => r.data),
  cancel: (id) => api.put(`/reservations/${id}/cancel`).then(r => r.data),
};

// ─── Users ──────────────────────────────────────────────
export const userService = {
  getProfile: () => api.get('/users/profile').then(r => r.data),
  updateProfile: (data) => api.put('/users/profile', data).then(r => r.data),
  getAll: () => api.get('/users').then(r => r.data),
  delete: (id) => api.delete(`/users/${id}`).then(r => r.data),
};

export default api;
