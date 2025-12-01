// app/(private)/payment-method.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/api';

export default function PaymentMethod() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { planId, planName, planPrice } = params;

  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'pix' | 'recurring' | null>(null);

  async function handlePixPayment() {
    try {
      setLoading(true);

      // 1. Criar assinatura
      const subRes = await api.post('/me/associate', {
        activitySlug: 'motorista',
        planId,
      });

      // 2. Gerar PIX
      const pixRes = await api.post('/me/checkout/pix', {
        subscriptionId: subRes.data.data.subscriptionId,
      });

      const pixData = pixRes.data.data;

      // Navegar para tela de PIX
      router.push({
        pathname: '/(private)/pix-payment',
        params: {
          qrCode: pixData.pixQr,
          qrCodeText: pixData.pixCopyPaste,
          amount: pixData.amountCents,
          invoiceId: pixData.invoiceId,
        },
      });
    } catch (error: any) {
      Alert.alert('Erro', error?.response?.data?.message || 'Não foi possível gerar o PIX');
    } finally {
      setLoading(false);
    }
  }

  async function handleRecurringPayment() {
    try {
      setLoading(true);

      const res = await api.post('/me/subscription/recurring', { planId });
      const data = res.data.data;

      // Abrir checkout do Mercado Pago
      if (data.checkoutUrl) {
        const supported = await Linking.canOpenURL(data.checkoutUrl);
        if (supported) {
          await Linking.openURL(data.checkoutUrl);
          Alert.alert(
            'Checkout Aberto',
            'Complete o pagamento no navegador. Após concluir, volte ao app.',
            [
              { text: 'OK', onPress: () => router.back() },
            ],
          );
        }
      }
    } catch (error: any) {
      Alert.alert('Erro', error?.response?.data?.message || 'Não foi possível criar assinatura');
    } finally {
      setLoading(false);
    }
  }

  function handleContinue() {
    if (selectedMethod === 'pix') {
      handlePixPayment();
    } else if (selectedMethod === 'recurring') {
      handleRecurringPayment();
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Escolha a forma de pagamento</Text>
        <Text style={styles.subtitle}>
          Plano: {planName} - R$ {(Number(planPrice) / 100).toFixed(2)}/mês
        </Text>
      </View>

      <View style={styles.content}>
        {/* PIX - Pagamento Único */}
        <TouchableOpacity
          style={[
            styles.methodCard,
            selectedMethod === 'pix' && styles.methodCardSelected,
          ]}
          onPress={() => setSelectedMethod('pix')}
        >
          <View style={styles.methodHeader}>
            <Text style={styles.methodIcon}>📱</Text>
            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>PIX - Pagamento Único</Text>
              <Text style={styles.methodSubtitle}>Pague uma vez por mês</Text>
            </View>
            <View style={[
              styles.radio,
              selectedMethod === 'pix' && styles.radioSelected,
            ]} />
          </View>

          <View style={styles.methodDetails}>
            <Text style={styles.detailItem}>✅ Pagamento instantâneo</Text>
            <Text style={styles.detailItem}>✅ Sem taxas adicionais</Text>
            <Text style={styles.detailItem}>✅ QR Code válido por 30 minutos</Text>
            <Text style={styles.detailItem}>⚠️ Precisa pagar todo mês manualmente</Text>
          </View>
        </TouchableOpacity>

        {/* Cartão - Recorrente */}
        <TouchableOpacity
          style={[
            styles.methodCard,
            selectedMethod === 'recurring' && styles.methodCardSelected,
          ]}
          onPress={() => setSelectedMethod('recurring')}
        >
          <View style={styles.methodHeader}>
            <Text style={styles.methodIcon}>💳</Text>
            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>Cartão - Assinatura Mensal</Text>
              <Text style={styles.methodSubtitle}>Cobrança automática</Text>
            </View>
            <View style={[
              styles.radio,
              selectedMethod === 'recurring' && styles.radioSelected,
            ]} />
          </View>

          <View style={styles.methodDetails}>
            <Text style={styles.detailItem}>✅ Cobrança automática todo mês</Text>
            <Text style={styles.detailItem}>✅ Não precisa lembrar de pagar</Text>
            <Text style={styles.detailItem}>✅ Cancele quando quiser</Text>
            <Text style={styles.detailItem}>💳 Aceita todos os cartões</Text>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>⭐ RECOMENDADO</Text>
          </View>
        </TouchableOpacity>

        {/* Botão Continuar */}
        <TouchableOpacity
          style={[
            styles.continueBtn,
            !selectedMethod && styles.continueBtnDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedMethod || loading}
        >
          <Text style={styles.continueBtnText}>
            {loading ? 'Processando...' : 'Continuar'}
          </Text>
        </TouchableOpacity>

        {/* Info de Segurança */}
        <View style={styles.securityInfo}>
          <Text style={styles.securityIcon}>🔒</Text>
          <Text style={styles.securityText}>
            Pagamento seguro processado pelo Mercado Pago
          </Text>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e9d5ff',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  methodCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  methodCardSelected: {
    borderColor: '#00a9ff',
    backgroundColor: '#faf5ff',
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  methodIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  methodSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
  },
  radioSelected: {
    borderColor: '#00a9ff',
    backgroundColor: '#00a9ff',
  },
  methodDetails: {
    gap: 8,
  },
  detailItem: {
    fontSize: 14,
    color: '#374151',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fbbf24',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#78350f',
  },
  continueBtn: {
    backgroundColor: '#00a9ff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  continueBtnDisabled: {
    backgroundColor: '#d1d5db',
  },
  continueBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  securityIcon: {
    fontSize: 16,
  },
  securityText: {
    fontSize: 14,
    color: '#6b7280',
  },
});
