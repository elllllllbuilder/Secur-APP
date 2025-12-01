import { Body, Controller, Post } from '@nestjs/common';

@Controller('billing/checkout')
export class BillingController {
  @Post('card')
  async card(@Body() body: any) {
    // body esperado no seu frontend:
    // { planId, categoryId?, card_number, card_holder_name, card_expiration_date, card_cvv }
    // TODO: integrar com gateway (ex.: Pagar.me)
    return {
      status: 'created',
      subscriptionId: 'sub_mock_123',
      planId: body.planId,
    };
  }

  @Post('boleto')
  async boleto(@Body() body: any) {
    // body: { planId, categoryId? }
    // TODO: criar boleto real
    return {
      boleto: {
        barcode: '34191.79001 01043.510047 91020.150008 7 12340000010000',
        url: 'https://exemplo.com/boleto/mock.pdf',
      },
    };
  }

  @Post('pix')
  async pix(@Body() body: any) {
    // body: { planId, categoryId? }
    // TODO: criar cobrança PIX e retornar payload copia-e-cola
    return {
      pix: {
        qrCodeText:
          '00020126580014BR.GOV.BCB.PIX0136chave-pix-mock-uuid5204000053039865406100.005802BR5920ASSOCIAUT MOCK6009SAO PAULO62070503***6304ABCD',
      },
    };
  }
}
