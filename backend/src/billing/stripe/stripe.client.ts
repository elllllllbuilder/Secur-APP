import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';

type CustomerInput = {
  name: string;
  email: string;
  document: string; // CPF
  phone: string;
};

@Injectable()
export class StripeClient {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeClient.name);

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('A chave secreta da Stripe (STRIPE_SECRET_KEY) não foi definida.');
    }
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-07-30.basil',
      typescript: true,
    });
  }

  private logFail(error: any, context: string) {
    this.logger.error(`[Stripe] Context: ${context} | Error: ${error.message}`);
  }

  async findOrCreateCustomer(customerData: CustomerInput): Promise<Stripe.Customer> {
    try {
      const existingCustomers = await this.stripe.customers.list({
        email: customerData.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        this.logger.log(`Cliente encontrado na Stripe: ${existingCustomers.data[0].id}`);
        return existingCustomers.data[0];
      }

      this.logger.log(`Cliente não encontrado na Stripe, criando um novo...`);
      const newCustomer = await this.stripe.customers.create({
        name: customerData.name,
        email: customerData.email,
        phone: `+55${customerData.phone}`,
        tax_id_data: [{ type: 'br_cpf', value: customerData.document }],
      });
      return newCustomer;
    } catch (e) {
      this.logFail(e, 'findOrCreateCustomer');
      throw e;
    }
  }

  async createPixPaymentIntent(params: {
    amount: number;
    customer_id: string;
    metadata?: Record<string, any>;
  }) {
    try {
      const returnUrl = `${process.env.FRONTEND_ORIGIN || 'http://localhost:3000'}/payment-success`;
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: params.amount,
        currency: 'brl',
        customer: params.customer_id,
        payment_method_types: ['pix'],
        metadata: params.metadata,
        return_url: returnUrl,
      });
      return paymentIntent;
    } catch (e) {
      this.logFail(e, 'createPixPaymentIntent');
      throw e;
    }
  }

  async createBoletoPaymentIntent(params: {
    amount: number;
    customer_id: string;
    customer_tax_id: string;
    customer_name: string;
    customer_email: string;
    // CORREÇÃO: Adicionado o parâmetro de endereço.
    customer_address: {
        line1: string;
        city: string;
        state: string;
        postal_code: string;
        country: 'BR';
    };
    metadata?: Record<string, any>;
  }) {
    try {
      const returnUrl = `${process.env.FRONTEND_ORIGIN || 'http://localhost:3000'}/payment-success`;

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: params.amount,
        currency: 'brl',
        customer: params.customer_id,
        payment_method_data: {
          type: 'boleto',
          boleto: {
            tax_id: params.customer_tax_id,
          },
          billing_details: {
            name: params.customer_name,
            email: params.customer_email,
            // CORREÇÃO: Adicionamos o objeto de endereço.
            address: params.customer_address,
          },
        },
        confirm: true,
        return_url: returnUrl,
        metadata: params.metadata,
      });
      return paymentIntent;
    } catch (e) {
      this.logFail(e, 'createBoletoPaymentIntent');
      throw e;
    }
  }

  async createCardPaymentIntent(params: {
    amount: number;
    customer_id: string;
    card_number: string;
    card_holder_name: string;
    card_expiration_date: string; // MM/YY
    card_cvv: string;
    metadata?: Record<string, any>;
  }) {
    try {
      const [exp_month, exp_year] = params.card_expiration_date.split('/');

      const paymentMethod = await this.stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: params.card_number,
          exp_month: parseInt(exp_month, 10),
          exp_year: parseInt(`20${exp_year}`, 10),
          cvc: params.card_cvv,
        },
      });

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: params.amount,
        currency: 'brl',
        customer: params.customer_id,
        payment_method: paymentMethod.id,
        confirm: true,
        off_session: true,
        metadata: params.metadata,
      });

      return paymentIntent;
    } catch (e) {
      this.logFail(e, 'createCardPaymentIntent');
      throw e;
    }
  }
}
