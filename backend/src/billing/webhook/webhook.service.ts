import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WebhookService {
  private logger = new Logger(WebhookService.name);

  constructor(private prisma: PrismaService) {}

  async handle(payload: any) {
    try {
      const providerId = String(payload.id || payload.transaction?.id || '');
      const status =
        payload.current_status || payload.status || payload.transaction?.status || 'pending';

      const payment = await this.prisma.payment.findFirst({ where: { providerId } });
      if (!payment) return;

      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status }
      });

      // regra simples: se pagou, deixa a assinatura ACTIVE
      if (status === 'paid' || status === 'authorized') {
        if (payment.subscriptionId) {
          await this.prisma.subscription.update({
            where: { id: payment.subscriptionId },
            data: { status: 'ACTIVE' }
          });
        }
      }
    } catch (e: any) {
      this.logger.error('Erro processando webhook Pagar.me', e?.message || e);
    }
  }
}
