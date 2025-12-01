import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

// Validador de CPF
function validateCPF(cpf: string): boolean {
  const cpfClean = cpf.replace(/\D/g, '');

  if (cpfClean.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpfClean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpfClean.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpfClean.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpfClean.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpfClean.charAt(10))) return false;

  return true;
}

// Máscara de CPF
function maskCPF(value: string): string {
  const cpf = value.replace(/\D/g, '');
  if (cpf.length <= 3) return cpf;
  if (cpf.length <= 6) return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
  if (cpf.length <= 9) return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`;
}

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const cpfClean = useMemo(() => cpf.replace(/\D/g, ''), [cpf]);
  const cpfValid = useMemo(() => validateCPF(cpfClean), [cpfClean]);
  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);
  const passwordValid = useMemo(() => password.length >= 6, [password]);
  const passwordsMatch = useMemo(() => password === confirmPassword && password.length > 0, [password, confirmPassword]);
  const nameValid = useMemo(() => name.trim().length >= 2, [name]);

  const canSubmit = nameValid && cpfValid && emailValid && passwordValid && passwordsMatch && !submitting;

  async function handleSubmit() {
    if (!canSubmit) {
      if (!nameValid) return Alert.alert('Atenção', 'Nome deve ter pelo menos 2 caracteres');
      if (!cpfValid) return Alert.alert('Atenção', 'CPF inválido');
      if (!emailValid) return Alert.alert('Atenção', 'E-mail inválido');
      if (!passwordValid) return Alert.alert('Atenção', 'Senha deve ter pelo menos 6 caracteres');
      if (!passwordsMatch) return Alert.alert('Atenção', 'As senhas não coincidem');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : undefined,
        cpf: cpfClean,
        password,
      };

      // Remove token temporariamente para registro
      const tempToken = api.defaults.headers.common.Authorization;
      delete api.defaults.headers.common.Authorization;

      await api.post('/auth/register', payload);

      // Restaura token se havia
      if (tempToken) {
        api.defaults.headers.common.Authorization = tempToken;
      }

      Alert.alert('Sucesso! 🎉', 'Conta criada com sucesso! Faça login para continuar.', [
        { text: 'OK', onPress: () => router.replace('/(public)/login') },
      ]);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Erro ao criar conta. Tente novamente.';
      Alert.alert('Erro', Array.isArray(msg) ? msg.join('\n') : String(msg));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Preencha seus dados para começar</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome completo *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Seu nome"
              style={[styles.input, !nameValid && name.length > 0 && styles.inputError]}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CPF *</Text>
            <TextInput
              value={maskCPF(cpf)}
              onChangeText={(text) => setCpf(text.replace(/\D/g, ''))}
              placeholder="000.000.000-00"
              keyboardType="number-pad"
              maxLength={14}
              style={[styles.input, !cpfValid && cpfClean.length > 0 && styles.inputError]}
            />
            {cpfClean.length > 0 && !cpfValid && <Text style={styles.errorText}>CPF inválido</Text>}
            {cpfValid && <Text style={styles.successText}>✓ CPF válido</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail *</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, !emailValid && email.length > 0 && styles.inputError]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="(11) 91234-5678"
              keyboardType="phone-pad"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Mínimo 6 caracteres"
                secureTextEntry={!showPassword}
                style={[styles.input, styles.passwordInput, !passwordValid && password.length > 0 && styles.inputError]}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar Senha *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Digite a senha novamente"
                secureTextEntry={!showConfirmPassword}
                style={[
                  styles.input,
                  styles.passwordInput,
                  confirmPassword.length > 0 && !passwordsMatch && styles.inputError,
                ]}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            {confirmPassword.length > 0 && !passwordsMatch && (
              <Text style={styles.errorText}>As senhas não coincidem</Text>
            )}
            {passwordsMatch && <Text style={styles.successText}>✓ Senhas coincidem</Text>}
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          >
            <Text style={styles.submitBtnText}>{submitting ? 'Criando conta...' : 'CRIAR CONTA'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(public)/login')} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>
              Já tem conta? <Text style={styles.loginLinkBold}>Entrar</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  backBtn: {
    fontSize: 16,
    color: '#00a9ff',
    fontWeight: '600',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    backgroundColor: 'white',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 14,
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
  },
  successText: {
    fontSize: 12,
    color: '#10b981',
  },
  submitBtn: {
    backgroundColor: '#00a9ff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: {
    backgroundColor: '#d1d5db',
  },
  submitBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    padding: 12,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: '#6b7280',
  },
  loginLinkBold: {
    color: '#00a9ff',
    fontWeight: '600',
  },
});
