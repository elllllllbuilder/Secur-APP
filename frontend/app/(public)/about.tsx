import React from 'react';
import { View, Text } from 'react-native';

export default function About() {
  return (
    <View style={{ flex: 1, padding: 20, gap: 10 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>Sobre o App</Text>
      <Text>
        App de associação com planos BRONZE/PRATA/OURO, checkout recorrente Pagar.me e
        área do associado com envio de documentos e apoio emergencial.
      </Text>
    </View>
  );
}
