import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, User } from '../types';
import { authService } from '../services/auth.service';
import { saveToken, saveUser, getToken, getUser, clearAuthData } from '../utils/storage';
import { stopBackgroundLocationTask } from '../tasks/locationTask';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize: Load token and user from storage
  useEffect(() => {
    async function loadStoredData() {
      try {
        const [storedToken, storedUser] = await Promise.all([getToken(), getUser()]);
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Failed to load auth data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadStoredData();
  }, []);

  /**
   * Logs in the user and saves credentials.
   */
  async function login(phone: string, pin: string) {
    try {
      setIsLoading(true);
      const { token: newToken, user: newUser } = await authService.login(phone, pin);
      
      await Promise.all([saveToken(newToken), saveUser(newUser)]);
      
      setToken(newToken);
      setUser(newUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Logs out the user and clears credentials.
   */
  async function logout() {
    try {
      setIsLoading(true);
      await stopBackgroundLocationTask();
      await clearAuthData();
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
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
