// app/(public)/calculadora.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCalculadora } from '@/hooks/useCalculadora';

type Corrida = {
  id: string;
  valor: number;
  timestamp: number;
};

export default function Calculadora() {
  const router = useRouter();
  const { salvarDia } = useCalculadora();
  
  const [corridas, setCorridas] = useState<Corrida[]>([]);
  const [valorAtual, setValorAtual] = useState('');
  const [kmRodados, setKmRodados] = useState('');
  const [mostrarResultado, setMostrarResultado] = useState(false);

  // Adiciona corrida
  const adicionarCorrida = () => {
    const valor = parseFloat(valorAtual.replace(',', '.'));
    
    if (isNaN(valor) || valor <= 0) {
      Alert.alert('Atenção', 'Digite um valor válido');
      return;
    }

    const novaCorrida: Corrida = {
      id: Date.now().toString(),
      valor,
      timestamp: Date.now(),
    };

    setCorridas([...corridas, novaCorrida]);
    setValorAtual('');
  };

  // Remove corrida
  const removerCorrida = (id: string) => {
    setCorridas(corridas.filter(c => c.id !== id));
  };

  // Finaliza e calcula
  const finalizar = async () => {
    if (corridas.length === 0) {
      Alert.alert('Atenção', 'Adicione pelo menos uma corrida');
      return;
    }

    const km = parseFloat(kmRodados.replace(',', '.'));
    if (isNaN(km) || km <= 0) {
      Alert.alert('Atenção', 'Digite os KM rodados');
      return;
    }

    // Salva no histórico
    const ganhoTotal = corridas.reduce((sum, c) => sum + c.valor, 0);
    const ganhoPorKm = ganhoTotal / km;
    
    await salvarDia({
      data: new Date().toLocaleDateString('pt-BR'),
      corridas,
      kmRodados: km,
      ganhoTotal,
      ganhoPorKm,
    });

    setMostrarResultado(true);
  };

  // Cálculos
  const ganhoTotal = corridas.reduce((sum, c) => sum + c.valor, 0);
  const km = parseFloat(kmRodados.replace(',', '.')) || 0;
  const ganhoPorKm = km > 0 ? ganhoTotal / km : 0;

  // Resetar
  const resetar = () => {
    setCorridas([]);
    setValorAtual('');
    setKmRodados('');
    setMostrarResultado(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>💰 Calculadora de Ganhos</Text>
            <Text style={styles.subtitle}>
              Acompanhe seus ganhos do dia
            </Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.btnHistorico}
              onPress={() => router.push('/(public)/mapa-postos')}
            >
              <Text style={styles.btnHistoricoText}>🗺️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnHistorico}
              onPress={() => router.push('/(public)/historico-calculadora')}
            >
              <Text style={styles.btnHistoricoText}>📊</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {!mostrarResultado ? (
        <>
          {/* Adicionar Corrida */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Adicionar Corrida</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Valor da corrida (R$)</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 25,50"
                  keyboardType="decimal-pad"
                  value={valorAtual}
                  onChangeText={setValorAtual}
                />
                <TouchableOpacity
                  style={styles.btnAdd}
                  onPress={adicionarCorrida}
                >
                  <Text style={styles.btnAddText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Lista de Corridas */}
          {corridas.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Corridas do Dia ({corridas.length})
              </Text>
              
              {corridas.map((corrida) => (
                <View key={corrida.id} style={styles.corridaItem}>
                  <Text style={styles.corridaValor}>
                    R$ {corrida.valor.toFixed(2).replace('.', ',')}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removerCorrida(corrida.id)}
                  >
                    <Text style={styles.btnRemove}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <View style={styles.totalParcial}>
                <Text style={styles.totalParcialLabel}>Total Parcial:</Text>
                <Text style={styles.totalParcialValor}>
                  R$ {ganhoTotal.toFixed(2).replace('.', ',')}
                </Text>
              </View>
            </View>
          )}

          {/* Finalizar */}
          {corridas.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Finalizar Dia</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Quantos KM você rodou?</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 150"
                  keyboardType="decimal-pad"
                  value={kmRodados}
                  onChangeText={setKmRodados}
                />
              </View>

              <TouchableOpacity
                style={styles.btnFinalizar}
                onPress={finalizar}
              >
                <Text style={styles.btnFinalizarText}>
                  FINALIZAR E VER RESULTADO
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      ) : (
        <>
          {/* Resultado */}
          <View style={styles.cardResultado}>
            <Text style={styles.resultadoTitle}>📊 Resultado do Dia</Text>
            
            <View style={styles.resultadoItem}>
              <Text style={styles.resultadoLabel}>Total de Corridas:</Text>
              <Text style={styles.resultadoValor}>{corridas.length}</Text>
            </View>

            <View style={styles.resultadoItem}>
              <Text style={styles.resultadoLabel}>Ganho Total:</Text>
              <Text style={styles.resultadoValorDestaque}>
                R$ {ganhoTotal.toFixed(2).replace('.', ',')}
              </Text>
            </View>

            <View style={styles.resultadoItem}>
              <Text style={styles.resultadoLabel}>KM Rodados:</Text>
              <Text style={styles.resultadoValor}>
                {km.toFixed(1).replace('.', ',')} km
              </Text>
            </View>

            <View style={styles.resultadoItem}>
              <Text style={styles.resultadoLabel}>Ganho por KM:</Text>
              <Text style={styles.resultadoValorDestaque}>
                R$ {ganhoPorKm.toFixed(2).replace('.', ',')} /km
              </Text>
            </View>

            {/* Análise */}
            <View style={styles.analise}>
              <Text style={styles.analiseTitle}>💡 Análise</Text>
              {ganhoPorKm < 1.5 && (
                <Text style={styles.analiseTexto}>
                  Seu ganho por KM está abaixo da média. Considere otimizar suas rotas!
                </Text>
              )}
              {ganhoPorKm >= 1.5 && ganhoPorKm < 2.5 && (
                <Text style={styles.analiseTexto}>
                  Bom desempenho! Você está na média do mercado.
                </Text>
              )}
              {ganhoPorKm >= 2.5 && (
                <Text style={styles.analiseTexto}>
                  Excelente! Seu ganho por KM está acima da média! 🎉
                </Text>
              )}
            </View>

            {/* CTA */}
            <View style={styles.cta}>
              <Text style={styles.ctaTitle}>🛡️ Proteja seus Ganhos!</Text>
              <Text style={styles.ctaTexto}>
                Acidentes, panes e imprevistos podem acontecer. 
                Tenha proteção completa para suas corridas!
              </Text>
              
              <TouchableOpacity
                style={styles.btnCadastro}
                onPress={() => router.push('/(public)/register')}
              >
                <Text style={styles.btnCadastroText}>
                  QUERO ME PROTEGER AGORA
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnLogin}
                onPress={() => router.push('/(public)/login')}
              >
                <Text style={styles.btnLoginText}>
                  Já tenho conta
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.btnNovo}
              onPress={resetar}
            >
              <Text style={styles.btnNovoText}>
                Calcular Novo Dia
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#00a9ff',
    padding: 24,
    paddingTop: 60,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  btnHistorico: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnHistoricoText: {
    fontSize: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  card: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  btnAdd: {
    backgroundColor: '#00a9ff',
    width: 50,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnAddText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  corridaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  corridaValor: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  btnRemove: {
    color: '#ef4444',
    fontSize: 20,
    padding: 8,
  },
  totalParcial: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#00a9ff',
  },
  totalParcialLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalParcialValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00a9ff',
  },
  btnFinalizar: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  btnFinalizarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardResultado: {
    backgroundColor: 'white',
    margin: 16,
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultadoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  resultadoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultadoLabel: {
    fontSize: 16,
    color: '#666',
  },
  resultadoValor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  resultadoValorDestaque: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00a9ff',
  },
  analise: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  analiseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  analiseTexto: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  cta: {
    backgroundColor: '#fef3c7',
    padding: 20,
    borderRadius: 8,
    marginTop: 24,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  ctaTexto: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  btnCadastro: {
    backgroundColor: '#00a9ff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnCadastroText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnLogin: {
    padding: 12,
    alignItems: 'center',
  },
  btnLoginText: {
    color: '#00a9ff',
    fontSize: 14,
    fontWeight: '600',
  },
  btnNovo: {
    marginTop: 24,
    padding: 16,
    alignItems: 'center',
  },
  btnNovoText: {
    color: '#00a9ff',
    fontSize: 16,
    fontWeight: '600',
  },
});
