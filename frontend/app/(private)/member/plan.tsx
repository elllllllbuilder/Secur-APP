import React, { useMemo } from 'react';
import { View, Text, Alert, TouchableOpacity, Linking } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getMySubscription } from '@/services/profile';

function fmtCurrency(cents?: number) {
  if (typeof cents !== 'number') return '-';
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function humanRemaining(target?: string | null) {
  if (!target) return null;
  const now = new Date();
  const end = new Date(target);
  const ms = end.getTime() - now.getTime();
  if (ms <= 0) return 'encerrado';
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
}

export default function Plan() {
  const { data: sub } = useQuery({
    queryKey: ['me/subscription'],
    queryFn: getMySubscription,
  });

  // Normalizações/fallbacks de contrato
  const plan = (sub as any)?.plan ?? null;
  const planName = plan?.displayName ?? plan?.tier ?? '—';
  const planPriceCents: number | undefined =
    (plan && (plan.priceCents ?? plan.amountCents)) ?? undefined;

  // Alguns backends mandam "eligibleAt" em vez de "graceEndsAt"
  const graceEndsAt: string | null =
    (sub as any)?.graceEndsAt ?? (sub as any)?.eligibleAt ?? null;

  const currentPeriodEnd: string | null =
    (sub as any)?.currentPeriodEnd ?? (sub as any)?.periodEnd ?? null;

  const graceRemaining = useMemo(() => humanRemaining(graceEndsAt), [graceEndsAt]);
  const periodRemaining = useMemo(() => humanRemaining(currentPeriodEnd), [currentPeriodEnd]);

  function openTerm(slug: string) {
    // Se tiver uma BASE_URL pública, use-a aqui
    Linking.openURL(`http://localhost:3333/public/terms/${slug}`).catch(() =>
      Alert.alert('Erro', 'Não foi possível abrir o termo'),
    );
  }

  return (
    <View style={{ flex: 1, padding: 20, gap: 8 }}>
      <Text style={{ fontSize: 18, fontWeight: '700' }}>Meu Plano</Text>

      {!sub ? (
        <Text>Você ainda não possui plano ativo.</Text>
      ) : (
        <>
          <Text>Plano: {planName}</Text>
          <Text>Valor: {fmtCurrency(planPriceCents)}</Text>
          {(sub as any)?.startedAt && (
            <Text>Ativo desde: {new Date((sub as any).startedAt).toLocaleDateString()}</Text>
          )}

          {/* Carência */}
          <View
            style={{
              marginTop: 10,
              padding: 12,
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 10,
            }}
          >
            <Text style={{ fontWeight: '700' }}>Carência</Text>
            {graceEndsAt ? (
              <Text style={{ color: '#6b7280' }}>
                Até: {new Date(graceEndsAt).toLocaleDateString()} ({graceRemaining} restante)
              </Text>
            ) : (
              <Text style={{ color: '#6b7280' }}>Este plano não possui carência configurada.</Text>
            )}
          </View>

          {/* Período de proteção (ciclo atual) */}
          <View
            style={{
              marginTop: 10,
              padding: 12,
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 10,
            }}
          >
            <Text style={{ fontWeight: '700' }}>Proteção (ciclo atual)</Text>
            {currentPeriodEnd ? (
              <Text style={{ color: '#6b7280' }}>
                Até: {new Date(currentPeriodEnd).toLocaleDateString()} ({periodRemaining} restante)
              </Text>
            ) : (
              <Text style={{ color: '#6b7280' }}>
                O fim do período atual não foi definido (MVP). Após integrar recorrência, este
                campo será atualizado a cada ciclo.
              </Text>
            )}
          </View>

          {/* Termos */}
          <TouchableOpacity onPress={() => openTerm('estatuto')} style={{ marginTop: 12 }}>
            <Text style={{ color: '#2563eb' }}>Ver Estatuto</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openTerm('termos-adesao')} style={{ marginTop: 8 }}>
            <Text style={{ color: '#2563eb' }}>Ver Termos de Adesão</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
