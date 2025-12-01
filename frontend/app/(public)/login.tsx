// app/(public)/login.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { View, Alert, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { Link, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import Input from '@/components/Input';
import Button from '@/components/Button';

import { useAuth } from '@/context/authContext';

const STORAGE_KEYS = {
  REMEMBER_EMAIL: 'login:remember_email',
  REMEMBER_PASSWORD: 'login:remember_password',
  REMEMBER_ME: 'login:remember_me',
};

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const emailOk = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);
  const passOk = useMemo(() => (password?.trim()?.length ?? 0) >= 6, [password]);
  const canSubmit = emailOk && passOk && !loading;

  // Carrega credenciais salvas ao montar
  useEffect(() => {
    loadSavedCredentials();
  }, []);

  async function loadSavedCredentials() {
    try {
      const [savedEmail, savedPassword, savedRemember] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_EMAIL),
        AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_PASSWORD),
        AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME),
      ]);

      if (savedRemember === 'true' && savedEmail) {
        setEmail(savedEmail);
        setPassword(savedPassword || '');
        setRememberMe(true);
      }
    } catch (error) {
      console.error('Erro ao carregar credenciais:', error);
    }
  }

  async function saveCredentials() {
    try {
      if (rememberMe) {
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.REMEMBER_EMAIL, email],
          [STORAGE_KEYS.REMEMBER_PASSWORD, password],
          [STORAGE_KEYS.REMEMBER_ME, 'true'],
        ]);
      } else {
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.REMEMBER_EMAIL,
          STORAGE_KEYS.REMEMBER_PASSWORD,
          STORAGE_KEYS.REMEMBER_ME,
        ]);
      }
    } catch (error) {
      console.error('Erro ao salvar credenciais:', error);
    }
  }

  async function onSubmit() {
    try {
      setLoading(true);
      await signIn(email, password);

      // Salva credenciais se "Lembrar-me" estiver marcado
      await saveCredentials();

      // Redireciona para área privada
      router.replace('/(private)/member');
    } catch (e: any) {
      console.log('LOGIN ERROR', e?.message, e?.response?.status, e?.response?.data);

      const msg =
        e?.response?.data?.message ||
        e?.message ||
        'Não foi possível entrar.';
      Alert.alert('Erro', Array.isArray(msg) ? msg.join('\n') : String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('@/assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Botões de acesso rápido */}
      <View style={styles.quickAccess}>
        <View style={styles.quickButtons}>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => router.push('/(public)/calculadora')}
          >
            <Text style={styles.quickIcon}>🧮</Text>
            <Text style={styles.quickText}>Calculadora</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => router.push('/(public)/mapa-postos')}
          >
            <Text style={styles.quickIcon}>🗺️</Text>
            <Text style={styles.quickText}>Mapa de Postos</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Formulário de Login */}
      <View style={styles.form}>
        <Text style={styles.formTitle}>Entrar na sua conta</Text>

        <Input
          label="E-mail"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <View>
          <Input
            label="Senha"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color="#6b7280"
            />
          </TouchableOpacity>
        </View>

        {/* Lembrar-me e Esqueci senha na mesma linha */}
        <View style={styles.rememberForgotRow}>
          <TouchableOpacity
            style={styles.rememberRow}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text style={styles.rememberText}>Lembrar-me</Text>
          </TouchableOpacity>

          <Link href="/(public)/forgot-password" style={styles.forgotLink}>
            Esqueci minha senha
          </Link>
        </View>

        <View style={styles.buttonRow}>
          <Button title="Entrar" onPress={onSubmit} loading={loading} disabled={!canSubmit} />
          <Link href="/(public)/register" asChild>
            <TouchableOpacity style={styles.registerButton}>
              <Text style={styles.registerButtonText}>Cadastre-se</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#00a9ff',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 320,
    height: 140,
  },
  quickAccess: {
    padding: 16,
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quickIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  form: {
    padding: 20,
    gap: 12,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 38,
    padding: 8,
  },
  rememberForgotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#00a9ff',
    borderColor: '#00a9ff',
  },
  rememberText: {
    fontSize: 14,
    color: '#374151',
  },
  forgotLink: {
    color: '#00a9ff',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  registerButton: {
    flex: 1,
    backgroundColor: '#0891b2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
