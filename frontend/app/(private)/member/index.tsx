import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
  Linking,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAuth } from '@/context/authContext';
import { getMe, getMySubscription } from '@/services/profile';
import { api } from '@/lib/api';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3333';

const DEFAULT_BANNERS = [
  { id: 1, image: require('@/assets/1.png') },
  { id: 2, image: require('@/assets/2.png') },
  { id: 3, image: require('@/assets/3.png') },
];

interface BannerData {
  id: number;
  imageUrl: string;
  order: number;
  active: boolean;
}

function Banner({ imageUrl, isLocal }: { imageUrl: string; isLocal?: boolean }) {
  return (
    <View style={styles.banner}>
      <Image 
        source={isLocal ? imageUrl as any : { uri: `${API_URL}${imageUrl}` }} 
        style={styles.bannerImage} 
        resizeMode="cover" 
      />
    </View>
  );
}

function SuggestionCard({ icon, title, onPress }: { icon: string; title: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.suggestionCard} onPress={onPress}>
      <Text style={styles.suggestionIcon}>{icon}</Text>
      <Text style={styles.suggestionTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

export default function MemberHome() {
  useAuthGuard();
  const router = useRouter();
  const { signOut } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [banners, setBanners] = useState<any[]>(DEFAULT_BANNERS);
  const [bannersLoaded, setBannersLoaded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  const { data: me, isLoading: meLoading } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });

  const { data: sub, isLoading: subLoading } = useQuery({
    queryKey: ['me/subscription'],
    queryFn: getMySubscription,
  });

  // Carregar banners da API
  useEffect(() => {
    async function loadBanners() {
      try {
        const response = await api.get('/banners');
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          setBanners(response.data.map((b: BannerData) => ({
            id: b.id,
            imageUrl: b.imageUrl,
            isLocal: false,
          })));
          setBannersLoaded(true);
        }
      } catch (error) {
        console.log('Usando banners padrão');
      }
    }
    loadBanners();
  }, []);

  // Carregar notificações não lidas
  useEffect(() => {
    async function loadUnreadNotifications() {
      try {
        const response = await api.get('/notifications');
        const notifications = response.data || [];
        const unread = notifications.filter((n: any) => !n.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.log('Erro ao carregar notificações');
      }
    }
    loadUnreadNotifications();
  }, []);

  // Auto-play do carrossel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => {
        const next = (prev + 1) % banners.length;
        scrollRef.current?.scrollTo({
          x: next * width,
          animated: true,
        });
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [banners.length]);

  if (meLoading || subLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#00a9ff" />
      </View>
    );
  }

  const status = sub?.status?.toString().toLowerCase();
  const isMember = status === 'active';
  const plan = sub?.plan ?? null;
  const planName = plan?.displayName ?? plan?.tier ?? null;
  
  // Calcular dias de carência
  const graceEndsAt = sub?.graceEndsAt;
  const graceDaysLeft = graceEndsAt 
    ? Math.max(0, Math.ceil((new Date(graceEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
  const showGracePeriod = isMember && graceDaysLeft > 0;
  const graceProgress = graceDaysLeft > 0 ? ((30 - graceDaysLeft) / 30) * 100 : 0;

  // Emoji da medalha por plano
  const getPlanEmoji = (tier: string) => {
    const t = tier?.toLowerCase();
    if (t === 'ouro' || t === 'gold') return '🥇';
    if (t === 'prata' || t === 'silver') return '🥈';
    if (t === 'bronze') return '🥉';
    return '💎';
  };

  const getPlanColor = (tier: string) => {
    const t = tier?.toLowerCase();
    if (t === 'ouro' || t === 'gold') return '#FFD700';
    if (t === 'prata' || t === 'silver') return '#C0C0C0';
    if (t === 'bronze') return '#CD7F32';
    return '#00a9ff';
  };

  return (
    <View style={styles.container}>
      {/* Header estilo Uber */}
      <View style={styles.header}>
        <Image
          source={require('@/assets/logo2.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <TouchableOpacity
          style={styles.notificationBtn}
          onPress={() => router.push('/(private)/member/notifications')}
        >
          <Ionicons name="notifications-outline" size={28} color="#fff" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Saudação e Plano */}
        <View style={styles.greetingSection}>
          <View style={styles.greetingRow}>
            <Text style={styles.greeting}>Olá, {me?.name?.split(' ')[0] || 'Associado'}!</Text>
            {isMember && planName ? (
              <View style={styles.planBadge}>
                <Text style={styles.planEmoji}>{getPlanEmoji(plan?.tier || '')}</Text>
                <Text style={[styles.planText, { color: getPlanColor(plan?.tier || '') }]}>
                  {planName}
                </Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.alertBadge}
                onPress={() => router.push('/(private)/associate')}
              >
                <Text style={styles.alertEmoji}>⚠️</Text>
                <Text style={styles.alertText}>Sem plano</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Barra de Carência */}
        {showGracePeriod && (
          <View style={styles.graceContainer}>
            <View style={styles.graceHeader}>
              <Text style={styles.graceTitle}>⏳ Período de carência</Text>
              <Text style={styles.graceDays}>{graceDaysLeft} dias restantes</Text>
            </View>
            <View style={styles.graceBarBg}>
              <View style={[styles.graceBarFill, { width: `${graceProgress}%` }]} />
            </View>
            <Text style={styles.graceInfo}>
              Após a carência, você poderá solicitar apoio
            </Text>
          </View>
        )}

        {/* Sugestões */}
        <View style={styles.suggestionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sugestões</Text>
          </View>
          <View style={styles.suggestionsGrid}>
            <SuggestionCard
              icon="🧮"
              title="Calculadora"
              onPress={() => router.push('/(public)/calculadora')}
            />
            <SuggestionCard
              icon="🗺️"
              title="Mapa"
              onPress={() => router.push('/(public)/mapa-postos')}
            />
            {isMember && !showGracePeriod && (
              <SuggestionCard
                icon="🚨"
                title="Suporte"
                onPress={() => router.push('/(private)/member/support/new')}
              />
            )}
          </View>
        </View>

        {/* Carrossel de Banners */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.carouselContainer}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentBanner(index);
          }}
        >
          {banners.map((banner) => (
            <Banner 
              key={banner.id} 
              imageUrl={bannersLoaded ? banner.imageUrl : banner.image} 
              isLocal={!bannersLoaded}
            />
          ))}
        </ScrollView>

        {/* Indicadores do carrossel */}
        <View style={styles.indicators}>
          {banners.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentBanner === index && styles.indicatorActive,
              ]}
            />
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal de Menu */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuModal}>
            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => {
                setShowMenu(false);
                router.push('/(private)/member/payments');
              }}
            >
              <Ionicons name="card-outline" size={24} color="#374151" />
              <Text style={styles.menuOptionText}>Pagamentos</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => {
                setShowMenu(false);
                Linking.openURL('https://wa.me/5512991332677');
              }}
            >
              <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
              <Text style={styles.menuOptionText}>Suporte WhatsApp</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => {
                setShowMenu(false);
                signOut();
              }}
            >
              <Ionicons name="log-out-outline" size={24} color="#ef4444" />
              <Text style={[styles.menuOptionText, { color: '#ef4444' }]}>Sair</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Menu Fixo Inferior */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/(private)/member/profile')}
        >
          <Ionicons name="person-outline" size={24} color="#6b7280" />
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/(private)/member/documents')}
        >
          <Ionicons name="document-text-outline" size={24} color="#6b7280" />
          <Text style={styles.navText}>Documentos</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/(private)/member/support')}
        >
          <Ionicons name="help-circle-outline" size={24} color="#6b7280" />
          <Text style={styles.navText}>Solicitações</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setShowMenu(true)}
        >
          <Ionicons name="menu-outline" size={24} color="#6b7280" />
          <Text style={styles.navText}>Menu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 16,
    backgroundColor: '#00a9ff',
  },
  headerLogo: {
    width: 80,
    height: 32,
  },
  notificationBtn: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  greetingSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planEmoji: {
    fontSize: 20,
  },
  planText: {
    fontSize: 16,
    fontWeight: '600',
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  alertEmoji: {
    fontSize: 16,
  },
  alertText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  graceContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  graceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  graceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
  },
  graceDays: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  graceBarBg: {
    height: 8,
    backgroundColor: '#dbeafe',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  graceBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  graceInfo: {
    fontSize: 12,
    color: '#1e40af',
  },
  suggestionsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  suggestionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  suggestionCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  suggestionIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  suggestionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  carouselContainer: {
    marginTop: 8,
  },
  banner: {
    width: width - 40,
    height: 300,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  indicatorActive: {
    backgroundColor: '#00a9ff',
    width: 24,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: 44,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navText: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  menuOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
});
