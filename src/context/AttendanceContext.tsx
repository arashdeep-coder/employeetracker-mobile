import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { AttendanceContextType, AttendanceLog } from '../types';
import { attendanceService } from '../services/attendance.service';
import { startBackgroundLocationTask, stopBackgroundLocationTask } from '../tasks/locationTask';
import { useAuth } from './AuthContext';

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [activeSession, setActiveSession] = useState<AttendanceLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPunching, setIsPunching] = useState(false);

  // Sync active session on mount and when token changes
  useEffect(() => {
    if (token) {
      refreshSession();
    } else {
      setActiveSession(null);
      setIsLoading(false);
    }
  }, [token]);

  /**
   * Refreshes the active session state from the backend.
   */
  async function refreshSession() {
    try {
      setIsLoading(true);
      const session = await attendanceService.getActiveSession();
      setActiveSession(session);
      
      // If there's an active session, ensure background task is running
      if (session) {
        await startBackgroundLocationTask();
      }
    } catch (error) {
      console.error('Refresh session error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Performs a punch-in action.
   */
  async function punchIn() {
    try {
      setIsPunching(true);
      
      // 1. Request Permissions (Foreground + Background)
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        throw new Error('Foreground location permission is required');
      }

      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        throw new Error('Background location permission (Allow all the time) is required');
      }

      // 2. Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const { latitude, longitude } = location.coords;

      // 3. Call backend
      const session = await attendanceService.punchIn(latitude, longitude);
      setActiveSession(session);

      // 3. Start background tracking
      await startBackgroundLocationTask();
    } catch (error) {
      console.error('Punch-in error:', error);
      throw error;
    } finally {
      setIsPunching(false);
    }
  }

  /**
   * Performs a punch-out action.
   */
  async function punchOut() {
    try {
      setIsPunching(true);

      // 1. Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const { latitude, longitude } = location.coords;

      // 2. Call backend
      await attendanceService.punchOut(latitude, longitude);
      setActiveSession(null);

      // 3. Stop background tracking
      await stopBackgroundLocationTask();
    } catch (error) {
      console.error('Punch-out error:', error);
      throw error;
    } finally {
      setIsPunching(false);
    }
  }

  return (
    <AttendanceContext.Provider
      value={{
        activeSession,
        isLoading,
        isPunching,
        punchIn,
        punchOut,
        refreshSession,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
}
