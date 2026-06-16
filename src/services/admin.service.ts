import api from './api';
import { User, AttendanceLog } from '../types';

export const adminService = {
  /**
   * Fetch all employees in the organization.
   */
  getEmployees: async (): Promise<User[]> => {
    const response = await api.get('/admin/employees');
    return response.data.data;
  },

  /**
   * Fetch today's attendance logs for all employees.
   */
  getTodayLogs: async (): Promise<AttendanceLog[]> => {
    const response = await api.get('/admin/attendance/today');
    return response.data.data;
  },

  /**
   * Fetch attendance logs within a date range.
   */
  getRangeLogs: async (from: string, to: string): Promise<AttendanceLog[]> => {
    const response = await api.get(`/admin/attendance/range?from=${from}&to=${to}`);
    return response.data.data;
  },
};
