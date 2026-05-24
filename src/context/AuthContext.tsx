import React, { createContext, useContext, useState, useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { AuthContextType, User, Organization } from '../types';
import { authService } from '../services/auth.service';
import { saveToken, saveUser, getToken, getUser, clearAuthData, saveOrganization, getOrganization } from '../utils/storage';
import { stopBackgroundLocationTask } from '../tasks/locationTask';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  // Initialize: Load token and user from storage
  useEffect(() => {
    async function loadStoredData() {
      try {
        const [storedToken, storedUser, storedOrg] = await Promise.all([getToken(), getUser(), getOrganization()]);
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          if (storedOrg) setOrganization(storedOrg);
        }
      } catch (error) {
        console.error('Failed to load auth data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadStoredData();

    const subscription = DeviceEventEmitter.addListener('token_expired', () => {
      setAuthMessage('Logged out please login again');
      logout();
    });

    return () => subscription.remove();
  }, []);

  /**
   * Logs in the user and saves credentials.
   */
  async function login(orgCode: string, phone: string, pin: string) {
    try {
      const { token: newToken, user: newUser, organization: newOrg } = await authService.login(orgCode, phone, pin);
      
      const storagePromises: Promise<void>[] = [saveToken(newToken), saveUser(newUser)];
      if (newOrg) storagePromises.push(saveOrganization(newOrg));
      
      await Promise.all(storagePromises);
      
      setToken(newToken);
      setUser(newUser);
      setOrganization(newOrg || null);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logs out the user and clears credentials.
   */
  async function logout() {
    try {
      await stopBackgroundLocationTask();
      await clearAuthData();
      setToken(null);
      setUser(null);
      setOrganization(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  return (
    <AuthContext.Provider value={{ user, organization, token, isLoading, authMessage, setAuthMessage, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
