import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import ActiveShiftScreen from '../screens/ActiveShiftScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminTeamScreen from '../screens/admin/AdminTeamScreen';
import AdminLogsScreen from '../screens/admin/AdminLogsScreen';
import { useAttendance } from '../context/AttendanceContext';
import { useAuth } from '../context/AuthContext';
import { THEME } from '../constants/config';

const Tab = createBottomTabNavigator();

/**
 * Main Application Navigator - shown after login.
 * Uses bottom tabs for navigation between Home, History, and Profile.
 */
function AppNavigator() {
  const { activeSession } = useAttendance();
  const { user } = useAuth();

  if (user?.role === 'owner') {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName: any;
            if (route.name === 'AdminDashboard') iconName = 'view-dashboard';
            else if (route.name === 'AdminTeam') iconName = 'account-group';
            else if (route.name === 'AdminLogs') iconName = 'history';
            else if (route.name === 'Profile') iconName = 'account-cog';
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: THEME.primary,
          tabBarInactiveTintColor: 'gray',
          headerShown: true,
          headerStyle: { backgroundColor: '#fff' },
          headerTitleStyle: { fontWeight: 'bold' },
          tabBarStyle: { height: 64, paddingBottom: 8, paddingTop: 8 },
        })}
      >
        <Tab.Screen 
          name="AdminDashboard" 
          component={AdminDashboardScreen} 
          options={{ title: 'Dashboard', headerTitle: 'Owner Dashboard' }} 
        />
        <Tab.Screen 
          name="AdminTeam" 
          component={AdminTeamScreen} 
          options={{ title: 'Team', headerTitle: 'All Employees' }} 
        />
        <Tab.Screen 
          name="AdminLogs" 
          component={AdminLogsScreen} 
          options={{ title: 'Logs', headerTitle: 'Attendance Logs' }} 
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ title: 'Settings', headerTitle: 'Account Settings' }} 
        />
      </Tab.Navigator>
    );
  }

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
          headerTitle: 'Haazri'
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
