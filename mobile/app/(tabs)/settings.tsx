import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LogoutButton } from '@/components/LogoutButton';
import { useThemeColors } from '@/contexts/ThemeContext';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function SettingsScreen() {
  const colors = useThemeColors();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: colors.secondary, dark: colors.primary }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="gearshape.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Configurações</ThemedText>
      </ThemedView>
      <ThemedText style={styles.subtitle}>
        Configure sua experiência no app+
      </ThemedText>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>
          Aparência
        </ThemedText>
        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <View style={styles.settingInfo}>
            <ThemedText style={styles.settingLabel}>
              Tema
            </ThemedText>
            <ThemedText style={styles.settingDescription}>
              Alternar entre tema claro e escuro
            </ThemedText>
          </View>
          <ThemeToggle />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>
          Em Breve
        </ThemedText>
        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <View style={styles.settingInfo}>
            <ThemedText style={[styles.settingLabel, { opacity: 0.5 }]}>
              Notificações
            </ThemedText>
            <ThemedText style={[styles.settingDescription, { opacity: 0.5 }]}>
              Gerencie suas preferências de notificação
            </ThemedText>
          </View>
        </View>
        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <View style={styles.settingInfo}>
            <ThemedText style={[styles.settingLabel, { opacity: 0.5 }]}>
              Dados e Privacidade
            </ThemedText>
            <ThemedText style={[styles.settingDescription, { opacity: 0.5 }]}>
              Gerencie suas configurações de dados e privacidade
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <LogoutButton />
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    opacity: 0.8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.6,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    marginTop: 40,
  },
});