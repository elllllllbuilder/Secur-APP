import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

export default function CardPayment() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { planId, planName, amount } = params;
  const [loading, setLoading] = useState(false);

  async function handleCardPayment() {
    try {
      setLoading(true);

      // Chama endpoint para criar assinatura recorrente
      const response = await api.post('/me/subscription/recurring', {
        planId,
      });

      const { checkoutUrl } = response.data;

      // Abre checkout do Mercado Pago
      const supported = await Linking.canOpenURL(checkoutUrl);
      if (supported) {
        await Linking.openURL(checkoutUrl);

        Alert.alert(
          'Redirecionando...',
          'Você será redirecionado para o Mercado Pago para completar o pagamento. Após finalizar, volte ao app.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(private)/member'),
            },
          ]
        );
      } else {
        throw new Error('Não foi possível abrir o link de pagamento');
      }
    } catch (error: any) {
      console.error('Erro ao criar assinatura:', error);
      Alert.alert('Erro', error?.response?.data?.message || 'Não foi possível processar o pagamento');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pagamento com Cartão</Text>
      </View>

      <View style={styles.content}>
        {/* Informações do Plano */}
        <View style={styles.planCard}>
          <Text style={styles.planLabel}>Plano Selecionado</Text>
          <Text style={styles.planName}>{planName}</Text>
          <Text style={styles.planAmount}>R$ {(Number(amount) / 100).toFixed(2)}/mês</Text>
        </View>

        {/* Benefícios da Assinatura Recorrente */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>✨ Benefícios da Assinatura Automática</Text>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={styles.benefitText}>Renovação automática todo mês</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={styles.benefitText}>Sem preocupação com vencimento</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={styles.benefitText}>Cancele quando quiser</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={styles.benefitText}>Pagamento seguro pelo Mercado Pago</Text>
          </View>
        </View>

        {/* Informações Importantes */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#3b82f6" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Como funciona?</Text>
            <Text style={styles.infoText}>
              1. Você será redirecionado para o Mercado Pago{'\n'}
              2. Cadastre seu cartão de crédito{'\n'}
              3. A cobrança será feita automaticamente todo mês{'\n'}
              4. Você pode cancelar a qualquer momento
            </Text>
          </View>
        </View>

        {/* Botão de Pagamento */}
        <TouchableOpacity
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          onPress={handleCardPayment}
          disabled={loading}
        >
          <Ionicons name="card" size={24} color="white" />
          <Text style={styles.payButtonText}>{loading ? 'Processando...' : 'Continuar para Pagamento'}</Text>
        </TouchableOpacity>

        {/* Aviso de Segurança */}
        <View style={styles.securityBadge}>
          <Ionicons name="shield-checkmark" size={20} color="#10b981" />
          <Text style={styles.securityText}>Pagamento 100% seguro processado pelo Mercado Pago</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#00a9ff',
    padding: 20,
    paddingTop: 60,
  },
  backBtn: {
    color: 'white',
    fontSize: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  planCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  planAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00a9ff',
    marginTop: 8,
  },
  benefitsCard: {
    backgroundColor: '#f0fdf4',
    padding: 20,
    borderRadius: 12,
    gap: 12,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#166534',
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  payButton: {
    flexDirection: 'row',
    backgroundColor: '#00a9ff',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
  payButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
  },
  securityText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
});
