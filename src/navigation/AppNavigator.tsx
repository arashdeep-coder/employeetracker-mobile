import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import ActiveShiftScreen from '../screens/ActiveShiftScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useAttendance } from '../context/AttendanceContext';
import { THEME } from '../constants/config';

const Tab = createBottomTabNavigator();

/**
 * Main Application Navigator - shown after login.
 * Uses bottom tabs for navigation between Home, History, and Profile.
 */
function AppNavigator() {
  const { activeSession } = useAttendance();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          if (route.name === 'HomeTab') {
            iconName = activeSession ? 'clock-check' : 'home-variant';
          } else if (route.name === 'History') {
            iconName = 'history';
          } else if (route.name === 'Profile') {
            iconName = 'account';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: THEME.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        // Dynamically switch component based on session status
        component={activeSession ? ActiveShiftScreen : HomeScreen} 
        options={{ 
          title: activeSession ? 'Active Shift' : 'Home',
          headerTitle: 'Antigravity'
        }} 
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{ title: 'Attendance Logs' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Account Settings' }}
      />
    </Tab.Navigator>
  );
}

export default AppNavigator;
