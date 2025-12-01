import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { Buffer } from 'buffer';

type CustomerInput = {
  name: string;
  email: string;
  type: 'individual';
  document: string;
  phones: {
    mobile_phone: { country_code: string; area_code: string; number: string };
  };
};

@Injectable()
export class PagarmeClient {
  private api: AxiosInstance;
  private readonly logger = new Logger(PagarmeClient.name);

  constructor() {
    const apiKey = process.env.PAGARME_API_KEY!;
    const baseURL = 'https://api.pagar.me/core/v5';
    const encodedApiKey = Buffer.from(`${apiKey}:`).toString('base64');

    this.api = axios.create({
      baseURL,
      headers: {
        'Authorization': `Basic ${encodedApiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  private logFail(e: any, context: string) {
    const status = e?.response?.status;
    const data = e?.response?.data;
    this.logger.error(`[Pagarme] Context: ${context} | Status: ${status} | Data: ${JSON.stringify(data)}`);
  }

  async findOrCreateCustomer(customerData: CustomerInput): Promise<{ id: string }> {
    try {
      const { data: searchResult } = await this.api.get('/customers', { params: { email: customerData.email } });
      if (searchResult.data && searchResult.data.length > 0) {
        this.logger.log(`Cliente encontrado na Pagar.me: ${searchResult.data[0].id}`);
        return searchResult.data[0];
      }

      this.logger.log(`Cliente não encontrado, criando um novo...`);
      const { data: newCustomer } = await this.api.post('/customers', customerData);
      return newCustomer;
    } catch (e) {
      this.logFail(e, 'findOrCreateCustomer');
      throw e;
    }
  }

  async createPixCharge(params: {
    amount: number;
    customer_id: string;
    metadata?: Record<string, any>;
  }) {
    try {
      const payload = {
        customer_id: params.customer_id,
        items: [{ amount: params.amount, description: 'Assinatura App', quantity: 1 }],
        payments: [{ payment_method: 'pix', pix: { expires_in: 3600 } }],
        metadata: params.metadata,
      };
      const { data } = await this.api.post('/orders', payload);
      const pixPayment = data.charges[0].last_transaction;
      return {
        id: data.id,
        status: data.status,
        pix_qr_code: pixPayment.qr_code,
        pix_qr_code_base64: pixPayment.qr_code_url,
        pix_expiration_date: pixPayment.expires_at,
      };
    } catch (e) {
      this.logFail(e, 'createPixCharge');
      throw e;
    }
  }

  async createBoletoCharge(params: {
    amount: number;
    customer_id: string;
    metadata?: Record<string, any>;
  }) {
    try {
        const payload = {
            customer_id: params.customer_id,
            items: [{
                amount: params.amount,
                description: 'Assinatura App',
                quantity: 1,
            }],
            payments: [{
                payment_method: 'boleto',
                boleto: {
                    instructions: 'Pagar até o vencimento',
                    due_at: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 dias para vencer
                },
            }],
            metadata: params.metadata,
        };

        const { data } = await this.api.post('/orders', payload);
        const boletoPayment = data.charges[0].last_transaction;
        return {
            id: data.id,
            status: data.status,
            boleto_url: boletoPayment.url,
            boleto_barcode: boletoPayment.barcode,
        };
    } catch (e) {
        this.logFail(e, 'createBoletoCharge');
        throw e;
    }
  }
  
  async createCardCharge(params: {
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
        const payload = {
            customer_id: params.customer_id,
            items: [{
                amount: params.amount,
                description: 'Assinatura App',
                quantity: 1,
            }],
            payments: [{
                payment_method: 'credit_card',
                credit_card: {
                    installments: 1,
                    statement_descriptor: 'APPASS',
                    card: {
                        number: params.card_number,
                        holder_name: params.card_holder_name,
                        exp_month: parseInt(exp_month, 10),
                        exp_year: parseInt(`20${exp_year}`, 10),
                        cvv: params.card_cvv,
                    }
                }
            }],
            metadata: params.metadata,
        };

        const { data } = await this.api.post('/orders', payload);
        return {
            id: data.id,
            status: data.status,
        };
    } catch (e) {
        this.logFail(e, 'createCardCharge');
        throw e;
    }
  }
}
