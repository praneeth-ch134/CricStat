import axios from 'axios';

// Create axios instance with base URL
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cricketAdminToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API endpoints
export const getMatches = () => API.get('/matches');
export const getMatch = (id) => API.get(`/matches/${id}`);
export const createMatch = (matchData) => API.post('/admin/matches', matchData);
export const updateMatch = (id, matchData) => API.put(`/admin/matches/${id}`, matchData);
export const login = (credentials) => API.post('/admin/login', credentials);
export const getCurrentUser = () => API.get('/admin/me');

export default API;