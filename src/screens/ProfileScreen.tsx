import React from 'react';
import { View, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { Text, Button, Avatar, List, Divider, Surface, IconButton, Icon } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useAttendance } from '../context/AttendanceContext';
import { THEME } from '../constants/config';

/**
 * Profile Screen - displays user info and logout button.
 */
function ProfileScreen() {
  const { user, organization, logout } = useAuth();
  const { activeSession, punchOut } = useAttendance();

  const handleLogout = () => {
    if (activeSession) {
      Alert.alert(
        'Active Shift Warning',
        'You are currently punched in. Logging out will also punch you out. Do you want to continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Punch Out & Logout', 
            style: 'destructive',
            onPress: async () => {
              try {
                await punchOut();
                await logout();
              } catch (error) {
                Alert.alert('Error', 'Failed to punch out. Please try again.');
              }
            }
          },
        ]
      );
    } else {
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
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>Account settings</Text>
        <IconButton icon="pencil-outline" iconColor="#666" size={24} onPress={() => {}} />
      </View> */}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <Surface style={styles.profileCard} elevation={1}>
          <View style={styles.avatarContainer}>
            <Avatar.Text 
              size={80} 
              label={user?.name?.substring(0, 2).toUpperCase() || 'U'} 
              style={styles.avatar}
              backgroundColor={THEME.primary}
            />
          </View>
          <Text variant="titleLarge" style={styles.userName}>{user?.name}</Text>
          <Text variant="bodyMedium" style={styles.userRole}>{user?.role?.toUpperCase()}</Text>
          
          <View style={styles.statusBadge}>
            <Icon source="check" color="#10614F" size={16} />
            <Text style={styles.statusText}>Active</Text>
          </View>
        </Surface>

        <Text style={{ marginLeft: 8, marginBottom: 8, color: '#6B7280', fontWeight: 'bold' }}>ACCOUNT</Text>
        <Surface style={styles.infoCard} elevation={1}>
          <List.Item
            title="Phone number"
            description={user?.phoneNumber || 'N/A'}
            left={(props) => (
              <View style={[styles.iconBackgroundBlue, { marginLeft: 16, marginRight: 16 }]}>
                <Icon source="phone" color="#3B82F6" size={24} />
              </View>
            )}
            style={styles.listItem}
          />
        </Surface>

        <Text style={{ marginLeft: 8, marginBottom: 8, marginTop: 16, color: '#6B7280', fontWeight: 'bold' }}>ORGANIZATION</Text>
        <Surface style={styles.infoCard} elevation={1}>
          <List.Item
            title={organization?.name || 'Organization Name'}
            description="Name"
            left={(props) => (
              <View style={[styles.iconBackgroundPurple, { marginLeft: 16, marginRight: 16 }]}>
                <Icon source="office-building" color="#8B5CF6" size={24} />
              </View>
            )}
            style={styles.listItem}
          />
          <Divider />
          <List.Item
            title={organization?.orgCode || 'N/A'}
            description="Organization Code"
            left={(props) => (
              <View style={[styles.iconBackgroundPurple, { marginLeft: 16, marginRight: 16 }]}>
                <Icon source="pound" color="#8B5CF6" size={24} />
              </View>
            )}
            style={styles.listItem}
          />
          {/* <Divider />
          <List.Item
            title={organization?.email || 'N/A'}
            description="Verified Email"
            left={(props) => (
              <View style={[styles.iconBackgroundPurple, { marginLeft: 16, marginRight: 16 }]}>
                <Icon source="email" color="#8B5CF6" size={24} />
              </View>
            )}
            style={styles.listItem}
          /> */}
        </Surface>

        {/* Options List */}
        <Surface style={styles.optionsCard} elevation={1}>
          {/* <List.Item
            title="Notifications"
            left={(props) => <List.Icon {...props} icon="bell-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" color="#ccc" />}
          /> */}
          <Divider />
          <List.Item
            title="Privacy & security"
            left={(props) => <List.Icon {...props} icon="shield-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" color="#ccc" />}
          />
          <Divider />
          {/* <List.Item
            title="Help & support"
            left={(props) => <List.Icon {...props} icon="help-circle-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" color="#ccc" />}
          /> */}
        </Surface>

        {/* Logout Button */}
        <Surface style={[styles.infoCard, styles.logoutButton]} elevation={1}>
          <List.Item
            title="Logout"
            titleStyle={{ color: '#EF4444', fontWeight: 'bold' }}
            left={(props) => <List.Icon {...props} icon="logout" color="#EF4444" />}
            right={(props) => <List.Icon {...props} icon="arrow-right" color="#EF4444" />}
            onPress={handleLogout}
            style={styles.listItem}
          />
        </Surface>

        <Text variant="bodySmall" style={styles.versionText}>
          Haazri v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Light gray
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#111827',
  },
  scrollContent: {
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: '#10614F', // Dark green
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cameraIcon: {
    margin: 0,
  },
  userName: {
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  userRole: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  optionsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  listItem: {
    paddingVertical: 12,
  },
  iconBackgroundBlue: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBackgroundPurple: {
    backgroundColor: '#F5F3FF',
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  versionText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginBottom: 20,
  },
});

export default ProfileScreen;
