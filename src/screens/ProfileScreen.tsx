import React from 'react';
import { View, StyleSheet, Alert, Image } from 'react-native';
import { Text, Button, Avatar, List, Divider, Surface } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { THEME } from '../constants/config';

/**
 * Profile Screen - displays user info and logout button.
 */
function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.profileHeader} elevation={1}>
        <Avatar.Text 
          size={80} 
          label={user?.name?.substring(0, 2).toUpperCase() || 'U'} 
          style={styles.avatar}
          backgroundColor={THEME.primary}
        />
        <Text variant="headlineSmall" style={styles.userName}>{user?.name}</Text>
        <Text variant="bodyLarge" style={styles.userRole}>{user?.role?.toUpperCase()}</Text>
      </Surface>

      <View style={styles.infoSection}>
        <List.Item
          title="Phone Number"
          description={user?.phone}
          left={(props) => <List.Icon {...props} icon="phone" />}
        />
        <Divider />
        <List.Item
          title="Organization ID"
          description={user?.orgId}
          left={(props) => <List.Icon {...props} icon="office-building" />}
        />
        <Divider />
      </View>

      <View style={styles.footer}>
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor={THEME.error}
          contentStyle={styles.logoutButtonContent}
        >
          Logout
        </Button>
        <Text variant="bodySmall" style={styles.versionText}>
          Antigravity Employee v1.0.0
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  profileHeader: {
    paddingVertical: 40,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatar: {
    marginBottom: 16,
  },
  userName: {
    fontWeight: 'bold',
    color: '#333',
  },
  userRole: {
    color: '#666',
    marginTop: 4,
    letterSpacing: 1,
    fontSize: 12,
  },
  infoSection: {
    marginTop: 24,
    backgroundColor: '#fff',
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
    paddingBottom: 40,
  },
  logoutButton: {
    borderColor: THEME.error,
    borderRadius: 8,
  },
  logoutButtonContent: {
    height: 56,
  },
  versionText: {
    textAlign: 'center',
    marginTop: 24,
    color: '#999',
  },
});

export default ProfileScreen;
