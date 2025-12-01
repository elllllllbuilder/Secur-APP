// app/(private)/associate/pix.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import Button from '@/components/Button';

export default function PixScreen() {
  const router = useRouter();
  const { qr, price } = useLocalSearchParams<{ qr: string; price: string }>();

  async function copy() {
    if (qr) {
      await Clipboard.setStringAsync(String(qr));
      Alert.alert('Copiado', 'Código PIX copiado para a área de transferência');
    }
  }

  return (
    <View style={{ flex: 1, padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: '700' }}>Pague com PIX</Text>
      <Text style={{ color: '#6b7280' }}>Valor: {price}</Text>

      <View
        style={{
          borderWidth: 1,
          borderColor: '#e5e7eb',
          borderRadius: 12,
          padding: 14,
        }}
      >
        <Text style={{ fontWeight: '700', marginBottom: 6 }}>Copia e Cola:</Text>
        <Text selectable numberOfLines={5}>{qr}</Text>
        <TouchableOpacity
          onPress={copy}
          style={{
            marginTop: 10,
            padding: 10,
            borderWidth: 1,
            borderColor: '#111827',
            borderRadius: 8,
          }}
        >
          <Text style={{ textAlign: 'center', fontWeight: '700' }}>
            Copiar código
          </Text>
        </TouchableOpacity>
      </View>

      <Button
        title="Voltar à área do associado"
        onPress={() => router.replace('/(private)/member')}
      />
    </View>
  );
}
