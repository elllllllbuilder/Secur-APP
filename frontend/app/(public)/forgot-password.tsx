// app/(public)/forgot-password.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Input from '@/components/Input';
import Button from '@/components/Button';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const emailOk = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);

  async function onSubmit() {
    try {
      setLoading(true);
      
      // TODO: Implementar endpoint de recuperação de senha no backend
      // await api.post('/auth/forgot-password', { email });
      
      // Mock por enquanto
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSent(true);
      Alert.alert(
        'E-mail enviado!',
        'Verifique sua caixa de entrada para redefinir sua senha.',
      );
    } catch (error: any) {
      Alert.alert('Erro', error?.response?.data?.message || 'Não foi possível enviar o e-mail');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <View style={styles.container}>
        <View style={styles.successBox}>
          <Text style={styles.successIcon}>✉️</Text>
          <Text style={styles.successTitle}>E-mail enviado!</Text>
          <Text style={styles.successText}>
            Enviamos um link de recuperação para {email}
          </Text>
          <Text style={styles.successSubtext}>
            Verifique sua caixa de entrada e spam.
          </Text>
          <Button
            title="Voltar ao Login"
            onPress={() => router.back()}
            style={{ marginTop: 20 }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Voltar</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.icon}>🔐</Text>
        <Text style={styles.title}>Esqueceu sua senha?</Text>
        <Text style={styles.subtitle}>
          Digite seu e-mail e enviaremos um link para redefinir sua senha.
        </Text>

        <Input
          label="E-mail"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="seu@email.com"
        />

        <Button
          title="Enviar link de recuperação"
          onPress={onSubmit}
          loading={loading}
          disabled={!emailOk || loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  backBtn: {
    padding: 20,
    paddingTop: 60,
  },
  backText: {
    fontSize: 16,
    color: '#00a9ff',
    fontWeight: '600',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  icon: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  successBox: {
    margin: 20,
    marginTop: 100,
    padding: 32,
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
