import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { LOCATION_TASK_NAME } from '../constants/config';
import { locationService } from '../services/location.service';

/**
 * Defines the background location task using expo-task-manager.
 * This task runs even when the app is in the background or killed.
 */
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const location = locations[0];

    if (location) {
      const { latitude, longitude } = location.coords;
      console.log(`[Background Task] Location update: ${latitude}, ${longitude}`);

      try {
        // Send location to backend
        await locationService.updateLocation(latitude, longitude);
      } catch (err) {
        console.error('[Background Task] Failed to update location:', err);
        // TODO: Implement offline queueing if needed
      }
    }
  }
});

/**
 * Registers and starts the background location task.
 */
export async function startBackgroundLocationTask(): Promise<void> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
  if (isRegistered) {
    console.log('Background location task is already registered');
    return;
  }

  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 5 * 60 * 1000, // 5 minutes
    distanceInterval: 0,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'Antigravity Tracking',
      notificationBody: 'Your location is being tracked during your shift.',
      notificationColor: '#0F6E56',
    },
  });
}

/**
 * Unregisters and stops the background location task.
 */
export async function stopBackgroundLocationTask(): Promise<void> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
  if (isRegistered) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    console.log('Background location task stopped');
  }
}
