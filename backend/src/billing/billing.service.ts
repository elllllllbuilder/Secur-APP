import { BadRequestException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StripeClient } from './stripe/stripe.client';

type CheckoutInput =
  | ({ method: 'pix' } & { planId: string; categoryId?: string })
  | ({ method: 'boleto' } & { planId: string; categoryId?: string })
  | ({
      method: 'card';
      planId: string;
      categoryId?: string;
      card_number: string;
      card_holder_name: string;
      card_expiration_date: string; // MM/YY
      card_cvv: string;
    });

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeClient,
  ) {}

  private onlyDigits(v?: string | null) {
    return (v || '').replace(/\D+/g, '');
  }

  async checkout(userId: string, dto: CheckoutInput) {
    let subId: string | null = null;

    try {
      const plan = await this.prisma.plan.findUnique({ where: { id: dto.planId } });
      if (!plan || !plan.active) throw new NotFoundException('Plano inválido');

      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('Usuário não encontrado');
      if (!user.cpf) throw new BadRequestException('Usuário sem CPF cadastrado');
      if (!user.phone) throw new BadRequestException('Usuário sem telefone cadastrado. O telefone é obrigatório para o pagamento.');

      // CORREÇÃO: Adicionada validação para o endereço completo do usuário.
      // Assumindo que seu model User tem os campos: street, number, city, state, zipCode
      if (dto.method === 'boleto' && (!user.street || !user.city || !user.state || !user.zipCode)) {
        throw new BadRequestException('O endereço completo do usuário (rua, cidade, estado e CEP) é obrigatório para gerar o boleto.');
      }

      const amount = plan.priceCents;
      const cpf = this.onlyDigits(user.cpf);
      const phoneDigits = this.onlyDigits(user.phone);

      const customerData = {
        name: user.name || 'Cliente',
        email: user.email,
        document: cpf,
        phone: phoneDigits,
      };

      const stripeCustomer = await this.stripe.findOrCreateCustomer(customerData);
      const metadata = { userId: user.id, planId: plan.id, source: 'app' };

      const sub = await this.prisma.subscription.create({
        data: {
          userId: user.id,
          planId: plan.id,
          status: 'ACTIVE',
          provider: 'stripe',
          startedAt: new Date(),
          currentPeriodEnd: null,
          providerSubId: null,
        },
      });
      subId = sub.id;

      if (dto.method === 'pix') {
        const paymentIntent = await this.stripe.createPixPaymentIntent({
          amount,
          customer_id: stripeCustomer.id,
          metadata,
        });

        const payment = await this.prisma.payment.create({
          data: {
            userId: user.id,
            subscriptionId: sub.id,
            method: 'pix',
            provider: 'stripe',
            providerId: paymentIntent.id,
            status: paymentIntent.status,
            amountCents: amount,
            qrCode: paymentIntent.next_action?.pix_display_qr_code?.image_url_png,
            qrCodeText: paymentIntent.next_action?.pix_display_qr_code?.data,
          },
        });

        return {
          subscriptionId: sub.id,
          paymentId: payment.id,
          pix: {
            qrCodeUrl: payment.qrCode,
            qrCodeText: payment.qrCodeText,
            expiresAt: null, 
          },
        };
      }

      if (dto.method === 'boleto') {
        const paymentIntent = await this.stripe.createBoletoPaymentIntent({
          amount,
          customer_id: stripeCustomer.id,
          customer_tax_id: cpf,
          customer_name: user.name || 'Cliente',
          customer_email: user.email,
          // CORREÇÃO: Passamos o objeto de endereço completo.
          customer_address: {
            line1: `${user.street}, ${user.number || 'S/N'}`,
            city: user.city!,
            state: user.state!,
            postal_code: this.onlyDigits(user.zipCode!),
            country: 'BR',
          },
          metadata,
        });
        
        this.logger.debug('[Stripe Boleto Response]', JSON.stringify(paymentIntent, null, 2));

        const payment = await this.prisma.payment.create({
          data: {
            userId: user.id,
            subscriptionId: sub.id,
            method: 'boleto',
            provider: 'stripe',
            providerId: paymentIntent.id,
            status: paymentIntent.status,
            amountCents: amount,
            boletoUrl: paymentIntent.next_action?.boleto_display_details?.pdf,
            barcode: paymentIntent.next_action?.boleto_display_details?.number,
          },
        });

        return {
          subscriptionId: sub.id,
          paymentId: payment.id,
          boleto: {
            url: payment.boletoUrl,
            barcode: payment.barcode,
          },
        };
      }
      
      if (dto.method === 'card') {
        const paymentIntent = await this.stripe.createCardPaymentIntent({
          amount,
          customer_id: stripeCustomer.id,
          metadata,
          card_number: dto.card_number,
          card_holder_name: dto.card_holder_name,
          card_expiration_date: dto.card_expiration_date,
          card_cvv: dto.card_cvv,
        });

        const payment = await this.prisma.payment.create({
          data: {
            userId: user.id,
            subscriptionId: sub.id,
            method: 'credit_card',
            provider: 'stripe',
            providerId: paymentIntent.id,
            status: paymentIntent.status,
            amountCents: amount,
          },
        });

        return {
          subscriptionId: sub.id,
          paymentId: payment.id,
          status: payment.status,
        };
      }

      throw new BadRequestException('Método de pagamento inválido.');

    } catch (e: any) {
      this.logger.error(`Falha geral no checkout para o usuário ${userId}`, e.stack);
      if (subId) {
        await this.prisma.subscription.delete({ where: { id: subId } }).catch(err => {
          this.logger.error(`Falha CRÍTICA ao reverter a assinatura ${subId}`, err.stack);
        });
      }
      const payload = e?.response?.data?.error ?? { message: 'Erro interno ao processar a solicitação.' };
      throw new BadRequestException(payload);
    }
  }

  async meSubscription(userId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { plan: true },
    });
    if (!sub) return null;
    return {
      id: sub.id,
      status: sub.status,
      startedAt: sub.startedAt,
      currentPeriodEnd: sub.currentPeriodEnd,
      plan: {
        id: sub.plan.id,
        tier: sub.plan.tier,
        priceCents: sub.plan.priceCents,
        currency: sub.plan.currency,
      },
    };
  }
}
