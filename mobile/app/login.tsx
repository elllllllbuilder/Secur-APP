import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Pressable } from 'react-native';
import { router } from 'expo-router';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      const mockUser = {
        id: '1',
        name: 'app User',
        email: 'user@appplus.com'
      };
      
      await login(mockUser);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Login Error', 'Failed to login. Please try again.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={[styles.title, { color: colors.primary }]}>
          app+
        </ThemedText>
        
        <ThemedText style={styles.subtitle}>
          Welcome to app+
        </ThemedText>
        
        <ThemedText style={styles.description}>
          Description 
        </ThemedText>
        
        <Pressable
          style={[styles.loginButton, { backgroundColor: colors.primary }]}
          onPress={handleLogin}
        >
          <ThemedText style={[styles.loginButtonText, { color: colors.background }]}>
            Login
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
    width: '100%',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.7,
  },
  loginButton: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});