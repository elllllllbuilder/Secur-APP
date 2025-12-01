import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function Conheca() {
  const router = useRouter();
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>Conheça a Associaut</Text>
      <Text style={{ lineHeight: 22 }}>
        A Associaut é uma associação feita para proteger quem vive de próprio trabalho: motoristas de aplicativo,
        taxistas, motofretistas, caminhoneiros e autônomos em geral. Oferecemos apoio financeiro emergencial.
      </Text>
      <TouchableOpacity
        style={{ backgroundColor: '#00a9ff', padding: 12, borderRadius: 8 }}
        onPress={() => router.push('/(public)/register')}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          CADASTRE-SE GRATUITAMENTE
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
