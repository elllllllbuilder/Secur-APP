import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function Onboarding() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center', gap: 12 }}>
      <Text
        style={{
          fontSize: 28,
          fontWeight: '800',
          textAlign: 'center',
          marginBottom: 8,
        }}
      >
        ASSOCIAUT
      </Text>
      <TouchableOpacity
        style={{ backgroundColor: '#111827', padding: 12, borderRadius: 8 }}
        onPress={() => router.push('/(public)/login')}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>ENTRAR</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ backgroundColor: '#00a9ff', padding: 12, borderRadius: 8 }}
        onPress={() => router.push('/(public)/register')}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          CADASTRE-SE GRATUITAMENTE
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ backgroundColor: '#10b981', padding: 12, borderRadius: 8 }}
        onPress={() => router.push('/(public)/conheca')}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          CONHEÇA A ASSOCIAUT
        </Text>
      </TouchableOpacity>
    </View>
  );
}
