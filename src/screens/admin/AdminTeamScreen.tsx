import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Surface, ActivityIndicator, List, Avatar, Divider, Icon } from 'react-native-paper';
import { adminService } from '../../services/admin.service';
import { User } from '../../types';
import { THEME } from '../../constants/config';

function AdminTeamScreen() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTeam = async () => {
    try {
      const data = await adminService.getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to fetch team data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTeam();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchTeam();
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
        <Text variant="titleLarge" style={styles.sectionTitle}>All Employees ({employees.length})</Text>

        {employees.length === 0 ? (
          <Surface style={styles.emptyCard} elevation={1}>
            <Icon source="account-group" size={48} color="#9CA3AF" />
            <Text variant="bodyLarge" style={styles.emptyText}>No employees found.</Text>
          </Surface>
        ) : (
          <Surface style={styles.listCard} elevation={1}>
            {employees.map((emp, index) => (
              <React.Fragment key={emp.id}>
                <List.Item
                  style={{ paddingLeft: 4, paddingRight: 4, marginLeft: 4, marginRight: 4 }}
                  title={emp.name}
                  description={emp.phoneNumber || 'No phone number'}
                  left={props => (
                    <Avatar.Text 
                      {...props} 
                      size={40} 
                      label={emp.name.substring(0, 1).toUpperCase()} 
                      style={{ backgroundColor: emp.role === 'owner' ? '#111827' : THEME.primary }}
                      labelStyle={{ color: 'white' }}
                    />
                  )}
                  right={props => emp.role === 'owner' ? (
                    <View style={styles.roleBadgeOwner}>
                      <Text style={styles.roleTextOwner}>Owner</Text>
                    </View>
                  ) : null}
                />
                {index < employees.length - 1 && <Divider />}
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
  roleBadgeOwner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'center',
  },
  roleTextOwner: {
    color: '#374151',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default AdminTeamScreen;
