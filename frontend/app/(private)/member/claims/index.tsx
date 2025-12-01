// app/(private)/member/claims/index.tsx
import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';

export default function ClaimsIndex() {
  const router = useRouter();
  const items: Array<{ id: string | number; title: string; status: string }> = []; // TODO: fetch ['me/claims']

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 8 }}>
        Sinistros
      </Text>

      <TouchableOpacity onPress={() => router.push('/(private)/member/claims/new')}>
        <Text style={{ color: '#2563eb', marginBottom: 12 }}>
          Abrir novo sinistro
        </Text>
      </TouchableOpacity>

      <FlatList
        data={items}
        keyExtractor={(i, idx) => String(i?.id ?? idx)}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/(private)/member/claims/${item.id}`)}>
            <Text>
              {item.title} — {item.status}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={{ color: '#6b7280' }}>
            Nenhum sinistro encontrado.
          </Text>
        }
      />
    </View>
  );
}
