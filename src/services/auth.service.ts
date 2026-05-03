import api from './api';
import { User } from '../types';

/**
 * Service for authentication-related API calls.
 */
export const authService = {
  /**
   * Logs in a user with phone and PIN.
   */
  login: async (phone: string, pin: string): Promise<{ token: string; user: User }> => {
    const response = await api.post('/auth/login', { phone, pin });
    return response.data.data; // Expected shape: { success: true, data: { token, user } }
  },

  /**
   * Registers FCM token for push notifications.
   */
  registerFcmToken: async (fcmToken: string): Promise<void> => {
    await api.post('/auth/fcm-token', { fcmToken });
  }
};
