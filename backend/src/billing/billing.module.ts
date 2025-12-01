import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { StripeClient } from './stripe/stripe.client'; // Importe o novo cliente Stripe

@Module({
  controllers: [BillingController],
  providers: [
    BillingService,
    StripeClient, // Registre o StripeClient como um provedor aqui
  ],
})
export class BillingModule {}
