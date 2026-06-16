/**
 * Application-wide configuration constants.
 */

import { white } from "react-native-paper/lib/typescript/styles/themes/v2/colors";
// Replace this with your actual Railway backend URL
export const API_URL = "https://unpredictive-ruby-intercrystalline.ngrok-free.dev/api/v1"
export const LOCATION_TASK_NAME = 'background-location-task';
export const LOCATION_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export const TOKEN_KEY = 'auth_token';
export const USER_KEY = 'user_data';
export const ORGANIZATION_KEY = 'organization_data';

export const THEME = {
  primary: '#10614F', // Forest Green
  error: '#D85A30',   // Coral
};
