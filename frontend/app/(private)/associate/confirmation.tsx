import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function AssociateConfirmation() {
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        padding: 16,
        gap: 12,
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: '700',
          textAlign: 'center',
        }}
      >
        Associação concluída
      </Text>

      <Text style={{ textAlign: 'center' }}>
        Você receberá um e-mail com os próximos passos.
      </Text>

      <TouchableOpacity
        style={{
          backgroundColor: '#111827',
          padding: 12,
          borderRadius: 8,
        }}
        onPress={() => router.replace('/(private)/home')}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          Ir para o app
        </Text>
      </TouchableOpacity>
    </View>
  );
}
