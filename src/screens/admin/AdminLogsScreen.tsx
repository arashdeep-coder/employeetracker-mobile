import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Surface, ActivityIndicator, List, Avatar, Divider, Icon } from 'react-native-paper';
import { adminService } from '../../services/admin.service';
import { AttendanceLog } from '../../types';
import { THEME } from '../../constants/config';
import { format } from 'date-fns';

function AdminLogsScreen() {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = async () => {
    try {
      const data = await adminService.getTodayLogs();
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch logs data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLogs();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <View style={[styles.statusBadge, styles.badgeActive]}>
          <Text style={[styles.statusText, styles.textActive]}>Active</Text>
        </View>
      );
    }
    if (status === 'completed') {
      return (
        <View style={[styles.statusBadge, styles.badgeCompleted]}>
          <Text style={[styles.statusText, styles.textCompleted]}>Completed</Text>
        </View>
      );
    }
    return (
      <View style={[styles.statusBadge, styles.badgeMissed]}>
        <Text style={[styles.statusText, styles.textMissed]}>Missed Out</Text>
      </View>
    );
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME.primary]} />
        }
      >
        <Text variant="titleLarge" style={styles.sectionTitle}>Today's Logs</Text>

        {logs.length === 0 ? (
          <Surface style={styles.emptyCard} elevation={1}>
            <Icon source="history" size={48} color="#9CA3AF" />
            <Text variant="bodyLarge" style={styles.emptyText}>No attendance logs for today.</Text>
          </Surface>
        ) : (
          <Surface style={styles.listCard} elevation={1}>
            {logs.map((log, index) => (
              <React.Fragment key={log.id}>
                <List.Item
                  style={{ paddingLeft: 4, paddingRight: 4, marginLeft: 4, marginRight: 4 }}
                  title={log.userName || 'Unknown Employee'}
                  description={`In: ${format(new Date(log.punchInTime), 'h:mm a')}${log.punchOutTime ? ` | Out: ${format(new Date(log.punchOutTime), 'h:mm a')}` : ''}`}
                  left={props => (
                    <Avatar.Text 
                      {...props} 
                      size={40} 
                      label={(log.userName || 'U').substring(0, 1).toUpperCase()} 
                      style={{ backgroundColor: THEME.primary }}
                      labelStyle={{ color: 'white' }}
                    />
                  )}
                  right={() => (
                    <View style={styles.rightContent}>
                      {getStatusBadge(log.status)}
                    </View>
                  )}
                />
                {index < logs.length - 1 && <Divider />}
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
  rightContent: {
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  badgeActive: {
    backgroundColor: '#ECFDF5',
  },
  textActive: {
    color: '#059669',
  },
  badgeCompleted: {
    backgroundColor: '#EEF2FF',
  },
  textCompleted: {
    color: '#4F46E5',
  },
  badgeMissed: {
    backgroundColor: '#FEF2F2',
  },
  textMissed: {
    color: '#DC2626',
  },
});

export default AdminLogsScreen;
