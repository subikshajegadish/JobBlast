import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout
        logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth functions
export const login = async (username, password) => {
  const response = await axios.post(`${API_BASE_URL}/api/token/`, {
    username,
    password,
  });

  const { access, refresh } = response.data;
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);

  // Decode token to get user info
  const decoded = jwtDecode(access);
  // JWT token contains user_id in the payload (from SIMPLE_JWT settings)
  // Try different possible field names
  const userId = decoded.user_id || decoded.userId || decoded.id;
  if (userId) {
    localStorage.setItem('user_id', userId);
  }
  localStorage.setItem('username', decoded.username || username);

  return { access, refresh, user_id: userId };
};

export const register = async (username, password, email = '') => {
  const response = await axios.post(`${API_BASE_URL}/api/register/`, {
    username,
    password,
    email,
  });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_id');
  localStorage.removeItem('username');
};

export const isAuthenticated = () => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

export const getUserId = () => {
  return localStorage.getItem('user_id');
};

export const getUsername = () => {
  return localStorage.getItem('username');
};

export default api;

