import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../common/decorators/user.decorator';
import { CheckoutService } from './checkout.service';

@UseGuards(AuthGuard('jwt'))
@Controller('me')
export class CheckoutController {
  constructor(private readonly svc: CheckoutService) {}

  @Post('associate')
  associate(@User() user: any, @Body() body: { activitySlug: string; planId: string }) {
    return this.svc.associate(user.id, body.activitySlug, body.planId);
  }

  @Post('checkout/pix')
  pix(@User() user: any, @Body() body: { subscriptionId: string }) {
    return this.svc.pix(user.id, body.subscriptionId);
  }

  @Post('subscription/recurring')
  createRecurring(@User() user: any, @Body() body: { planId: string }) {
    return this.svc.createRecurringSubscription(user.id, body.planId);
  }

  @Post('subscription/cancel')
  cancelRecurring(@User() user: any, @Body() body: { subscriptionId: string }) {
    return this.svc.cancelRecurringSubscription(user.id, body.subscriptionId);
  }

  // APENAS PARA TESTES - Simular aprovação de pagamento
  @Post('payment/approve-test')
  async approvePaymentTest(@User() user: any, @Body() body: { paymentId: string }) {
    return this.svc.updatePaymentStatus(body.paymentId, 'approved');
  }
}

// Webhook público (sem autenticação)
import { Controller as PublicController, Post as PublicPost, Body as PublicBody } from '@nestjs/common';

@PublicController('webhooks/mercadopago')
export class MercadoPagoWebhookController {
  constructor(private readonly svc: CheckoutService) {}

  @PublicPost()
  async webhook(@PublicBody() body: any) {
    console.log('[MP Webhook] Recebido:', JSON.stringify(body, null, 2));
    
    // Mercado Pago envia diferentes tipos de notificações
    if (body.type === 'payment' && body.data?.id) {
      try {
        const paymentId = body.data.id;
        console.log('[MP Webhook] Processando pagamento:', paymentId);
        
        // Busca o status real do pagamento no Mercado Pago
        await this.svc.processPaymentWebhook(paymentId.toString());
        
        console.log('[MP Webhook] Pagamento processado com sucesso');
      } catch (error) {
        console.error('[MP Webhook] Erro ao processar pagamento:', error);
      }
    } else if (body.type === 'subscription' && body.data?.id) {
      try {
        const subscriptionId = body.data.id;
        console.log('[MP Webhook] Processando assinatura:', subscriptionId);
        
        // Processa webhook de assinatura (renovação, cancelamento, etc)
        await this.svc.processSubscriptionWebhook(subscriptionId.toString());
        
        console.log('[MP Webhook] Assinatura processada com sucesso');
      } catch (error) {
        console.error('[MP Webhook] Erro ao processar assinatura:', error);
      }
    }

    return { success: true };
  }
}
