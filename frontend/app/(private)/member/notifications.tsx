// app/(private)/member/notifications.tsx
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import {
  getMyNotifications,
  deleteNotification,
  deleteAllNotifications,
  type AppNotification,
} from '@/services/notifications';

export default function NotificationsScreen() {
  useAuthGuard();
  const qc = useQueryClient();

  console.log('[NOTIFICATIONS SCREEN] Tela renderizada');

  const { data: notifications = [], isLoading, refetch } = useQuery<AppNotification[]>({
    queryKey: ['notifications'],
    queryFn: getMyNotifications,
    initialData: [],
  });

  console.log('[NOTIFICATIONS SCREEN] notifications:', notifications?.length || 0);
  console.log('[NOTIFICATIONS SCREEN] isLoading:', isLoading);

  const deleteOne = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteAll = useMutation({
    mutationFn: deleteAllNotifications,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = Array.isArray(notifications) 
    ? notifications.filter(n => !n.read).length 
    : 0;

  function getIcon(type: string) {
    switch (type) {
      case 'document_approved':
        return { name: 'checkmark-circle' as const, color: '#10b981' };
      case 'document_rejected':
        return { name: 'close-circle' as const, color: '#ef4444' };
      case 'expiration_warning_10d':
      case 'expiration_warning_5d':
      case 'expiration_warning_1d':
        return { name: 'warning' as const, color: '#f59e0b' };
      default:
        return { name: 'notifications' as const, color: '#6b7280' };
    }
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString('pt-BR');
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🔔 Notificações</Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={() => deleteAll.mutate()}
          >
            <Text style={styles.markAllText}>Limpar todas</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Badge de não lidas */}
      {unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>
            {unreadCount} {unreadCount === 1 ? 'nova notificação' : 'novas notificações'}
          </Text>
        </View>
      )}

      {/* Lista de notificações */}
      <FlatList
        data={Array.isArray(notifications) ? notifications : []}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>Nenhuma notificação</Text>
          </View>
        }
        renderItem={({ item }) => {
          const icon = getIcon(item.type);
          return (
            <TouchableOpacity
              style={[styles.notificationCard, !item.read && styles.unread]}
              onPress={() => deleteOne.mutate(item.id)}
            >
              <View style={styles.iconContainer}>
                <Ionicons name={icon.name} size={32} color={icon.color} />
              </View>

              <View style={styles.content}>
                <View style={styles.titleRow}>
                  <Text style={styles.notificationTitle}>{item.title}</Text>
                  {!item.read && <View style={styles.dot} />}
                </View>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  markAllBtn: {
    padding: 8,
  },
  markAllText: {
    color: '#00a9ff',
    fontSize: 14,
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#dbeafe',
  },
  unreadText: {
    color: '#1e40af',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  notificationCard: {
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unread: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 4,
    borderLeftColor: '#00a9ff',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00a9ff',
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
  },
});
