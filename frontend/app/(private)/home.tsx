// app/(private)/home.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getMe, getMySubscription, getPlanById } from '@/services/profile';

export default function Home() {
  const router = useRouter();

  const { data: me } = useQuery({ queryKey: ['me'], queryFn: getMe });

  const { data: sub, isLoading: subLoading } = useQuery({
    queryKey: ['me/subscription'],
    queryFn: getMySubscription,
  });

  // Se não veio "plan" mas veio "planId", busca o plano
  const { data: fetchedPlan } = useQuery({
    queryKey: ['plan', sub?.planId],
    queryFn: () => getPlanById(sub!.planId!),
    enabled: !!sub?.planId && !sub?.plan,
  });

  if (subLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  const isMember = sub?.status === 'active';
  const plan = sub?.plan ?? fetchedPlan ?? null;

  const planName =
    plan?.displayName ?? plan?.name ?? plan?.tier ?? '—';

  const planPriceCents =
    plan?.priceCents ?? plan?.amountCents; // cobre ambos os nomes

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>Área do Associado</Text>

      {!isMember && (
        <TouchableOpacity
          style={{ backgroundColor: '#00a9ff', padding: 12, borderRadius: 8 }}
          onPress={() => router.push('/(private)/associate')}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>
            ASSOCIE-SE À ASSOCIAUT
          </Text>
        </TouchableOpacity>
      )}

      {isMember && (
        <View style={{ borderWidth: 1, borderColor: '#e5e7eb', padding: 12, borderRadius: 8 }}>
          <Text style={{ fontWeight: '700' }}>Seu plano</Text>
          <Text style={{ marginTop: 4 }}>{planName}</Text>

          {typeof planPriceCents === 'number' && (
            <Text style={{ color: '#6b7280' }}>
              R$ {(planPriceCents / 100).toFixed(2).replace('.', ',')}
            </Text>
          )}

          {!!sub?.startedAt && (
            <Text style={{ color: '#6b7280' }}>
              Ativo desde: {new Date(sub.startedAt).toLocaleDateString()}
            </Text>
          )}

          <TouchableOpacity
            onPress={() => router.push('/(private)/member/plan')}
            style={{ marginTop: 8 }}
          >
            <Text style={{ color: '#2563eb' }}>Ver detalhes do plano</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={{ borderWidth: 1, borderColor: '#e5e7eb', padding: 12, borderRadius: 8 }}
        onPress={() => router.push('/(private)/member/documents')}
      >
        <Text>Upload de documentos</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
