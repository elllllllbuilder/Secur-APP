import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { api } from '../lib/api';

// Configuração de como as notificações devem ser exibidas
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Registra o dispositivo para receber push notifications
 * Retorna o Expo Push Token
 */
export async function registerForPushNotificationsAsync() {
  try {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#00a9ff',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permissão de notificação negada');
        return null;
      }

      // Pega o token do Expo
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      
      // Só tenta registrar se tiver um projectId válido (UUID)
      if (projectId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId)) {
        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log('✅ Push Token registrado:', token);
      } else {
        console.log('⚠️ Push notifications desabilitadas (projectId não configurado)');
        console.log('💡 Para habilitar, configure um projectId UUID válido no app.json');
        return null;
      }
    } else {
      console.log('⚠️ Push notifications só funcionam em dispositivos físicos');
    }

    return token;
  } catch (error) {
    console.error('❌ Erro ao registrar push token:', error);
    // Não quebra o app se falhar
    return null;
  }
}

/**
 * Envia o token para o backend
 */
export async function sendPushTokenToBackend(token: string) {
  try {
    await api.post('/notifications/register-token', { pushToken: token });
    console.log('Token registrado no backend');
  } catch (error) {
    console.error('Erro ao registrar token:', error);
  }
}

/**
 * Remove o token do backend (logout)
 */
export async function removePushTokenFromBackend() {
  try {
    await api.delete('/notifications/remove-token');
    console.log('Token removido do backend');
  } catch (error) {
    console.error('Erro ao remover token:', error);
  }
}

/**
 * Configura listeners para notificações
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationTapped?: (response: Notifications.NotificationResponse) => void,
) {
  // Quando recebe notificação com app aberto
  const receivedListener = Notifications.addNotificationReceivedListener((notification) => {
    console.log('Notificação recebida:', notification);
    onNotificationReceived?.(notification);
  });

  // Quando usuário toca na notificação
  const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('Notificação tocada:', response);
    onNotificationTapped?.(response);
  });

  return {
    receivedListener,
    responseListener,
    remove: () => {
      receivedListener.remove();
      responseListener.remove();
    },
  };
}


// ===== Tipos =====
export type AppNotification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

// ===== API de Notificações In-App =====

/**
 * Busca notificações do usuário
 */
export async function getMyNotifications(): Promise<AppNotification[]> {
  try {
    console.log('[NOTIFICATIONS] Buscando notificações...');
    const res = await api.get('/notifications/me');
    console.log('[NOTIFICATIONS] Resposta completa:', JSON.stringify(res.data, null, 2));
    
    // Unwrap duplo: res.data.data.data (por causa do interceptor)
    let data = res.data?.data?.data || res.data?.data || res.data || [];
    
    console.log('[NOTIFICATIONS] Dados extraídos:', data);
    console.log('[NOTIFICATIONS] É array?', Array.isArray(data));
    console.log('[NOTIFICATIONS] Recebidas:', Array.isArray(data) ? data.length : 'não é array', 'notificações');
    
    if (Array.isArray(data) && data.length > 0) {
      console.log('[NOTIFICATIONS] Primeira notificação:', data[0]);
    }
    
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error('[NOTIFICATIONS] Erro ao buscar:', error?.message);
    console.error('[NOTIFICATIONS] Status:', error?.response?.status);
    console.error('[NOTIFICATIONS] Data:', error?.response?.data);
    return [];
  }
}

/**
 * Deleta notificação
 */
export async function deleteNotification(id: string): Promise<void> {
  await api.delete(`/notifications/${id}`);
}

/**
 * Deleta todas notificações
 */
export async function deleteAllNotifications(): Promise<void> {
  await api.delete('/notifications/all');
}
