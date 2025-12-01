import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DocumentsModule } from './documents/documents.module';
import { SupportModule } from './support/support.module';
import { PublicModule } from './public/public.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CheckoutModule } from './checkout/checkout.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { CategoriesModule } from './categories/categories.module';
import { GasStationsModule } from './gas-stations/gas-stations.module';
import { AdminModule } from './admin/admin.module';
import { BannersModule } from './banners/banners.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(), // Habilita cron jobs
    PrismaModule,
    AuthModule,
    UsersModule,
    DocumentsModule,
    SupportModule,
    PublicModule,
    PaymentsModule,
    SubscriptionsModule,
    CategoriesModule,
    NotificationsModule,
    CheckoutModule,
    GasStationsModule,
    AdminModule,
    BannersModule,
    
  ],
})
export class AppModule {}
