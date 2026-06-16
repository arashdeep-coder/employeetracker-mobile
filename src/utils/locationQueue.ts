import AsyncStorage from '@react-native-async-storage/async-storage';
import { locationService } from '../services/location.service';

const QUEUE_KEY = 'offline_locations_queue';

export interface QueuedLocation {
  lat: number;
  lng: number;
  timestamp: string;
}

/**
 * Saves a new location update to the offline queue.
 */
export async function queueLocationUpdate(lat: number, lng: number, timestamp: string): Promise<void> {
  try {
    const queueStr = await AsyncStorage.getItem(QUEUE_KEY);
    const queue: QueuedLocation[] = queueStr ? JSON.parse(queueStr) : [];
    
    // Add the new location update
    queue.push({ lat, lng, timestamp });
    
    // Save back to storage
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    console.log(`[Location Queue] Queued location update for ${timestamp}. Queue size: ${queue.length}`);
  } catch (error) {
    console.error('[Location Queue] Failed to queue location update:', error);
  }
}

let isSyncing = false;

/**
 * Attempts to sync all queued offline locations to the backend in chronological order.
 */
export async function syncOfflineLocations(): Promise<void> {
  if (isSyncing) return;
  isSyncing = true;
  
  try {
    const queueStr = await AsyncStorage.getItem(QUEUE_KEY);
    if (!queueStr) {
      isSyncing = false;
      return;
    }
    
    let queue: QueuedLocation[] = JSON.parse(queueStr);
    if (queue.length === 0) {
      isSyncing = false;
      return;
    }
    
    console.log(`[Location Queue] Attempting to sync ${queue.length} offline location heartbeats...`);
    
    const remainingQueue: QueuedLocation[] = [...queue];
    
    for (const item of queue) {
      try {
        await locationService.updateLocation(item.lat, item.lng, item.timestamp);
        // Successfully sent, remove from remaining queue
        remainingQueue.shift();
      } catch (error: any) {
        console.warn(`[Location Queue] Failed to send location at ${item.timestamp}:`, error.message);
        
        // Determine if it is a network error vs an API/Authentication error
        const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.message?.toLowerCase().includes('network');
        
        if (isNetworkError) {
          // Network issue (still offline). Stop sync and keep remaining items in the queue.
          break;
        } else {
          // Application/Validation error (e.g. 401 Unauthorized, 409 Not Punched In).
          // Discard this item so it doesn't block the queue forever.
          remainingQueue.shift();
          
          if (error.response?.status === 409 || error.response?.status === 401) {
            console.warn('[Location Queue] Session invalid or not punched in. Clearing remaining offline queue.');
            await AsyncStorage.removeItem(QUEUE_KEY);
            isSyncing = false;
            return;
          }
        }
      }
    }
    
    // Save remaining items back to storage
    if (remainingQueue.length > 0) {
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remainingQueue));
      console.log(`[Location Queue] Sync paused. ${remainingQueue.length} items remaining in queue.`);
    } else {
      await AsyncStorage.removeItem(QUEUE_KEY);
      console.log('[Location Queue] All offline locations synchronized successfully!');
    }
  } catch (error) {
    console.error('[Location Queue] Error during sync:', error);
  } finally {
    isSyncing = false;
  }
}
