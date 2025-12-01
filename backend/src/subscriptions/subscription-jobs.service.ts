import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { SubStatus } from '@prisma/client';
import { EmailService } from '../notifications/email.service';
import { PushService } from '../notifications/push.service';

@Injectable()
export class SubscriptionJobsService {
  private readonly logger = new Logger(SubscriptionJobsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly pushService: PushService,
  ) {}

  /**
   * Roda todos os dias às 9h da manhã
   * Verifica assinaturas que precisam de ação
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkSubscriptions() {
    this.logger.log('🔍 Iniciando verificação de assinaturas...');

    await this.expireSubscriptions();
    await this.sendExpirationWarnings();

    this.logger.log('✅ Verificação de assinaturas concluída!');
  }

  /**
   * Expira assinaturas que já passaram da data de vencimento
   */
  private async expireSubscriptions() {
    const now = new Date();

    // Busca assinaturas ativas que já expiraram
    const expiredSubs = await this.prisma.subscription.findMany({
      where: {
        status: SubStatus.ACTIVE,
        currentPeriodEnd: {
          lte: now, // menor ou igual a agora
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        plan: {
          select: { tier: true, displayName: true },
        },
      },
    });

    this.logger.log(`📋 Encontradas ${expiredSubs.length} assinaturas expiradas`);

    for (const sub of expiredSubs) {
      try {
        // Atualiza status para CANCELED
        await this.prisma.subscription.update({
          where: { id: sub.id },
          data: { status: SubStatus.CANCELED },
        });

        this.logger.log(`❌ Assinatura ${sub.id} expirada (usuário: ${sub.user.email})`);

        // Envia email de expiração
        await this.emailService.sendExpirationNotice(
          sub.user.email,
          sub.user.name,
          sub.plan.displayName || sub.plan.tier,
          sub.currentPeriodEnd!,
        );

        // Envia push notification
        await this.pushService.sendPlanExpired(
          sub.user.id,
          sub.plan.displayName || sub.plan.tier,
        );
      } catch (error) {
        this.logger.error(`Erro ao expirar assinatura ${sub.id}:`, error);
      }
    }
  }

  /**
   * Envia avisos de expiração para assinaturas próximas do vencimento
   * Avisos em: 10, 5, 2 e 1 dia antes
   */
  private async sendExpirationWarnings() {
    const now = new Date();
    const warningDays = [10, 5, 2, 1];

    for (const days of warningDays) {
      await this.sendWarningForDays(now, days);
    }
  }

  private async sendWarningForDays(now: Date, days: number) {
    // Calcula a data alvo (daqui a X dias)
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + days);
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Busca assinaturas que expiram nessa data
    const subs = await this.prisma.subscription.findMany({
      where: {
        status: SubStatus.ACTIVE,
        currentPeriodEnd: {
          gte: targetDate,
          lt: nextDay,
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        plan: {
          select: { tier: true, displayName: true },
        },
      },
    });

    this.logger.log(`📧 Enviando ${subs.length} avisos de ${days} dias`);

    for (const sub of subs) {
      try {
        // Verifica se já enviou aviso hoje (evita duplicatas)
        const lastNotification = await this.prisma.notification.findFirst({
          where: {
            userId: sub.userId,
            type: `expiration_warning_${days}d`,
            createdAt: {
              gte: new Date(now.setHours(0, 0, 0, 0)),
            },
          },
        });

        if (lastNotification) {
          this.logger.log(`⏭️  Aviso já enviado hoje para ${sub.user.email} (${days} dias)`);
          continue;
        }

        // Envia email
        await this.emailService.sendExpirationWarning(
          sub.user.email,
          sub.user.name,
          sub.plan.displayName || sub.plan.tier,
          days,
          sub.currentPeriodEnd!,
        );

        // Envia push notification
        await this.pushService.sendExpirationWarning(
          sub.userId,
          sub.plan.displayName || sub.plan.tier,
          days,
        );

        // Registra notificação
        await this.prisma.notification.create({
          data: {
            userId: sub.userId,
            type: `expiration_warning_${days}d`,
            title: `Seu plano expira em ${days} ${days === 1 ? 'dia' : 'dias'}`,
            message: `Seu plano ${sub.plan.displayName || sub.plan.tier} expira em ${sub.currentPeriodEnd?.toLocaleDateString('pt-BR')}. Renove para continuar aproveitando os benefícios!`,
            read: false,
          },
        });

        this.logger.log(`✅ Aviso de ${days} dias enviado para ${sub.user.email}`);
      } catch (error) {
        this.logger.error(`Erro ao enviar aviso para ${sub.user.email}:`, error);
      }
    }
  }

  /**
   * Método manual para testar (pode ser chamado via endpoint)
   */
  async runManualCheck() {
    this.logger.log('🔧 Executando verificação manual...');
    await this.checkSubscriptions();
    return { success: true, message: 'Verificação executada' };
  }
}
