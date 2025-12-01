// hooks/useCalculadora.ts
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Corrida = {
  id: string;
  valor: number;
  timestamp: number;
};

type DiaCalculado = {
  data: string;
  corridas: Corrida[];
  kmRodados: number;
  ganhoTotal: number;
  ganhoPorKm: number;
};

const STORAGE_KEY = '@calculadora_historico';

export function useCalculadora() {
  const [historico, setHistorico] = useState<DiaCalculado[]>([]);

  // Carrega histórico
  useEffect(() => {
    carregarHistorico();
  }, []);

  const carregarHistorico = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        setHistorico(JSON.parse(data));
      }
    } catch (error) {
      console.log('Erro ao carregar histórico:', error);
    }
  };

  const salvarDia = async (dia: DiaCalculado) => {
    try {
      const novoHistorico = [dia, ...historico].slice(0, 30); // Mantém últimos 30 dias
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novoHistorico));
      setHistorico(novoHistorico);
    } catch (error) {
      console.log('Erro ao salvar dia:', error);
    }
  };

  const limparHistorico = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setHistorico([]);
    } catch (error) {
      console.log('Erro ao limpar histórico:', error);
    }
  };

  // Estatísticas gerais
  const estatisticas = {
    totalDias: historico.length,
    ganhoTotal: historico.reduce((sum, dia) => sum + dia.ganhoTotal, 0),
    kmTotal: historico.reduce((sum, dia) => sum + dia.kmRodados, 0),
    mediaGanhoPorKm: historico.length > 0
      ? historico.reduce((sum, dia) => sum + dia.ganhoPorKm, 0) / historico.length
      : 0,
  };

  return {
    historico,
    salvarDia,
    limparHistorico,
    estatisticas,
  };
}
