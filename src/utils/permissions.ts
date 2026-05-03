import * as Location from 'expo-location';
import { Alert, Platform } from 'react-native';

/**
 * Requests foreground and background location permissions.
 * Returns true if both are granted.
 */
export async function requestLocationPermissions(): Promise<boolean> {
  try {
    // 1. Foreground Permission
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'We need location access to record your punch-in/out. Please enable it in settings.'
      );
      return false;
    }

    // 2. Background Permission (required for background tracking)
    // Note: On Android, background permission must be requested after foreground.
    // On iOS, background permission request might be different or require Always.
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    
    if (backgroundStatus !== 'granted') {
      Alert.alert(
        'Background Location Denied',
        'To track your location during shifts, please set location access to "Always Allow" in settings.'
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error requesting location permissions:', error);
    return false;
  }
}

/**
 * Checks if location services are enabled on the device.
 */
export async function isLocationEnabled(): Promise<boolean> {
  return await Location.hasServicesEnabledAsync();
}
