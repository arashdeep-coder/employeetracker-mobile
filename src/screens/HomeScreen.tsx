import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Button, Card, Avatar, ActivityIndicator, Snackbar } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useAttendance } from '../context/AttendanceContext';
import { THEME } from '../constants/config';
import { requestLocationPermissions } from '../utils/permissions';
import { formatDate, formatDuration } from '../utils/formatters';
import { attendanceService } from '../services/attendance.service';
import { AttendanceLog } from '../types';

/**
 * Home Screen - shown when NOT punched in.
 */
function HomeScreen() {
  const { user } = useAuth();
  const { punchIn, isPunching, refreshSession, isLoading } = useAttendance();
  const [lastShift, setLastShift] = useState<AttendanceLog | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchLastShift = async () => {
    try {
      const history = await attendanceService.getHistory(7); // Check last 7 days
      if (history.length > 0) {
        setLastShift(history[0]);
      }
    } catch (error) {
      console.error('Failed to fetch last shift:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshSession(), fetchLastShift()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchLastShift();
  }, []);

  const handlePunchIn = async () => {
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME.primary]} />
      }
    >
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.greeting}>
          Welcome, {user?.name}
        </Text>
        <Text variant="bodyLarge" style={styles.subtext}>
          You are currently off-duty.
        </Text>
      </View>

      <View style={styles.punchContainer}>
        <Button
          mode="contained"
          onPress={handlePunchIn}
          loading={isPunching}
          disabled={isPunching}
          style={styles.punchButton}
          contentStyle={styles.punchButtonContent}
          buttonColor={THEME.primary}
          labelStyle={styles.punchButtonLabel}
        >
          {isPunching ? 'Punching In...' : 'PUNCH IN'}
        </Button>
      </View>

      {lastShift && (
        <Card style={styles.card}>
          <Card.Title
            title="Last Shift Summary"
            left={(props) => <Avatar.Icon {...props} icon="history" backgroundColor="#f0f0f0" color="#666" />}
          />
          <Card.Content>
            <Text variant="bodyMedium">
              Date: {formatDate(lastShift.punchInTime)}
            </Text>
            <Text variant="bodyMedium">
              Duration: {formatDuration(lastShift.punchInTime, lastShift.punchOutTime)}
            </Text>
          </Card.Content>
        </Card>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    marginBottom: 60,
    alignItems: 'center',
  },
  greeting: {
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtext: {
    color: '#666',
    marginTop: 8,
  },
  punchContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 60,
  },
  punchButton: {
    width: '90%',
    borderRadius: 32,
    elevation: 4,
  },
  punchButtonContent: {
    height: 72,
  },
  punchButtonLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },
});

export default HomeScreen;
