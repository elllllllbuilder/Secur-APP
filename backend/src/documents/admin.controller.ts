// src/documents/admin.controller.ts
import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Prisma } from '@prisma/client';

import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin/documents')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin', 'reviewer')
export class AdminDocumentsController {
  constructor(private prisma: PrismaService) {}

  /**
   * Lista documentos com filtros:
   * - verified: 'true' | 'false' (opcional)
   * - q: busca em code / originalName (opcional)
   */
  @Get()
  async list(
    @Query('verified') verified?: string,
    @Query('q') q?: string,
  ) {
    const where: Prisma.UserDocumentWhereInput = {};

    if (verified === 'true') where.verified = true;
    if (verified === 'false') where.verified = false;

    if (q && q.trim()) {
      where.OR = [
        { code: { contains: q, mode: 'insensitive' } },
        { originalName: { contains: q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.userDocument.findMany({
      where,
      // se não existe createdAt, ordene por id (ou troque por 'uploadedAt' se seu schema tiver)
      orderBy: { id: 'desc' },
      take: 100,
    });
  }

  /**
   * Aprova / reprova um documento
   * Body: { verified: boolean }
   */
  @Patch(':id/review')
  async review(
    @Param('id') id: string,
    @Body() body: { verified: boolean },
  ) {
    return this.prisma.userDocument.update({
      where: { id },
      data: {
        verified: !!body.verified,
      },
    });
  }

  @Patch(':id')
async updateVerified(
  @Param('id') id: string,
  @Body() body: { verified: boolean }
) {
  return this.prisma.userDocument.update({
    where: { id },
    data: { verified: body.verified },
  });
}

}


