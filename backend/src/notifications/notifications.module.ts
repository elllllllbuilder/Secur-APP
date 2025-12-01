import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { PushService } from './push.service';
import { NotificationsController } from './notifications.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController],
  providers: [EmailService, PushService],
  exports: [EmailService, PushService],
})
export class NotificationsModule {}
