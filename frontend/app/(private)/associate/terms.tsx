// app/(private)/associate/terms.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function Terms() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { planId, planName, planPrice, category } = params;
  
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    
    if (isBottom && !scrolledToBottom) {
      setScrolledToBottom(true);
    }
  };

  function handleContinue() {
    if (!accepted) return;
    
    // Vai para escolha de pagamento
    router.push({
      pathname: '/(private)/payment-method',
      params: {
        planId: String(planId),
        planName: String(planName),
        planPrice: String(planPrice),
      },
    });
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Termos de Adesão</Text>
        <Text style={styles.subtitle}>
          Plano {planName} - R$ {(Number(planPrice) / 100).toFixed(2)}/mês
        </Text>
      </View>

      {/* Termos */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.termsContainer}
        contentContainerStyle={styles.termsContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.termsBox}>
          <Text style={styles.termsTitle}>📋 Termos e Condições</Text>
          
          <Text style={styles.termsSection}>1. OBJETO DO CONTRATO</Text>
          <Text style={styles.termsText}>
            Este contrato tem por objeto a prestação de serviços de assistência emergencial 24 horas, 
            conforme as condições e limites estabelecidos neste termo.
          </Text>

          <Text style={styles.termsSection}>2. COBERTURA</Text>
          <Text style={styles.termsText}>
            O plano {planName} oferece cobertura para:
            {'\n'}• Assistência médica emergencial
            {'\n'}• Pane mecânica
            {'\n'}• Acidentes de trânsito
            {'\n'}• Roubo e furto
            {'\n\n'}
            Valores de cobertura conforme categoria escolhida.
          </Text>

          <Text style={styles.termsSection}>3. CARÊNCIA</Text>
          <Text style={styles.termsText}>
            Não há período de carência. A cobertura inicia imediatamente após a confirmação do pagamento.
          </Text>

          <Text style={styles.termsSection}>4. PAGAMENTO</Text>
          <Text style={styles.termsText}>
            O valor mensal de R$ {(Number(planPrice) / 100).toFixed(2)} deve ser pago até o dia 10 de cada mês.
            {'\n\n'}
            Formas de pagamento aceitas:
            {'\n'}• PIX (pagamento único mensal)
            {'\n'}• Cartão de crédito (cobrança recorrente automática)
          </Text>

          <Text style={styles.termsSection}>5. CANCELAMENTO</Text>
          <Text style={styles.termsText}>
            O associado pode cancelar o plano a qualquer momento, sem multa ou taxa de cancelamento.
            O cancelamento terá efeito no próximo ciclo de cobrança.
          </Text>

          <Text style={styles.termsSection}>6. ACIONAMENTO</Text>
          <Text style={styles.termsText}>
            Para acionar a assistência, entre em contato através do app ou ligue para nossa central 24h.
            Mantenha seus documentos sempre atualizados no app.
          </Text>

          <Text style={styles.termsSection}>7. RESPONSABILIDADES</Text>
          <Text style={styles.termsText}>
            O associado se compromete a:
            {'\n'}• Fornecer informações verdadeiras
            {'\n'}• Manter documentação atualizada
            {'\n'}• Utilizar os serviços de forma adequada
            {'\n'}• Efetuar pagamentos em dia
          </Text>

          <Text style={styles.termsSection}>8. VIGÊNCIA</Text>
          <Text style={styles.termsText}>
            Este contrato tem vigência mensal, renovável automaticamente mediante pagamento.
          </Text>

          <Text style={styles.termsSection}>9. FORO</Text>
          <Text style={styles.termsText}>
            Fica eleito o foro da comarca de São Paulo/SP para dirimir quaisquer questões oriundas deste contrato.
          </Text>

          <View style={styles.termsFooter}>
            <Text style={styles.termsFooterText}>
              Ao aceitar estes termos, você confirma que leu, compreendeu e concorda com todas as condições acima.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Aviso de scroll */}
      {!scrolledToBottom && (
        <View style={styles.scrollHint}>
          <Text style={styles.scrollHintText}>
            ⬇️ Role até o final para continuar
          </Text>
        </View>
      )}

      {/* Checkbox e botão */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => scrolledToBottom && setAccepted(!accepted)}
          disabled={!scrolledToBottom}
        >
          <View style={[
            styles.checkbox,
            !scrolledToBottom && styles.checkboxDisabled,
            accepted && styles.checkboxChecked,
          ]}>
            {accepted && <Text style={styles.checkboxIcon}>✓</Text>}
          </View>
          <Text style={[
            styles.checkboxText,
            !scrolledToBottom && styles.checkboxTextDisabled,
          ]}>
            Li e aceito os termos de adesão
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.continueBtn,
            (!accepted || !scrolledToBottom) && styles.continueBtnDisabled,
          ]}
          onPress={handleContinue}
          disabled={!accepted || !scrolledToBottom}
        >
          <Text style={styles.continueBtnText}>
            CONTINUAR PARA PAGAMENTO
          </Text>
        </TouchableOpacity>
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
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backBtn: {
    fontSize: 16,
    color: '#00a9ff',
    fontWeight: '600',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  termsContainer: {
    flex: 1,
  },
  termsContent: {
    padding: 20,
  },
  termsBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  termsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
  },
  termsSection: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 20,
    marginBottom: 8,
  },
  termsText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  termsFooter: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
  },
  termsFooterText: {
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
  },
  scrollHint: {
    backgroundColor: '#fbbf24',
    padding: 12,
    alignItems: 'center',
  },
  scrollHintText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#78350f',
  },
  footer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#00a9ff',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDisabled: {
    borderColor: '#d1d5db',
  },
  checkboxChecked: {
    backgroundColor: '#00a9ff',
  },
  checkboxIcon: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  checkboxTextDisabled: {
    color: '#9ca3af',
  },
  continueBtn: {
    backgroundColor: '#00a9ff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueBtnDisabled: {
    backgroundColor: '#d1d5db',
  },
  continueBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
