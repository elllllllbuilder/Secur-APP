// app/(private)/member/support/index.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { api } from '@/lib/api';

type SupportTicket = {
  id: string;
  type: string;
  status: string;
  title: string;
  description: string;
  location: string;
  createdAt: string;
};

const TYPE_CONFIG = {
  health: { icon: '🏥', label: 'Emergência Médica', color: '#ef4444' },
  breakdown: { icon: '🔧', label: 'Pane Mecânica', color: '#f59e0b' },
  accident: { icon: '🚗', label: 'Acidente', color: '#8b5cf6' },
  theft: { icon: '🚨', label: 'Roubo/Furto', color: '#10b981' },
};

const STATUS_CONFIG = {
  open: { label: 'Aberto', color: '#3b82f6', bg: '#dbeafe' },
  in_progress: { label: 'Em Andamento', color: '#f59e0b', bg: '#fef3c7' },
  resolved: { label: 'Resolvido', color: '#10b981', bg: '#d1fae5' },
  closed: { label: 'Fechado', color: '#6b7280', bg: '#f3f4f6' },
};

export default function SupportListScreen() {
  useAuthGuard();
  const router = useRouter();

  const { data: tickets = [], isLoading, refetch } = useQuery<SupportTicket[]>({
    queryKey: ['support-tickets'],
    queryFn: async () => {
      const res = await api.get('/support/tickets');
      console.log('[SUPPORT] Resposta:', res.data);
      const data = res.data?.data?.data || res.data?.data || res.data || [];
      console.log('[SUPPORT] Tickets:', data);
      return Array.isArray(data) ? data : [];
    },
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📋 Minhas Solicitações</Text>
        <TouchableOpacity
          style={styles.newButton}
          onPress={() => router.push('/(private)/member/support/new')}
        >
          <Text style={styles.newButtonText}>+ Nova</Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>Nenhuma solicitação ainda</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/(private)/member/support/new')}
            >
              <Text style={styles.emptyButtonText}>Solicitar Apoio</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const typeConfig = TYPE_CONFIG[item.type as keyof typeof TYPE_CONFIG];
          const statusConfig = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG];

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/(private)/member/support/${item.id}`)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.typeContainer}>
                  <Text style={styles.typeIcon}>{typeConfig?.icon}</Text>
                  <Text style={styles.typeLabel}>{typeConfig?.label}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusConfig?.bg }]}>
                  <Text style={[styles.statusText, { color: statusConfig?.color }]}>
                    {statusConfig?.label}
                  </Text>
                </View>
              </View>

              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.title || item.description}
              </Text>
              <Text style={styles.cardLocation} numberOfLines={1}>
                📍 {item.location}
              </Text>
              <Text style={styles.cardDate}>
                {formatDate(item.createdAt)}
              </Text>
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
  newButton: {
    backgroundColor: '#00a9ff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  newButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeIcon: {
    fontSize: 24,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  cardLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#00a9ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
