// src/documents/documents.module.ts
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../auth/roles.guard';

import { DocumentsController } from './documents.controller';
import { AdminDocumentsController } from './admin-documents.controller';
import { DocumentsService } from './documents.service';

@Module({
  imports: [PrismaModule, AuthModule, MulterModule.register({})],
  controllers: [DocumentsController, AdminDocumentsController],
  providers: [DocumentsService, RolesGuard],
})
export class DocumentsModule {}
