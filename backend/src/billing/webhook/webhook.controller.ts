import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookEvent } from '../pagarme/types';

@Controller('billing/webhook')
export class WebhookController {
  constructor(private readonly service: WebhookService) {}

  @Post()
  @HttpCode(200)
  async handle(@Body() body: WebhookEvent) {
    // Pagar.me costuma enviar payload semelhante com event + dados
    await this.service.handle(body);
    return { received: true };
  }
}
