// app/(private)/member/index.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { getMe, getMySubscription } from '@/services/profile';

function RowButton({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle?: string;
  href: string;
}) {
  return (
    <Link href={href} asChild>
      <TouchableOpacity
        style={{
          padding: 16,
          borderWidth: 1,
          borderColor: '#e5e7eb',
          borderRadius: 12,
          marginTop: 10,
        }}
      >
        <Text style={{ fontWeight: '700' }}>{title}</Text>
        {!!subtitle && <Text style={{ color: '#6b7280', marginTop: 4 }}>{subtitle}</Text>}
      </TouchableOpacity>
    </Link>
  );
}

export default function MemberHome() {
  useAuthGuard();

  const { data: me, isLoading: meLoading } = useQuery({ queryKey: ['me'], queryFn: getMe });
  const { data: sub, isLoading: subLoading } = useQuery({
    queryKey: ['me/subscription'],
    queryFn: getMySubscription,
  });

  if (meLoading || subLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      {/* Cabeçalho */}
      <View style={{ gap: 6, marginBottom: 12 }}>
        <Text style={{ fontSize: 20, fontWeight: '700' }}>
          Olá, {me?.name?.trim() || 'associado(a)'}
        </Text>
        <Text style={{ color: '#6b7280' }}>{me?.email}</Text>
      </View>

      {/* Status do plano */}
      <View
        style={{
          padding: 16,
          borderWidth: 1,
          borderColor: '#e5e7eb',
          borderRadius: 12,
        }}
      >
        <Text style={{ fontWeight: '700' }}>Seu plano</Text>

        {sub ? (
          <>
            <Text style={{ marginTop: 4 }}>
              {sub?.plan?.tier} —{' '}
              {(sub?.plan?.priceCents / 100).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </Text>
            {sub?.startedAt && (
              <Text style={{ color: '#6b7280', marginTop: 2 }}>
                Ativo desde: {new Date(sub.startedAt).toLocaleDateString()}
              </Text>
            )}
          </>
        ) : (
          <>
            <Text style={{ marginTop: 4 }}>Você ainda não possui um plano ativo.</Text>
            <Link href="/(private)/associate" asChild>
              <TouchableOpacity
                style={{
                  marginTop: 10,
                  backgroundColor: '#111827',
                  padding: 12,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>
                  ASSOCIE-SE
                </Text>
              </TouchableOpacity>
            </Link>
          </>
        )}

        {/* Ações rápidas: Upload + Abrir Suporte */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <Link href="/(private)/member/documents" asChild>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: '#111827',
                paddingVertical: 10,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>
                UPLOAD DE DOCUMENTOS
              </Text>
            </TouchableOpacity>
          </Link>

          <Link href="/(private)/member/support/new" asChild>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: '#2563eb',
                paddingVertical: 10,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>
                ABRIR SUPORTE
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      {/* Ações principais (mantidas) */}
      <RowButton title="Meu Perfil" subtitle="Ver/editar dados cadastrais" href="/(private)/member/profile" />
      <RowButton title="Documentos" subtitle="Enviar documentos obrigatórios" href="/(private)/member/documents" />
      <RowButton title="Meu Plano" subtitle="Detalhes do plano e termos" href="/(private)/member/plan" />
      <RowButton
        title="Solicitar Apoio Emergencial"
        subtitle="Saúde, pane, acidente ou roubo/furto"
        href="/(private)/member/support/new"
      />
      <RowButton
        title="Acompanhar Solicitações"
        subtitle="Status, valores e histórico"
        href="/(private)/member/support"
      />
    </ScrollView>
  );
}
