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

  // 1. Request foreground permission first
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus !== 'granted') {
    console.warn('Foreground location permission not granted');
    return;
  }

  // 2. Request background permission
  // Note: On iOS, this might only grant 'When In Use' initially. 
  // showsBackgroundLocationIndicator allows tracking with 'When In Use'.
  const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
  if (backgroundStatus !== 'granted') {
    console.warn('Background location permission not granted. Attempting with Blue Bar indicator.');
  }

  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 5 * 60 * 1000, // 5 minutes
    distanceInterval: 0, // Ensure updates are time-based even if stationary
    deferredUpdatesInterval: 0, // Prevent OS from batching updates (crucial for 'screen off')
    deferredUpdatesDistance: 0,
    showsBackgroundLocationIndicator: true, // Enables the Blue Bar on iOS
    foregroundService: {
      notificationTitle: 'Haazri Active Shift',
      notificationBody: 'Your location is being tracked for attendance verification.',
      notificationColor: '#0F6E56',
      killServiceOnStop: false, // Ensure service persists if app is swiped away
    },
    // Required to keep the service alive and prevent OS from pausing it
    pausesLocationUpdatesAutomatically: false,
    mayShowUserSettingsDialog: true,
  });

  console.log('Background location task started');
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
