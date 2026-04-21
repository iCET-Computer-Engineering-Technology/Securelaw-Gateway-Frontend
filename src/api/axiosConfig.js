import axios from 'axios';

const configuredApiRoot = import.meta.env.VITE_API_BASE_URL?.trim();
export const API_ROOT = (configuredApiRoot ? configuredApiRoot : 'http://localhost:8080').replace(/\/$/, '');

const api = axios.create({
  baseURL: `${API_ROOT}/api/v1`,
});

api.interceptors.request.use(
  (config) => {
    // ── FIXED: Only look for the exact token key saved by Login.jsx ──
    const token = localStorage.getItem('token');

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default api;