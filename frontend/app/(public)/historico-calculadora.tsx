// app/(public)/historico-calculadora.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCalculadora } from '@/hooks/useCalculadora';

export default function HistoricoCalculadora() {
  const router = useRouter();
  const { historico, estatisticas } = useCalculadora();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.btnVoltar}
        >
          <Text style={styles.btnVoltarText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📊 Histórico</Text>
      </View>

      {/* Estatísticas Gerais */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumo Geral</Text>
        
        <View style={styles.estatItem}>
          <Text style={styles.estatLabel}>Total de Dias:</Text>
          <Text style={styles.estatValor}>{estatisticas.totalDias}</Text>
        </View>

        <View style={styles.estatItem}>
          <Text style={styles.estatLabel}>Ganho Total:</Text>
          <Text style={styles.estatValorDestaque}>
            R$ {estatisticas.ganhoTotal.toFixed(2).replace('.', ',')}
          </Text>
        </View>

        <View style={styles.estatItem}>
          <Text style={styles.estatLabel}>KM Total:</Text>
          <Text style={styles.estatValor}>
            {estatisticas.kmTotal.toFixed(1).replace('.', ',')} km
          </Text>
        </View>

        <View style={styles.estatItem}>
          <Text style={styles.estatLabel}>Média R$/KM:</Text>
          <Text style={styles.estatValorDestaque}>
            R$ {estatisticas.mediaGanhoPorKm.toFixed(2).replace('.', ',')}
          </Text>
        </View>
      </View>

      {/* Histórico por Dia */}
      {historico.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.vazioTexto}>
            Nenhum dia calculado ainda.
          </Text>
          <TouchableOpacity
            style={styles.btnCalcular}
            onPress={() => router.push('/(public)/calculadora')}
          >
            <Text style={styles.btnCalcularText}>
              Calcular Primeiro Dia
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Dias Calculados</Text>
          {historico.map((dia, index) => (
            <View key={index} style={styles.diaCard}>
              <View style={styles.diaHeader}>
                <Text style={styles.diaData}>{dia.data}</Text>
                <Text style={styles.diaCorridas}>
                  {dia.corridas.length} corridas
                </Text>
              </View>

              <View style={styles.diaStats}>
                <View style={styles.diaStat}>
                  <Text style={styles.diaStatLabel}>Ganho</Text>
                  <Text style={styles.diaStatValor}>
                    R$ {dia.ganhoTotal.toFixed(2).replace('.', ',')}
                  </Text>
                </View>

                <View style={styles.diaStat}>
                  <Text style={styles.diaStatLabel}>KM</Text>
                  <Text style={styles.diaStatValor}>
                    {dia.kmRodados.toFixed(1).replace('.', ',')}
                  </Text>
                </View>

                <View style={styles.diaStat}>
                  <Text style={styles.diaStatLabel}>R$/KM</Text>
                  <Text style={styles.diaStatValor}>
                    {dia.ganhoPorKm.toFixed(2).replace('.', ',')}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </>
      )}

      {/* CTA */}
      <View style={styles.cta}>
        <Text style={styles.ctaTitle}>💡 Dica</Text>
        <Text style={styles.ctaTexto}>
          Motoristas associados têm acesso a relatórios detalhados e 
          proteção completa para suas corridas!
        </Text>
        <TouchableOpacity
          style={styles.btnCadastro}
          onPress={() => router.push('/(public)/register')}
        >
          <Text style={styles.btnCadastroText}>
            QUERO ME ASSOCIAR
          </Text>
        </TouchableOpacity>
      </View>
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
  btnVoltar: {
    marginBottom: 16,
  },
  btnVoltarText: {
    color: 'white',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
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
  estatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  estatLabel: {
    fontSize: 16,
    color: '#666',
  },
  estatValor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  estatValorDestaque: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00a9ff',
  },
  vazio: {
    alignItems: 'center',
    padding: 40,
  },
  vazioTexto: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  btnCalcular: {
    backgroundColor: '#00a9ff',
    padding: 16,
    borderRadius: 8,
  },
  btnCalcularText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  diaCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  diaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  diaData: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  diaCorridas: {
    fontSize: 14,
    color: '#666',
  },
  diaStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  diaStat: {
    alignItems: 'center',
  },
  diaStatLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  diaStatValor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00a9ff',
  },
  cta: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00a9ff',
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
  },
  btnCadastroText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
