import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function TrackSupport() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>Acompanhar solicitações</Text>

      {/* Lista simplificada que direciona para /(private)/member/support/[id] */}
      <TouchableOpacity onPress={() => router.push('/(private)/member/support/123')}>
        <Text style={{ color: '#2563eb' }}>Solicitação #123</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(private)/member/home')}>
        <Text style={{ color: '#2563eb' }}>Voltar para Home</Text>
      </TouchableOpacity>
    </View>
  );
}
