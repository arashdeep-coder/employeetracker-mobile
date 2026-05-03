import api from './api';
import { AttendanceLog } from '../types';

/**
 * Service for attendance-related API calls.
 */
export const attendanceService = {
  /**
   * Records a punch-in event with GPS coordinates.
   */
  punchIn: async (lat: number, lng: number): Promise<AttendanceLog> => {
    const response = await api.post('/attendance/punch-in', { lat, lng });
    return response.data.data;
  },

  /**
   * Records a punch-out event with GPS coordinates.
   */
  punchOut: async (lat: number, lng: number): Promise<void> => {
    await api.post('/attendance/punch-out', { lat, lng });
  },

  /**
   * Fetches the current active session for the employee.
   */
  getActiveSession: async (): Promise<AttendanceLog | null> => {
    const response = await api.get('/attendance/active');
    return response.data.data.log || null;
  },

  /**
   * Fetches attendance history for the last X days.
   */
  getHistory: async (days: number = 30): Promise<AttendanceLog[]> => {
    const response = await api.get(`/attendance/me?days=${days}`);
    return response.data.data;
  }
};
