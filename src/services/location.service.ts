import api from './api';

/**
 * Service for location-related API calls.
 */
export const locationService = {
  /**
   * Sends current GPS coordinates to the backend.
   * This is typically called from the background task.
   */
  updateLocation: async (lat: number, lng: number, timestamp?: string): Promise<void> => {
    await api.post('/location/update', { lat, lng, timestamp });
  }
};
