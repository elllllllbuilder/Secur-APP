// app/(private)/member/documents/[id].tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function DocumentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 8 }}>
        Documento #{id}
      </Text>
      <Text>Situação e histórico do envio.</Text>
    </View>
  );
}
