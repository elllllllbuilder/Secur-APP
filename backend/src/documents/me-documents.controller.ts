// src/documents/me-documents.controller.ts
import {
  Controller, UseGuards, Post, Get, Delete, Param, Body, Req,
  UploadedFile, UseInterceptors, BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { PrismaService } from '../prisma/prisma.service';
import { join } from 'path';
import * as fs from 'fs/promises';

@UseGuards(AuthGuard('jwt'))
@Controller('me/documents')
export class MeDocumentsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async list(@Req() req: any) {
    const userId = req.user?.id ?? req.user?.sub;
    const docs = await this.prisma.userDocument.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
      select: { id: true, code: true, originalName: true, mime: true, url: true, verified: true },
    });
    return { success: true, data: docs };
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),                 // ⬅️ garante file.buffer
      limits: { fileSize: 20 * 1024 * 1024 },         // 20 MB (ajuste se quiser)
    }),
  )
  async upload(
    @Req() req: any,
    @Body('code') code: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const userId = req.user?.id ?? req.user?.sub;
      if (!userId) throw new BadRequestException('Unauthorized');
      if (!code) throw new BadRequestException('Campo "code" é obrigatório');
      if (!file) throw new BadRequestException('Arquivo não recebido');

      const uploadsDir = join(process.cwd(), 'uploads');
      await fs.mkdir(uploadsDir, { recursive: true });

      // nome seguro
      const safeName = (file.originalname || 'document').replace(/[^\w.\-]+/g, '_');
      const filename = `${Date.now()}_${safeName}`;
      const fullPath = join(uploadsDir, filename);

      // salva arquivo (buffer quando memoryStorage; fallback se vier path)
      const buf = file.buffer ?? (file as any).stream ?? null;
      if (file.buffer) {
        await fs.writeFile(fullPath, file.buffer);
      } else if ((file as any).path) {
        // caso você mude para diskStorage em algum momento
        const tmpPath = (file as any).path as string;
        const data = await (await import('fs/promises')).readFile(tmpPath);
        await fs.writeFile(fullPath, data);
      } else {
        throw new BadRequestException('Não foi possível ler o arquivo recebido.');
      }

      const base = process.env.PUBLIC_URL || 'http://localhost:3333';
      const url = `${base.replace(/\/+$/, '')}/uploads/${filename}`;

      const created = await this.prisma.userDocument.create({
        data: {
          userId,
          code,
          url,
          mime: file.mimetype || 'application/octet-stream',
          originalName: file.originalname || null,
        },
        select: { id: true, code: true, originalName: true, mime: true, url: true, verified: true },
      });

      return { success: true, data: created };
    } catch (e) {
      console.error('[UPLOAD 500]', e);
      // deixe o HttpExceptionFilter formatar, mas mantenha a mensagem clara
      throw e;
    }
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    await this.prisma.userDocument.delete({ where: { id } });
    return { success: true, data: { ok: true } };
  }
}
