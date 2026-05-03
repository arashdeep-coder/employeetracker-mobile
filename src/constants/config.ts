/**
 * Application-wide configuration constants.
 */

// Replace this with your actual Railway backend URL
export const API_URL = 'http://192.168.1.75:4000/api/v1'; // Use host IP for local dev

export const LOCATION_TASK_NAME = 'background-location-task';
export const LOCATION_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export const TOKEN_KEY = 'auth_token';
export const USER_KEY = 'user_data';

export const THEME = {
  primary: '#0F6E56', // Teal
  error: '#D85A30',   // Coral
};
