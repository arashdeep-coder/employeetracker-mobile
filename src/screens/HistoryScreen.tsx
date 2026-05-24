import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, SectionList, RefreshControl } from 'react-native';
import { Text, List, Avatar, ActivityIndicator, Divider, Surface } from 'react-native-paper';
import { attendanceService } from '../services/attendance.service';
import { AttendanceLog } from '../types';
import { formatDate, formatTime, formatDuration } from '../utils/formatters';
import { THEME } from '../constants/config';

/**
 * History Screen - displays the last 30 days of attendance logs grouped by date.
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

  const sections = React.useMemo(() => {
    const result: { title: string; data: AttendanceLog[] }[] = [];
    logs.forEach(log => {
      const date = formatDate(log.punchInTime);
      const section = result.find(s => s.title === date);
      if (section) {
        section.data.push(log);
      } else {
        result.push({ title: date, data: [log] });
      }
    });
    return result;
  }, [logs]);

  const renderItem = ({ item }: { item: AttendanceLog }) => {
    const isCompleted = item.status === 'completed';
    const duration = formatDuration(item.punchInTime, item.punchOutTime);

    return (
      <Surface style={styles.logCard} elevation={1}>
        <View style={styles.cardHeader}>
          <View style={isCompleted ? styles.iconBgGreen : styles.iconBgAmber}>
            <List.Icon icon={isCompleted ? "check" : "alert-circle-outline"} color={isCompleted ? "#10614F" : "#F59E0B"} />
          </View>
          <View style={styles.titleContainer}>
            <Text variant="titleMedium" style={styles.cardTitle}>
              {formatTime(item.punchInTime)} — {item.punchOutTime ? formatTime(item.punchOutTime) : 'Missed'}
            </Text>
            <Text variant="bodySmall" style={styles.cardSub}>
              Duration: {duration}
            </Text>
          </View>
          <View style={isCompleted ? styles.badgeGreen : styles.badgeAmber}>
            <Text style={isCompleted ? styles.badgeTextGreen : styles.badgeTextAmber}>
              {isCompleted ? 'Completed' : 'Active'}
            </Text>
          </View>
        </View>
      </Surface>
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
      <SectionList
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text variant="titleSmall" style={styles.sectionHeaderText}>{title}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge" style={styles.emptyText}>No attendance history yet</Text>
          </View>
        }
        contentContainerStyle={logs.length === 0 ? styles.flexGrow : styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Light gray
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  sectionHeader: {
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  sectionHeaderText: {
    fontWeight: 'bold',
    color: '#6B7280',
    fontSize: 14,
  },
  logCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBgGreen: {
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconBgAmber: {
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: '600',
    color: '#111827',
  },
  cardSub: {
    color: '#6B7280',
    marginTop: 2,
  },
  badgeGreen: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeAmber: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeTextGreen: {
    color: '#059669',
    fontSize: 12,
    fontWeight: 'bold',
  },
  badgeTextAmber: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: '#9CA3AF',
  },
  flexGrow: {
    flexGrow: 1,
  },
});

export default HistoryScreen;
