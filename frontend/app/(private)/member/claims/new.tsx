// app/(private)/member/claims/new.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function NewClaim() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const submit = async () => {
    // TODO: call createClaim
    router.replace('/(private)/member/claims'); // or go to the created claim detail
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 8 }}>
        Abrir sinistro
      </Text>

      <TextInput
        placeholder="Título"
        value={title}
        onChangeText={setTitle}
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 8,
          padding: 12,
          marginBottom: 8,
        }}
      />

      <TextInput
        placeholder="Descrição"
        value={description}
        multiline
        numberOfLines={4}
        onChangeText={setDescription}
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 8,
          padding: 12,
          marginBottom: 12,
        }}
      />

      <TouchableOpacity
        onPress={submit}
        style={{ backgroundColor: '#111827', padding: 12, borderRadius: 8 }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>Enviar</Text>
      </TouchableOpacity>
    </View>
  );
}
