import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminCategoriesController } from './admin-categories.controller';
import { AdminPlansController } from './admin-plans.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController, AdminCategoriesController, AdminPlansController],
  providers: [AdminService],
})
export class AdminModule {}
