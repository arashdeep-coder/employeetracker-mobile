import api from './api';
import { User } from '../types';

/**
 * Service for authentication-related API calls.
 */
export const authService = {
  /**
   * Logs in a user with orgCode, phone, and PIN.
   */
  login: async (orgCode: string, phone: string, pin: string): Promise<{ token: string; user: User; organization: any }> => {
    const response = await api.post('/auth/login', { orgCode, phone, pin });
    return response.data.data; // Expected shape: { success: true, data: { token, user, organization } }
  },

  /**
   * Registers FCM token for push notifications.
   */
  registerFcmToken: async (fcmToken: string): Promise<void> => {
    await api.post('/auth/fcm-token', { fcmToken });
  }
};
