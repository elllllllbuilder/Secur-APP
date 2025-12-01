// app/(private)/pix-payment.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

export default function PixPayment() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { qrCode, qrCodeText, amount, invoiceId } = params;

  const [copied, setCopied] = useState(false);

  const amountReais = (Number(amount) / 100).toFixed(2);
  
  // Detecta se está em produção verificando se o invoiceId não contém "test"
  const isProduction = invoiceId && !String(invoiceId).toLowerCase().includes('test');

  async function copyToClipboard() {
    await Clipboard.setStringAsync(String(qrCodeText));
    setCopied(true);
    Alert.alert('Copiado!', 'Código PIX copiado para a área de transferência');
    setTimeout(() => setCopied(false), 3000);
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pagamento via PIX</Text>
      </View>

      <View style={styles.content}>
        {/* Valor */}
        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>Valor a pagar</Text>
          <Text style={styles.amountValue}>R$ {amountReais}</Text>
        </View>

        {isProduction ? (
          <>
            {/* QR Code - PRODUÇÃO */}
            <View style={styles.qrBox}>
              <Text style={styles.qrTitle}>1. Escaneie o QR Code</Text>
              <Image
                source={{ uri: String(qrCode) }}
                style={styles.qrImage}
                resizeMode="contain"
              />
              <Text style={styles.qrSubtitle}>
                Abra o app do seu banco e escaneie o código acima
              </Text>
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OU</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Copiar código - PRODUÇÃO */}
            <View style={styles.copyBox}>
              <Text style={styles.copyTitle}>2. Copie o código PIX</Text>
              <View style={styles.codeBox}>
                <Text style={styles.codeText} numberOfLines={3}>
                  {qrCodeText}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.copyBtn, copied && styles.copyBtnSuccess]}
                onPress={copyToClipboard}
              >
                <Text style={styles.copyBtnText}>
                  {copied ? '✓ Copiado!' : '📋 Copiar código PIX'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Instruções - PRODUÇÃO */}
            <View style={styles.instructions}>
              <Text style={styles.instructionsTitle}>Como pagar:</Text>
              <Text style={styles.instructionItem}>1. Abra o app do seu banco</Text>
              <Text style={styles.instructionItem}>2. Escolha "Pagar com PIX"</Text>
              <Text style={styles.instructionItem}>3. Escaneie o QR Code ou cole o código</Text>
              <Text style={styles.instructionItem}>4. Confirme o pagamento</Text>
              <Text style={styles.instructionItem}>5. Pronto! Seu plano será ativado automaticamente</Text>
            </View>

            {/* Aviso - PRODUÇÃO */}
            <View style={styles.warning}>
              <Text style={styles.warningIcon}>⏰</Text>
              <Text style={styles.warningText}>
                Este código PIX expira em 30 minutos. Após o pagamento, seu plano será ativado em até 5 minutos.
              </Text>
            </View>
          </>
        ) : (
          <>
            {/* Aviso de Ambiente de Teste */}
            <View style={styles.testWarning}>
              <Text style={styles.testWarningIcon}>🧪</Text>
              <View style={styles.testWarningContent}>
                <Text style={styles.testWarningTitle}>Ambiente de Teste</Text>
                <Text style={styles.testWarningText}>
                  Este é um pagamento de teste do Mercado Pago. O QR Code e código PIX não funcionam em bancos reais.
                </Text>
              </View>
            </View>

            {/* Instruções de Teste */}
            <View style={styles.testInstructions}>
              <Text style={styles.testInstructionsTitle}>Como testar o pagamento:</Text>
              <Text style={styles.testInstructionItem}>
                1. Acesse o painel do Mercado Pago em:{'\n'}
                <Text style={styles.testLink}>https://www.mercadopago.com.br/developers/panel/app</Text>
              </Text>
              <Text style={styles.testInstructionItem}>
                2. Vá em "Pagamentos" no menu lateral
              </Text>
              <Text style={styles.testInstructionItem}>
                3. Encontre o pagamento ID: <Text style={styles.testBold}>{invoiceId}</Text>
              </Text>
              <Text style={styles.testInstructionItem}>
                4. Clique em "Simular aprovação" ou "Aprovar pagamento"
              </Text>
              <Text style={styles.testInstructionItem}>
                5. Volte ao app e seu plano será ativado automaticamente!
              </Text>
            </View>

            {/* Informação do Pagamento */}
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentInfoTitle}>Informações do Pagamento</Text>
              <View style={styles.paymentInfoRow}>
                <Text style={styles.paymentInfoLabel}>ID do Pagamento:</Text>
                <Text style={styles.paymentInfoValue}>{invoiceId}</Text>
              </View>
              <View style={styles.paymentInfoRow}>
                <Text style={styles.paymentInfoLabel}>Status:</Text>
                <Text style={styles.paymentInfoValue}>Aguardando pagamento</Text>
              </View>
            </View>
          </>
        )}

        {/* Botão de ajuda */}
        <TouchableOpacity
          style={styles.helpBtn}
          onPress={() => Alert.alert('Ajuda', 'Entre em contato pelo suporte se tiver problemas')}
        >
          <Text style={styles.helpBtnText}>Precisa de ajuda?</Text>
        </TouchableOpacity>
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
    gap: 20,
  },
  amountBox: {
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
  amountLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00a9ff',
  },
  qrBox: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  qrImage: {
    width: 250,
    height: 250,
    marginBottom: 16,
  },
  qrSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '600',
  },
  copyBox: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
  },
  copyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  codeBox: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  codeText: {
    fontSize: 12,
    color: '#374151',
    fontFamily: 'monospace',
  },
  copyBtn: {
    backgroundColor: '#00a9ff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  copyBtnSuccess: {
    backgroundColor: '#10b981',
  },
  copyBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructions: {
    backgroundColor: '#eff6ff',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 12,
  },
  instructionItem: {
    fontSize: 14,
    color: '#1e3a8a',
    marginBottom: 8,
  },
  warning: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  warningIcon: {
    fontSize: 24,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400e',
  },
  helpBtn: {
    padding: 16,
    alignItems: 'center',
  },
  helpBtnText: {
    fontSize: 16,
    color: '#00a9ff',
    fontWeight: '600',
  },
  testWarning: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    padding: 20,
    borderRadius: 12,
    gap: 12,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  testWarningIcon: {
    fontSize: 32,
  },
  testWarningContent: {
    flex: 1,
  },
  testWarningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  testWarningText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  testInstructions: {
    backgroundColor: '#eff6ff',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  testInstructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 16,
  },
  testInstructionItem: {
    fontSize: 14,
    color: '#1e3a8a',
    marginBottom: 12,
    lineHeight: 20,
  },
  testLink: {
    color: '#2563eb',
    textDecorationLine: 'underline',
  },
  testBold: {
    fontWeight: 'bold',
    color: '#1e40af',
  },
  paymentInfo: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  paymentInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentInfoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  paymentInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  productionWarning: {
    flexDirection: 'row',
    backgroundColor: '#f0fdf4',
    padding: 20,
    borderRadius: 12,
    gap: 12,
    borderWidth: 2,
    borderColor: '#86efac',
  },
  productionWarningIcon: {
    fontSize: 32,
  },
  productionWarningContent: {
    flex: 1,
  },
  productionWarningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 8,
  },
  productionWarningText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
  },
});
