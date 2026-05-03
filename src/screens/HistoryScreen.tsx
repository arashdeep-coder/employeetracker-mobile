import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, List, Avatar, ActivityIndicator, Divider } from 'react-native-paper';
import { attendanceService } from '../services/attendance.service';
import { AttendanceLog } from '../types';
import { formatDate, formatTime, formatDuration } from '../utils/formatters';
import { THEME } from '../constants/config';

/**
 * History Screen - displays the last 30 days of attendance logs.
 */
function HistoryScreen() {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const history = await attendanceService.getHistory(30);
      setLogs(history);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const renderItem = ({ item }: { item: AttendanceLog }) => {
    const isCompleted = item.status === 'completed';
    const duration = formatDuration(item.punchInTime, item.punchOutTime);

    return (
      <List.Item
        title={formatDate(item.punchInTime)}
        description={`${formatTime(item.punchInTime)} — ${item.punchOutTime ? formatTime(item.punchOutTime) : 'Missed'} (${duration})`}
        left={(props) => (
          <Avatar.Icon
            {...props}
            size={40}
            icon={isCompleted ? 'check-circle' : 'alert-circle'}
            backgroundColor={isCompleted ? '#E8F5E9' : '#FFEBEE'}
            color={isCompleted ? '#4CAF50' : '#F44336'}
          />
        )}
        right={(props) => (
          <View style={styles.rightContent}>
            <Text
              variant="labelSmall"
              style={[
                styles.statusBadge,
                { color: isCompleted ? '#4CAF50' : '#F44336' }
              ]}
            >
              {isCompleted ? 'COMPLETED' : 'ACTIVE'}
            </Text>
          </View>
        )}
        style={styles.listItem}
      />
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={THEME.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={logs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={Divider}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge" style={styles.emptyText}>No attendance history yet</Text>
          </View>
        }
        contentContainerStyle={logs.length === 0 ? styles.flexGrow : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItem: {
    paddingVertical: 8,
  },
  rightContent: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  statusBadge: {
    fontWeight: 'bold',
    fontSize: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: '#999',
  },
  flexGrow: {
    flexGrow: 1,
  },
});

export default HistoryScreen;
