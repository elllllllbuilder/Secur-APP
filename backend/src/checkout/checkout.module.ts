import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CheckoutService } from './checkout.service';
import { CheckoutController, MercadoPagoWebhookController } from './checkout.controller';
import { MercadoPagoService } from './mercadopago.service';

@Module({
  imports: [PrismaModule, NotificationsModule],
  providers: [CheckoutService, MercadoPagoService],
  controllers: [CheckoutController, MercadoPagoWebhookController],
  exports: [MercadoPagoService],
})
export class CheckoutModule {}
