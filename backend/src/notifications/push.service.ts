import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private expo: Expo;

  constructor(private readonly prisma: PrismaService) {
    this.expo = new Expo();
  }

  /**
   * Registra ou atualiza o push token do usuário
   */
  async registerPushToken(userId: string, pushToken: string) {
    // Valida se é um token válido do Expo
    if (!Expo.isExpoPushToken(pushToken)) {
      throw new Error('Token de push inválido');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { pushToken },
    });

    this.logger.log(`Push token registrado para usuário ${userId}`);
    return { success: true };
  }

  /**
   * Remove o push token do usuário (logout)
   */
  async removePushToken(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { pushToken: null },
    });

    this.logger.log(`Push token removido para usuário ${userId}`);
    return { success: true };
  }

  /**
   * Envia push notification para um usuário específico
   */
  async sendToUser(userId: string, title: string, body: string, data?: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { pushToken: true, name: true },
    });

    if (!user?.pushToken) {
      this.logger.warn(`Usuário ${userId} não tem push token registrado`);
      return { success: false, message: 'Usuário sem push token' };
    }

    return this.sendPushNotification([user.pushToken], title, body, data);
  }

  /**
   * Envia push para usuários SEM plano ativo (marketing)
   */
  async sendToUsersWithoutPlan(title: string, body: string, data?: any) {
    const users = await this.prisma.user.findMany({
      where: {
        pushToken: { not: null },
        subscriptions: {
          none: {
            status: 'ACTIVE',
          },
        },
      },
      select: { pushToken: true },
    });

    const tokens = users.map((u) => u.pushToken!).filter(Boolean);
    this.logger.log(`Enviando push para ${tokens.length} usuários sem plano`);

    return this.sendPushNotification(tokens, title, body, data);
  }

  /**
   * Envia push para usuários COM plano ativo
   */
  async sendToUsersWithActivePlan(title: string, body: string, data?: any) {
    const users = await this.prisma.user.findMany({
      where: {
        pushToken: { not: null },
        subscriptions: {
          some: {
            status: 'ACTIVE',
          },
        },
      },
      select: { pushToken: true },
    });

    const tokens = users.map((u) => u.pushToken!).filter(Boolean);
    this.logger.log(`Enviando push para ${tokens.length} usuários com plano ativo`);

    return this.sendPushNotification(tokens, title, body, data);
  }

  /**
   * Envia push para TODOS os usuários
   */
  async sendToAllUsers(title: string, body: string, data?: any) {
    const users = await this.prisma.user.findMany({
      where: { pushToken: { not: null } },
      select: { pushToken: true },
    });

    const tokens = users.map((u) => u.pushToken!).filter(Boolean);
    this.logger.log(`Enviando push para ${tokens.length} usuários`);

    return this.sendPushNotification(tokens, title, body, data);
  }

  /**
   * Método privado que realmente envia as notificações
   */
  private async sendPushNotification(
    tokens: string[],
    title: string,
    body: string,
    data?: any,
  ) {
    if (tokens.length === 0) {
      return { success: false, message: 'Nenhum token para enviar' };
    }

    // Cria as mensagens
    const messages: ExpoPushMessage[] = tokens.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data: data || {},
      priority: 'high',
    }));

    // Divide em chunks (Expo aceita max 100 por vez)
    const chunks = this.expo.chunkPushNotifications(messages);
    const tickets: ExpoPushTicket[] = [];

    try {
      for (const chunk of chunks) {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      }

      // Conta sucessos e erros
      const successful = tickets.filter((t) => t.status === 'ok').length;
      const failed = tickets.filter((t) => t.status === 'error').length;

      this.logger.log(`Push enviado: ${successful} sucesso, ${failed} falhas`);

      return {
        success: true,
        sent: successful,
        failed,
        total: tokens.length,
      };
    } catch (error: any) {
      this.logger.error('Erro ao enviar push notifications:', error);
      return {
        success: false,
        message: 'Erro ao enviar notificações',
        error: error?.message || 'Erro desconhecido',
      };
    }
  }

  /**
   * Envia notificação de vencimento próximo
   */
  async sendExpirationWarning(userId: string, planName: string, daysRemaining: number) {
    return this.sendToUser(
      userId,
      `⚠️ Seu plano expira em ${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'}!`,
      `Seu plano ${planName} está próximo do vencimento. Renove para continuar aproveitando os benefícios!`,
      {
        type: 'expiration_warning',
        daysRemaining,
        screen: 'associate',
      },
    );
  }

  /**
   * Envia notificação de pagamento aprovado
   */
  async sendPaymentApproved(userId: string, planName: string) {
    return this.sendToUser(
      userId,
      '✅ Pagamento Aprovado!',
      `Seu plano ${planName} foi ativado com sucesso. Aproveite todos os benefícios!`,
      {
        type: 'payment_approved',
        screen: 'member',
      },
    );
  }

  /**
   * Envia notificação de plano expirado
   */
  async sendPlanExpired(userId: string, planName: string) {
    return this.sendToUser(
      userId,
      '❌ Plano Expirado',
      `Seu plano ${planName} expirou. Renove agora para continuar com acesso aos benefícios!`,
      {
        type: 'plan_expired',
        screen: 'associate',
      },
    );
  }
}
