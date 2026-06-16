import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Surface, ActivityIndicator, List, Avatar, Divider, Icon } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/admin.service';
import { AttendanceLog } from '../../types';
import { THEME } from '../../constants/config';
import { format } from 'date-fns';

function AdminDashboardScreen() {
  const { user } = useAuth();
  const [activeLogs, setActiveLogs] = useState<AttendanceLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const todayLogs = await adminService.getTodayLogs();
      const active = todayLogs.filter(log => log.status === 'active');
      setActiveLogs(active);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={THEME.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME.primary]} />
        }
      >
        <Surface style={styles.greetingCard} elevation={0}>
          <Text variant="bodyLarge" style={styles.greetingSub}>Owner Dashboard</Text>
          <Text variant="headlineMedium" style={styles.greetingName}>{user?.name}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBadge}>
              <Text style={styles.statBadgeText}>{activeLogs.length} Active Shifts</Text>
            </View>
          </View>
        </Surface>

        <Text variant="titleLarge" style={styles.sectionTitle}>Currently Punched In</Text>

        {activeLogs.length === 0 ? (
          <Surface style={styles.emptyCard} elevation={1}>
            <Icon source="clock-outline" size={48} color="#9CA3AF" />
            <Text variant="bodyLarge" style={styles.emptyText}>No employees are currently punched in.</Text>
          </Surface>
        ) : (
          <Surface style={styles.listCard} elevation={1}>
            {activeLogs.map((log, index) => (
              <React.Fragment key={log.id}>
                <List.Item
                  style={{ paddingLeft: 4, paddingRight: 4, marginLeft: 4, marginRight: 4 }}
                  title={log.userName || 'Unknown Employee'}
                  description={`Punched in at ${format(new Date(log.punchInTime), 'h:mm a')}`}
                  left={props => (
                    <Avatar.Text 
                      {...props} 
                      size={40} 
                      label={(log.userName || 'U').substring(0, 1).toUpperCase()} 
                      style={{ backgroundColor: THEME.primary }}
                      labelStyle={{ color: 'white' }}
                    />
                  )}
                  right={props => (
                    <View style={styles.statusBadgeActive}>
                      <View style={styles.statusDotActive} />
                      <Text style={styles.statusTextActive}>Active</Text>
                    </View>
                  )}
                />
                {index < activeLogs.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Surface>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  greetingSub: {
    color: '#4B5563',
    marginBottom: 4,
  },
  greetingName: {
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statBadge: {
    backgroundColor: '#10614F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  statusBadgeActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'center',
  },
  statusDotActive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
    marginRight: 6,
  },
  statusTextActive: {
    color: '#059669',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default AdminDashboardScreen;
