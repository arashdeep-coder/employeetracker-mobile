import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Button, Card, Avatar, ActivityIndicator, Snackbar, Surface, IconButton, List, Divider, Icon } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useAttendance } from '../context/AttendanceContext';
import { THEME } from '../constants/config';
import { requestLocationPermissions } from '../utils/permissions';
import { formatDate, formatDuration } from '../utils/formatters';
import { attendanceService } from '../services/attendance.service';
import { AttendanceLog } from '../types';
import { parseISO } from 'date-fns';

/**
 * Home Screen - shown when NOT punched in.
 */
function HomeScreen() {
  const { user } = useAuth();
  const { punchIn, isPunching, refreshSession, isLoading } = useAttendance();
  const [lastShift, setLastShift] = useState<AttendanceLog | null>(null);
  const [stats, setStats] = useState({ days: 0, hours: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchHomeData = async () => {
    try {
      const history = await attendanceService.getHistory(30); // Fetch 30 days for stats
      
      if (history.length > 0) {
        setLastShift(history[0]);
      }

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const logsThisMonth = history.filter(log => {
        const date = parseISO(log.punchInTime);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });

      const uniqueDays = new Set(logsThisMonth.map(log => {
        const date = parseISO(log.punchInTime);
        return date.toDateString();
      }));

      const totalMinutes = logsThisMonth.reduce((acc, log) => {
        if (log.totalMinutes !== null && log.totalMinutes !== undefined) {
          return acc + log.totalMinutes;
        }
        if (log.punchInTime && log.punchOutTime) {
          const start = parseISO(log.punchInTime);
          const end = parseISO(log.punchOutTime);
          const diffMs = Math.max(0, end.getTime() - start.getTime());
          return acc + Math.floor(diffMs / 60000);
        }
        return acc;
      }, 0);
      const hours = Math.floor(totalMinutes / 60);

      setStats({ days: uniqueDays.size, hours });
    } catch (error) {
      console.error('Failed to fetch home data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshSession(), fetchHomeData()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const handlePunchIn = async () => {
    if (isPunching) return; // Prevent double pressing

    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) return;

    try {
      await punchIn();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || 'Failed to punch in. Please try again.');
      setErrorVisible(true);
    }
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={THEME.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>Haazri</Text>
        <IconButton icon="bell-outline" iconColor="#666" size={24} onPress={() => {}} />
      </View> */}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME.primary]} />
        }
      >
        {/* Greeting Card */}
        <Surface style={styles.greetingCard} elevation={0}>
          <Text variant="bodyLarge" style={styles.greetingSub}>Welcome back,</Text>
          <Text variant="headlineMedium" style={styles.greetingName}>{user?.name}</Text>
          
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Off duty</Text>
          </View>
        </Surface>

        {/* Punch In Button */}
        <Surface style={styles.punchInCard} elevation={1}>
          <List.Item
            title={isPunching ? "Punching in..." : "Punch in"}
            titleStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}
            left={(props) => <List.Icon {...props} icon="clock-outline" color="#fff" />}
            right={(props) => isPunching 
              ? <ActivityIndicator {...props} color="#fff" /> 
              : <List.Icon {...props} icon="arrow-right" color="#fff" />
            }
            onPress={isPunching ? undefined : handlePunchIn}
            style={styles.punchInItem}
          />
        </Surface>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Surface style={styles.statCard} elevation={1}>
            <List.Icon icon="calendar-month" color="#6B7280" style={styles.statIcon} />
            <Text variant="bodyMedium" style={styles.statLabel}>This month</Text>
            <Text variant="headlineMedium" style={styles.statValue}>{stats.days} days</Text>
          </Surface>

          <Surface style={styles.statCard} elevation={1}>
            <List.Icon icon="clock-outline" color="#6B7280" style={styles.statIcon} />
            <Text variant="bodyMedium" style={styles.statLabel}>Total hours</Text>
            <Text variant="headlineMedium" style={styles.statValue}>{stats.hours}h</Text>
          </Surface>
        </View>

        {/* Last Shift Card */}
        {lastShift && (
          <Surface style={styles.lastShiftCard} elevation={1}>
            <View style={styles.lastShiftHeader}>
              <View style={styles.iconBackgroundGreen}>
                <List.Icon icon="history" color="#10614F" />
              </View>
              <View>
                <Text variant="titleMedium" style={styles.lastShiftTitle}>Last shift</Text>
                <Text variant="bodySmall" style={styles.lastShiftSub}>{formatDate(lastShift.punchInTime)}</Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.lastShiftDetails}>
              <View>
                <Text variant="bodySmall" style={styles.detailLabel}>Duration</Text>
                <Text variant="titleMedium" style={styles.detailValue}>
                  {formatDuration(lastShift.punchInTime, lastShift.punchOutTime)}
                </Text>
              </View>

              <View>
                <Text variant="bodySmall" style={styles.detailLabel}>Status</Text>
                <View style={styles.statusBadgeCompleted}>
                  <Icon source="check" color="#059669" size={16} />
                  <Text style={styles.statusTextCompleted}>Completed</Text>
                </View>
              </View>
            </View>
          </Surface>
        )}

        <Snackbar
          visible={errorVisible}
          onDismiss={() => setErrorVisible(false)}
          duration={3000}
          style={{ backgroundColor: THEME.error }}
        >
          {errorMessage}
        </Snackbar>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingCard: {
    backgroundColor: '#F0FDF4', // Light green
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10614F',
    marginRight: 8,
  },
  statusText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  punchInCard: {
    backgroundColor: '#10614F', // Dark green
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  punchInItem: {
    paddingVertical: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '48%',
  },
  statIcon: {
    margin: 0,
    marginBottom: 8,
  },
  statLabel: {
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontWeight: 'bold',
    color: '#111827',
  },
  lastShiftCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  lastShiftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBackgroundGreen: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lastShiftTitle: {
    fontWeight: 'bold',
    color: '#111827',
  },
  lastShiftSub: {
    color: '#6B7280',
  },
  divider: {
    marginBottom: 16,
  },
  lastShiftDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontWeight: 'bold',
    color: '#111827',
  },
  statusBadgeCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIconSmall: {
    marginRight: 4,
  },
  statusTextCompleted: {
    color: '#059669',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
