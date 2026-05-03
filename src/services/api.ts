import axios from 'axios';
import { getToken, clearAuthData } from '../utils/storage';
import { API_URL } from '../constants/config';

/**
 * Shared axios instance with base configuration.
 */
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

/**
 * Request Interceptor: Attach JWT token to every outgoing request.
 */
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

/**
 * Response Interceptor: Handle global error cases (like 401 Unauthorized).
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear local storage
      // Note: Actual redirection to Login is handled by AuthContext state change
      await clearAuthData();
    }
    return Promise.reject(error);
  }
);

export default api;
