import { Injectable, Logger } from '@nestjs/common';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

@Injectable()
export class MercadoPagoService {
  private client: MercadoPagoConfig | null = null;
  private payment: Payment | null = null;
  private preference: Preference | null = null;
  private readonly logger = new Logger(MercadoPagoService.name);

  constructor() {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    
    if (!accessToken) {
      this.logger.warn('MERCADOPAGO_ACCESS_TOKEN não configurado. Usando modo mock.');
      return;
    }

    this.client = new MercadoPagoConfig({
      accessToken,
      options: { timeout: 5000 },
    });

    this.payment = new Payment(this.client);
    this.preference = new Preference(this.client);
  }

  /**
   * Cria um pagamento PIX
   */
  async createPixPayment(data: {
    amount: number;
    description: string;
    email: string;
    cpf: string;
    name: string;
  }) {
    if (!this.payment) {
      return this.mockPixPayment(data.amount);
    }

    try {
      // Remove caracteres não numéricos do CPF
      const cpfClean = (data.cpf || '').replace(/\D/g, '');
      
      // Valida CPF (algoritmo básico)
      const isValidCPF = (cpf: string): boolean => {
        if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
        
        let sum = 0;
        for (let i = 0; i < 9; i++) {
          sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let digit = 11 - (sum % 11);
        if (digit >= 10) digit = 0;
        if (digit !== parseInt(cpf.charAt(9))) return false;
        
        sum = 0;
        for (let i = 0; i < 10; i++) {
          sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        digit = 11 - (sum % 11);
        if (digit >= 10) digit = 0;
        if (digit !== parseInt(cpf.charAt(10))) return false;
        
        return true;
      };
      
      // Se CPF estiver vazio ou inválido, usa CPF de teste válido
      const cpfToUse = cpfClean.length === 11 && isValidCPF(cpfClean) 
        ? cpfClean 
        : '12345678909'; // CPF de teste aceito pelo Mercado Pago
      
      this.logger.log(`Criando pagamento PIX: R$ ${data.amount} para ${data.email} (CPF: ${cpfToUse === '12345678909' ? 'TESTE' : 'válido'})`);

      const response = await this.payment.create({
        body: {
          transaction_amount: data.amount,
          description: data.description,
          payment_method_id: 'pix',
          payer: {
            email: data.email,
            identification: {
              type: 'CPF',
              number: cpfToUse,
            },
            first_name: data.name || 'Cliente',
          },
        },
      });

      this.logger.log(`Pagamento PIX criado: ${response.id} - Status: ${response.status}`);

      return {
        id: response.id,
        status: response.status,
        qrCode: response.point_of_interaction?.transaction_data?.qr_code_base64,
        qrCodeText: response.point_of_interaction?.transaction_data?.qr_code,
        expiresAt: response.date_of_expiration,
      };
    } catch (error) {
      this.logger.error('Erro ao criar pagamento PIX:', error);
      throw error;
    }
  }

  /**
   * Cria um plano de assinatura recorrente
   */
  async createSubscriptionPlan(data: {
    reason: string;
    auto_recurring: {
      frequency: number; // 1 = mensal
      frequency_type: 'months' | 'days';
      transaction_amount: number;
      currency_id: string;
    };
    back_url: string;
  }) {
    if (!this.client) {
      return this.mockSubscriptionPlan();
    }

    try {
      // Mercado Pago usa a API de Preapproval para assinaturas
      const response = await fetch('https://api.mercadopago.com/preapproval_plan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      this.logger.error('Erro ao criar plano de assinatura:', error);
      throw error;
    }
  }

  /**
   * Cria uma assinatura para um cliente
   */
  async createSubscription(data: {
    preapproval_plan_id: string;
    reason: string;
    payer_email: string;
    card_token_id?: string;
    back_url: string;
  }) {
    if (!this.client) {
      return this.mockSubscription();
    }

    try {
      const response = await fetch('https://api.mercadopago.com/preapproval', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return {
        id: result.id,
        status: result.status,
        init_point: result.init_point,
        sandbox_init_point: result.sandbox_init_point,
      };
    } catch (error) {
      this.logger.error('Erro ao criar assinatura:', error);
      throw error;
    }
  }

  /**
   * Cancela uma assinatura
   */
  async cancelSubscription(subscriptionId: string) {
    if (!this.client) {
      return { status: 'cancelled' };
    }

    try {
      const response = await fetch(`https://api.mercadopago.com/preapproval/${subscriptionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      this.logger.error('Erro ao cancelar assinatura:', error);
      throw error;
    }
  }

  /**
   * Consulta status de uma assinatura
   */
  async getSubscription(subscriptionId: string) {
    if (!this.client) {
      return { status: 'authorized' };
    }

    try {
      const response = await fetch(`https://api.mercadopago.com/preapproval/${subscriptionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
      });

      const result = await response.json();
      return {
        id: result.id,
        status: result.status,
        reason: result.reason,
        payer_email: result.payer_email,
        next_payment_date: result.next_payment_date,
        auto_recurring: result.auto_recurring,
      };
    } catch (error) {
      this.logger.error('Erro ao consultar assinatura:', error);
      throw error;
    }
  }

  /**
   * Cria uma preferência de pagamento (para checkout)
   */
  async createPreference(data: {
    items: Array<{
      id?: string;
      title: string;
      quantity: number;
      unit_price: number;
    }>;
    payer: {
      email: string;
      name?: string;
    };
    back_urls?: {
      success: string;
      failure: string;
      pending: string;
    };
    notification_url?: string;
  }) {
    if (!this.preference) {
      return this.mockPreference();
    }

    try {
      // Adiciona ID aos items se não tiver
      const itemsWithId = data.items.map((item, index) => ({
        ...item,
        id: item.id || `item-${index}`,
      }));

      const response = await this.preference.create({
        body: {
          ...data,
          items: itemsWithId,
        } as any,
      });

      return {
        id: response.id,
        init_point: response.init_point,
        sandbox_init_point: response.sandbox_init_point,
      };
    } catch (error) {
      this.logger.error('Erro ao criar preferência:', error);
      throw error;
    }
  }

  /**
   * Consulta status de um pagamento
   */
  async getPayment(paymentId: string) {
    if (!this.payment) {
      return { status: 'pending' };
    }

    try {
      const response = await this.payment.get({ id: paymentId });
      return {
        id: response.id,
        status: response.status,
        status_detail: response.status_detail,
        transaction_amount: response.transaction_amount,
      };
    } catch (error) {
      this.logger.error('Erro ao consultar pagamento:', error);
      throw error;
    }
  }

  // Mock para desenvolvimento
  private mockPixPayment(amount: number) {
    return {
      id: 'mock_' + Date.now(),
      status: 'pending',
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      qrCodeText: '00020126580014br.gov.bcb.pix0136' + Math.random().toString(36).substring(7),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };
  }

  private mockPreference() {
    return {
      id: 'mock_pref_' + Date.now(),
      init_point: 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=mock',
      sandbox_init_point: 'https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=mock',
    };
  }

  private mockSubscriptionPlan() {
    return {
      id: 'mock_plan_' + Date.now(),
      status: 'active',
    };
  }

  private mockSubscription() {
    return {
      id: 'mock_sub_' + Date.now(),
      status: 'authorized',
      init_point: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_id=mock',
      sandbox_init_point: 'https://sandbox.mercadopago.com.br/subscriptions/checkout?preapproval_id=mock',
    };
  }
}
