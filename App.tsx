import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AttendanceProvider } from './src/context/AttendanceContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import AppNavigator from './src/navigation/AppNavigator';
import { View, ActivityIndicator } from 'react-native';
import { THEME } from './src/constants/config';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Import background task definition
import './src/tasks/locationTask';

/**
 * Root Navigation component that switches between Auth and App stacks.
 */
function RootNavigator() {
  const { token, isLoading } = useAuth();

  React.useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      {token ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

/**
 * Custom theme for React Native Paper
 */
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: THEME.primary,
    error: THEME.error,
  },
};

/**
 * Main App Entry Point
 */
export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <AttendanceProvider>
          <RootNavigator />
          <StatusBar style="auto" />
        </AttendanceProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
