// app/(private)/associate/[category].tsx
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getPlans } from '@/services/plans';
import { getPublicCategories, type PublicCategory } from '@/services/public';

type Plan = {
  id: string;
  displayName: string;
  priceCents: number;
  tier?: string;
};

export default function CategoryPlans() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const router = useRouter();
  const categorySlug = String(category ?? '');

  const { data: plans, isLoading: plansLoading } = useQuery<Plan[]>({
    queryKey: ['public/plans'],
    queryFn: getPlans,
  });

  const { data: categories } = useQuery<PublicCategory[]>({
    queryKey: ['public/categories'],
    queryFn: getPublicCategories,
  });

  const cat = useMemo(
    () => categories?.find((c) => c.slug === categorySlug),
    [categories, categorySlug]
  );

  function choose(plan: Plan) {
    // Vai para tela de termos antes do checkout
    router.push({
      pathname: '/(private)/associate/terms',
      params: {
        planId: plan.id,
        planName: plan.displayName,
        planPrice: String(plan.priceCents),
        category: categorySlug,
      },
    });
  }

  if (plansLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#00a9ff" />
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
        <Text style={styles.title}>{cat?.title || categorySlug}</Text>
        {cat?.description && (
          <Text style={styles.subtitle}>{cat.description}</Text>
        )}
      </View>

      {/* Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoIcon}>💡</Text>
        <Text style={styles.infoText}>
          Escolha o plano ideal para você. Todos incluem assistência 24h!
        </Text>
      </View>

      {/* Planos */}
      <Text style={styles.sectionTitle}>Planos Disponíveis</Text>
      {(plans ?? []).map((plan, index) => {
        const isPopular = index === 1; // Marca o segundo plano como popular
        return (
          <TouchableOpacity
            key={plan.id}
            style={[styles.planCard, isPopular && styles.planCardPopular]}
            onPress={() => choose(plan)}
          >
            {isPopular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>⭐ MAIS POPULAR</Text>
              </View>
            )}
            
            <View style={styles.planHeader}>
              <Text style={styles.planTier}>{plan.tier || 'Plano'}</Text>
              <Text style={styles.planName}>{plan.displayName}</Text>
            </View>

            <View style={styles.planPriceBox}>
              <Text style={styles.planPrice}>
                R$ {(plan.priceCents / 100).toFixed(2).replace('.', ',')}
              </Text>
              <Text style={styles.planPeriod}>/mês</Text>
            </View>

            <View style={styles.planFeatures}>
              <Text style={styles.planFeature}>✓ Assistência 24h</Text>
              <Text style={styles.planFeature}>✓ Cobertura nacional</Text>
              <Text style={styles.planFeature}>✓ Suporte emergencial</Text>
              <Text style={styles.planFeature}>✓ Sem carência</Text>
            </View>

            <TouchableOpacity
              style={[styles.selectBtn, isPopular && styles.selectBtnPopular]}
              onPress={() => choose(plan)}
            >
              <Text style={[styles.selectBtnText, isPopular && styles.selectBtnTextPopular]}>
                ESCOLHER PLANO
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        );
      })}

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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planCardPopular: {
    borderColor: '#00a9ff',
    backgroundColor: '#faf5ff',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: '#fbbf24',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  popularBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#78350f',
  },
  planHeader: {
    marginBottom: 16,
  },
  planTier: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00a9ff',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  planPriceBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  planPrice: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00a9ff',
  },
  planPeriod: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 4,
  },
  planFeatures: {
    gap: 8,
    marginBottom: 20,
  },
  planFeature: {
    fontSize: 14,
    color: '#374151',
  },
  selectBtn: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectBtnPopular: {
    backgroundColor: '#00a9ff',
  },
  selectBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00a9ff',
  },
  selectBtnTextPopular: {
    color: 'white',
  },
});
