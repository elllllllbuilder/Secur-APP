import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubStatus } from '@prisma/client';
import { MercadoPagoService } from './mercadopago.service';
import { EmailService } from '../notifications/email.service';
import { PushService } from '../notifications/push.service';

@Injectable()
export class CheckoutService {
  constructor(
    private prisma: PrismaService,
    private mercadoPago: MercadoPagoService,
    private emailService: EmailService,
    private pushService: PushService,
  ) {}

  async associate(userId: string, activitySlug: string, planId: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.active) throw new BadRequestException('Plano inválido');

    // Atualiza categoryId do usuário se existir uma Category com esse slug (opcional)
    if (activitySlug) {
      const cat = await this.prisma.category.findUnique({ where: { slug: activitySlug } });
      if (cat) {
        await this.prisma.user.update({ where: { id: userId }, data: { categoryId: cat.id } });
      }
    }

    // Cria subscription com status INCOMPLETE (aguardando pagamento)
    const sub = await this.prisma.subscription.create({
      data: { 
        userId, 
        planId, 
        status: SubStatus.INCOMPLETE, // ❌ NÃO ATIVA ATÉ PAGAR
      },
    });

    return { subscriptionId: sub.id, status: sub.status };
  }

  async pix(userId: string, subscriptionId: string) {
    const sub = await this.prisma.subscription.findFirst({ 
      where: { id: subscriptionId, userId },
      include: { plan: true },
    });
    if (!sub) throw new BadRequestException('Assinatura não encontrada');

    const user = await this.prisma.user.findUnique({ 
      where: { id: userId },
      select: { id: true, name: true, email: true, cpf: true },
    });
    if (!user) throw new BadRequestException('Usuário não encontrado');

    const plan = sub.plan;
    const amountReais = plan.priceCents / 100;

    console.log('[CHECKOUT] Criando PIX para usuário:', {
      userId: user.id,
      email: user.email,
      cpf: user.cpf,
      hasCpf: !!user.cpf,
    });

    // Cria pagamento no Mercado Pago
    const mpPayment = await this.mercadoPago.createPixPayment({
      amount: amountReais,
      description: `Plano ${plan.tier} - Secur APP`,
      email: user.email,
      cpf: user.cpf || '',
      name: user.name,
    });

    // Salva no banco
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        subscriptionId,
        method: 'PIX',
        provider: 'mercadopago',
        providerId: mpPayment.id?.toString(),
        status: mpPayment.status || 'pending',
        amountCents: plan.priceCents,
        qrCode: mpPayment.qrCode,
        qrCodeText: mpPayment.qrCodeText,
      },
    });

    return {
      invoiceId: payment.id,
      amountCents: payment.amountCents,
      pixQr: payment.qrCode,
      pixCopyPaste: payment.qrCodeText,
      expiresAt: mpPayment.expiresAt,
    };
  }

  /**
   * Cria assinatura recorrente mensal
   */
  async createRecurringSubscription(userId: string, planId: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.active) throw new BadRequestException('Plano inválido');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('Usuário não encontrado');

    const amountReais = plan.priceCents / 100;

    // Cria plano no Mercado Pago (se ainda não existir)
    if (!plan.paymentProviderPlanId) {
      const mpPlan = await this.mercadoPago.createSubscriptionPlan({
        reason: `Plano ${plan.tier} - Secur APP`,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: amountReais,
          currency_id: 'BRL',
        },
        back_url: process.env.FRONTEND_URL || 'https://app.secur.com.br',
      });

      // Salva o ID do plano no MP
      await this.prisma.plan.update({
        where: { id: planId },
        data: { paymentProviderPlanId: mpPlan.id },
      });
    }

    // Cria assinatura no Mercado Pago
    const mpSubscription = await this.mercadoPago.createSubscription({
      preapproval_plan_id: plan.paymentProviderPlanId!,
      reason: `Assinatura ${plan.tier} - ${user.name}`,
      payer_email: user.email,
      back_url: process.env.FRONTEND_URL || 'https://app.secur.com.br',
    });

    // Cria subscription no banco com status INCOMPLETE (aguardando pagamento)
    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        planId,
        status: SubStatus.INCOMPLETE, // ❌ NÃO ATIVA ATÉ O WEBHOOK CONFIRMAR
        provider: 'mercadopago',
        providerSubId: mpSubscription.id,
      },
    });

    return {
      subscriptionId: subscription.id,
      checkoutUrl: mpSubscription.init_point,
      status: mpSubscription.status,
    };
  }

  /**
   * Cancela assinatura recorrente
   */
  async cancelRecurringSubscription(userId: string, subscriptionId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { id: subscriptionId, userId },
    });
    if (!sub) throw new BadRequestException('Assinatura não encontrada');

    if (sub.providerSubId) {
      // Cancela no Mercado Pago
      await this.mercadoPago.cancelSubscription(sub.providerSubId);
    }

    // Atualiza no banco
    await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: SubStatus.CANCELED },
    });

    return { success: true, message: 'Assinatura cancelada' };
  }

  /**
   * Processa webhook de pagamento (busca status real no MP)
   */
  async processPaymentWebhook(paymentId: string) {
    try {
      // Busca o pagamento no Mercado Pago para obter o status real
      const mpPayment = await this.mercadoPago.getPayment(paymentId);
      
      console.log('[WEBHOOK] Status do pagamento no MP:', {
        id: mpPayment.id,
        status: mpPayment.status,
        status_detail: mpPayment.status_detail,
      });

      // Atualiza no banco com o status real
      if (mpPayment.status) {
        await this.updatePaymentStatus(paymentId, mpPayment.status);
      } else {
        console.log('[WEBHOOK] Status do pagamento é undefined, ignorando');
      }
    } catch (error) {
      console.error('[WEBHOOK] Erro ao buscar pagamento no MP:', error);
      throw error;
    }
  }

  /**
   * Processa webhook de assinatura recorrente
   */
  async processSubscriptionWebhook(mpSubscriptionId: string) {
    try {
      // Busca a assinatura no Mercado Pago
      const mpSub = await this.mercadoPago.getSubscription(mpSubscriptionId);
      
      console.log('[WEBHOOK] Status da assinatura no MP:', {
        id: mpSub.id,
        status: mpSub.status,
      });

      // Busca no banco
      const subscription = await this.prisma.subscription.findFirst({
        where: { providerSubId: mpSubscriptionId },
      });

      if (!subscription) {
        console.log('[WEBHOOK] Assinatura não encontrada no banco:', mpSubscriptionId);
        return;
      }

      // Atualiza status baseado no MP
      let newStatus: SubStatus;
      switch (mpSub.status) {
        case 'authorized':
        case 'active':
          newStatus = SubStatus.ACTIVE;
          break;
        case 'paused':
        case 'cancelled':
          newStatus = SubStatus.CANCELED;
          break;
        case 'pending':
          newStatus = SubStatus.INCOMPLETE;
          break;
        default:
          console.log('[WEBHOOK] Status desconhecido:', mpSub.status);
          return;
      }

      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: newStatus },
      });

      console.log('[WEBHOOK] Assinatura atualizada:', {
        id: subscription.id,
        oldStatus: subscription.status,
        newStatus,
      });
    } catch (error) {
      console.error('[WEBHOOK] Erro ao processar assinatura:', error);
      throw error;
    }
  }

  /**
   * Atualiza status do pagamento (chamado pelo webhook)
   */
  async updatePaymentStatus(paymentId: string, status: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { providerId: paymentId },
      include: { subscription: true },
    });

    if (!payment) {
      console.log('[WEBHOOK] Pagamento não encontrado:', paymentId);
      return;
    }

    console.log('[WEBHOOK] Atualizando pagamento:', {
      paymentId,
      oldStatus: payment.status,
      newStatus: status,
    });

    // Atualiza status do pagamento
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status },
    });

    // Se pagamento foi aprovado, ativa a subscription
    if (status === 'approved' && payment.subscription) {
      console.log('[WEBHOOK] Ativando subscription:', payment.subscription.id);
      
      const expirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // +30 dias
      
      const updatedSub = await this.prisma.subscription.update({
        where: { id: payment.subscription.id },
        data: { 
          status: SubStatus.ACTIVE,
          startedAt: new Date(),
          currentPeriodEnd: expirationDate,
        },
        include: {
          user: {
            select: { name: true, email: true },
          },
          plan: {
            select: { tier: true, displayName: true, priceCents: true },
          },
        },
      });

      // Envia email de confirmação
      try {
        await this.emailService.sendPaymentConfirmation(
          updatedSub.user.email,
          updatedSub.user.name,
          updatedSub.plan.displayName || updatedSub.plan.tier,
          updatedSub.plan.priceCents,
          expirationDate,
        );
      } catch (error) {
        console.error('[WEBHOOK] Erro ao enviar email de confirmação:', error);
      }

      // Envia push notification
      try {
        await this.pushService.sendPaymentApproved(
          updatedSub.userId,
          updatedSub.plan.displayName || updatedSub.plan.tier,
        );
      } catch (error) {
        console.error('[WEBHOOK] Erro ao enviar push notification:', error);
      }
    }

    return { success: true };
  }
}
