import * as SecureStore from 'expo-secure-store';
import { TOKEN_KEY, USER_KEY } from '../constants/config';
import { User } from '../types';

/**
 * Saves the JWT token to secure storage.
 */
export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

/**
 * Retrieves the JWT token from secure storage.
 */
export async function getToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

/**
 * Deletes the JWT token from secure storage.
 */
export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

/**
 * Saves user data to secure storage.
 */
export async function saveUser(user: User): Promise<void> {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

/**
 * Retrieves user data from secure storage.
 */
export async function getUser(): Promise<User | null> {
  const userJson = await SecureStore.getItemAsync(USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson) as User;
  } catch {
    return null;
  }
}

/**
 * Deletes user data from secure storage.
 */
export async function removeUser(): Promise<void> {
  await SecureStore.deleteItemAsync(USER_KEY);
}

/**
 * Clears all auth data from secure storage.
 */
export async function clearAuthData(): Promise<void> {
  await Promise.all([removeToken(), removeUser()]);
}
