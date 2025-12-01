// app/_layout.tsx
import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/context/authContext';
import { setupNotificationListeners } from '@/services/notifications';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    // Configura listeners de notificações
    const listeners = setupNotificationListeners(
      (notification) => {
        // Notificação recebida com app aberto
        console.log('🔔 Notificação recebida:', notification.request.content.title);
      },
      (response) => {
        // Usuário tocou na notificação
        console.log('👆 Notificação tocada');
        const data = response.notification.request.content.data;
        
        // Navega para a tela especificada
        if (data.screen) {
          router.push(data.screen as any);
        }
      }
    );

    // Cleanup ao desmontar
    return () => listeners.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {/* IMPORTANTÍSSIMO: renderizar um navigator no 1º render */}
            <Stack screenOptions={{ headerTitleAlign: 'center' }} />
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
