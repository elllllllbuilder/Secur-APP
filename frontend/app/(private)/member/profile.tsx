// app/(private)/member/profile.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import Button from '@/components/Button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMe, updateMe } from '@/services/profile';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function Profile() {
  useAuthGuard();
  const qc = useQueryClient();

  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });

  // Campos do schema (User)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [city, setCity] = useState('');
  const [stateUF, setStateUF] = useState('');
  const [zipCode, setZipCode] = useState('');

  // Preenche quando carregar
  useEffect(() => {
    if (!me) return;
    setName(me.name ?? '');
    setPhone(me.phone ?? '');
    setStreet(me.street ?? '');
    setNumber(me.number ?? '');
    setCity(me.city ?? '');
    setStateUF(me.state ?? '');
    setZipCode(me.zipCode ?? '');
  }, [me]);

  // Validações simples
  const phoneDigits = useMemo(() => (phone || '').replace(/\D/g, ''), [phone]);
  const zipDigits = useMemo(() => (zipCode || '').replace(/\D/g, ''), [zipCode]);

  const nameOk = (name || '').trim().length >= 2;
  const phoneOk = phoneDigits.length >= 10 && phoneDigits.length <= 11; // BR: 10 ou 11
  const zipOk = zipDigits.length === 0 || zipDigits.length === 8; // CEP opcional ou 8 dígitos

  // Dirty state (para evitar salvar sem mudanças)
  const isDirty = useMemo(() => {
    if (!me) return false;
    return (
      (me.name ?? '') !== name ||
      (me.phone ?? '') !== phone ||
      (me.street ?? '') !== street ||
      (me.number ?? '') !== number ||
      (me.city ?? '') !== city ||
      (me.state ?? '') !== stateUF ||
      (me.zipCode ?? '') !== zipCode
    );
  }, [me, name, phone, street, number, city, stateUF, zipCode]);

  const canSave = nameOk && phoneOk && zipOk && isDirty;

  const mutation = useMutation({
    mutationFn: (dto: any) => updateMe(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
      Alert.alert('Sucesso', 'Dados atualizados.');
    },
    onError: (e: any) => {
      Alert.alert('Erro', e?.response?.data?.message || 'Não foi possível salvar.');
    },
  });

  function onSave() {
    if (!canSave) {
      if (!nameOk) return Alert.alert('Atenção', 'Informe um nome válido.');
      if (!phoneOk) return Alert.alert('Atenção', 'Informe um celular válido (10–11 dígitos).');
      if (!zipOk) return Alert.alert('Atenção', 'CEP deve ter 8 dígitos.');
      return;
    }
    mutation.mutate({
      name: name.trim(),
      phone: phone.trim(),
      street: street.trim(),
      number: number.trim(),
      city: city.trim(),
      state: stateUF.trim().toUpperCase(),
      zipCode: zipDigits, // envia só dígitos
    });
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ padding: 20 }}>
        {/* Header */}
        <View style={{
          backgroundColor: 'white',
          padding: 20,
          borderRadius: 12,
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3
        }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#00a9ff', marginBottom: 8 }}>
            👤 Meu Perfil
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280' }}>
            Mantenha seus dados atualizados
          </Text>
        </View>

        {/* Dados Pessoais */}
        <View style={{
          backgroundColor: 'white',
          padding: 16,
          borderRadius: 12,
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3
        }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16, color: '#1f2937' }}>
            Dados Pessoais
          </Text>

          {/* Nome */}
          <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 6, color: '#374151' }}>
            Nome Completo *
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            placeholder="Seu nome completo"
            style={{
              borderWidth: 1,
              borderColor: nameOk ? '#e5e7eb' : '#ef4444',
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
              backgroundColor: '#f9fafb',
              marginBottom: 16
            }}
          />

          {/* Celular */}
          <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 6, color: '#374151' }}>
            Celular *
          </Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="(11) 98888-7777"
            style={{
              borderWidth: 1,
              borderColor: phoneOk ? '#e5e7eb' : '#ef4444',
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
              backgroundColor: '#f9fafb',
              marginBottom: 8
            }}
          />
          {!phoneOk && phone.length > 0 && (
            <Text style={{ fontSize: 12, color: '#ef4444', marginBottom: 16 }}>
              Celular deve ter 10 ou 11 dígitos
            </Text>
          )}
        </View>

        {/* Endereço */}
        <View style={{
          backgroundColor: 'white',
          padding: 16,
          borderRadius: 12,
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3
        }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16, color: '#1f2937' }}>
            Endereço (Opcional)
          </Text>

          {/* Rua */}
          <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 6, color: '#374151' }}>
            Rua
          </Text>
          <TextInput
            value={street}
            onChangeText={setStreet}
            placeholder="Av. Exemplo"
            style={{
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
              backgroundColor: '#f9fafb',
              marginBottom: 16
            }}
          />

          {/* Número */}
          <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 6, color: '#374151' }}>
            Número
          </Text>
          <TextInput
            value={number}
            onChangeText={setNumber}
            keyboardType="numeric"
            placeholder="123"
            style={{
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
              backgroundColor: '#f9fafb',
              marginBottom: 16
            }}
          />

          {/* Cidade */}
          <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 6, color: '#374151' }}>
            Cidade
          </Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="São Paulo"
            autoCapitalize="words"
            style={{
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
              backgroundColor: '#f9fafb',
              marginBottom: 16
            }}
          />

          {/* Estado */}
          <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 6, color: '#374151' }}>
            Estado (UF)
          </Text>
          <TextInput
            value={stateUF}
            onChangeText={(v) => setStateUF(v.slice(0, 2))}
            autoCapitalize="characters"
            placeholder="SP"
            maxLength={2}
            style={{
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
              backgroundColor: '#f9fafb',
              marginBottom: 16
            }}
          />

          {/* CEP */}
          <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 6, color: '#374151' }}>
            CEP
          </Text>
          <TextInput
            value={zipCode}
            onChangeText={setZipCode}
            keyboardType="numeric"
            placeholder="00000-000"
            style={{
              borderWidth: 1,
              borderColor: zipOk ? '#e5e7eb' : '#ef4444',
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
              backgroundColor: '#f9fafb',
              marginBottom: 8
            }}
          />
          {!zipOk && zipCode.length > 0 && (
            <Text style={{ fontSize: 12, color: '#ef4444', marginBottom: 16 }}>
              CEP deve ter 8 dígitos
            </Text>
          )}
        </View>

        {/* Botão Salvar */}
        <View style={{ marginBottom: 32 }}>
          <Button
            title="Salvar Alterações"
            onPress={onSave}
            loading={(mutation as any).isPending ?? (mutation as any).isLoading}
          />
          {!canSave && isDirty && (
            <Text style={{ color: '#6b7280', marginTop: 8, textAlign: 'center', fontSize: 12 }}>
              Preencha corretamente todos os campos obrigatórios
            </Text>
          )}
          {!isDirty && (
            <Text style={{ color: '#6b7280', marginTop: 8, textAlign: 'center', fontSize: 12 }}>
              Faça alguma alteração para habilitar o salvamento
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
