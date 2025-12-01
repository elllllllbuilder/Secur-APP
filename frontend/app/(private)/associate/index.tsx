// app/(private)/associate/index.tsx
import React from 'react';
import { ScrollView, ActivityIndicator, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getPublicCategories, type PublicCategory } from '@/services/public';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function Associate() {
  useAuthGuard();
  const router = useRouter();

  const { data, isLoading, error } = useQuery<PublicCategory[]>({
    queryKey: ['public/categories'],
    queryFn: getPublicCategories,
  });

  const categories = data ?? [];

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#00a9ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.error}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>Não foi possível carregar as categorias.</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
          <Text style={styles.retryBtnText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Escolha sua Categoria</Text>
        <Text style={styles.subtitle}>
          Selecione a categoria que melhor se encaixa com sua atividade
        </Text>
      </View>

      {/* Categorias */}
      {categories.map((category) => (
        <TouchableOpacity
          key={category.slug}
          style={styles.categoryCard}
          onPress={() =>
            router.push({
              pathname: '/(private)/associate/[category]',
              params: { category: category.slug },
            })
          }
        >
          <View style={styles.categoryIcon}>
            <Text style={styles.categoryIconText}>
              {category.slug === 'motorista' ? '🚗' : '🏢'}
            </Text>
          </View>
          <View style={styles.categoryContent}>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            <Text style={styles.categoryDesc}>{category.description}</Text>
          </View>
          <Text style={styles.categoryArrow}>›</Text>
        </TouchableOpacity>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 20,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  error: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryBtn: {
    backgroundColor: '#00a9ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    marginBottom: 24,
  },
  backBtn: {
    fontSize: 16,
    color: '#00a9ff',
    fontWeight: '600',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  categoryIconText: {
    fontSize: 28,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  categoryDesc: {
    fontSize: 14,
    color: '#6b7280',
  },
  categoryArrow: {
    fontSize: 28,
    color: '#d1d5db',
  },
});
