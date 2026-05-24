import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Button, Card, ActivityIndicator, Snackbar } from 'react-native-paper';
import { useAttendance } from '../context/AttendanceContext';
import { THEME } from '../constants/config';
import { formatTime, formatDuration } from '../utils/formatters';

/**
 * Active Shift Screen - shown when the employee is currently PUNCHED IN.
 */
function ActiveShiftScreen() {
  const { activeSession, punchOut, isPunching, refreshSession } = useAttendance();
  const [elapsedTime, setElapsedTime] = useState('0h 0m');
  const [refreshing, setRefreshing] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshSession();
    } catch (err) {
      console.error('Failed to refresh session:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Update elapsed time every minute
  useEffect(() => {
    if (!activeSession) return;

    const updateTime = () => {
      setElapsedTime(formatDuration(activeSession.punchInTime));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Every 60 seconds

    return () => clearInterval(interval);
  }, [activeSession]);

  const handlePunchOut = async () => {
    try {
      await punchOut();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || 'Failed to punch out. Please try again.');
      setErrorVisible(true);
    }
  };

  if (!activeSession) {
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
      <View style={styles.statusHeader}>
        <View style={styles.pulseDot} />
        <Text variant="titleLarge" style={styles.statusText}>Shift in Progress</Text>
      </View>

      <Card style={styles.timerCard}>
        <Card.Content style={styles.timerContent}>
          <Text variant="displayMedium" style={styles.timerText}>{elapsedTime}</Text>
          <Text variant="bodyLarge" style={styles.timerSubtext}>Work Time Elapsed</Text>
        </Card.Content>
      </Card>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text variant="bodyLarge" style={styles.detailLabel}>Punched in at:</Text>
          <Text variant="bodyLarge" style={styles.detailValue}>
            {formatTime(activeSession.punchInTime)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text variant="bodyLarge" style={styles.detailLabel}>Punch-in Location:</Text>
          <Text variant="bodyMedium" style={styles.detailValue}>
            {activeSession.punchInLat?.toFixed(4) || '0.0000'}, {activeSession.punchInLng?.toFixed(4) || '0.0000'}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handlePunchOut}
          loading={isPunching}
          disabled={isPunching}
          style={styles.punchOutButton}
          contentStyle={styles.punchOutButtonContent}
          buttonColor={THEME.error}
          labelStyle={styles.punchOutButtonLabel}
        >
          {isPunching ? 'Punching Out...' : 'PUNCH OUT'}
        </Button>
        <Text variant="bodySmall" style={styles.trackingHint}>
          GPS location is sent every 5 minutes automatically.
        </Text>
      </View>

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
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  pulseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    marginRight: 12,
  },
  statusText: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  timerCard: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    elevation: 0,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 40,
  },
  timerContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  timerText: {
    fontWeight: 'bold',
    color: THEME.primary,
  },
  timerSubtext: {
    color: '#666',
    marginTop: 8,
  },
  detailsContainer: {
    width: '100%',
    marginBottom: 60,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    color: '#666',
  },
  detailValue: {
    fontWeight: '600',
    color: '#333',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
  },
  punchOutButton: {
    width: '90%',
    borderRadius: 32,
    elevation: 4,
  },
  punchOutButtonContent: {
    height: 72,
  },
  punchOutButtonLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  trackingHint: {
    marginTop: 16,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default ActiveShiftScreen;
