// src/documents/documents.controller.ts
import {
  Controller,
  UseGuards,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { PrismaService } from '../prisma/prisma.service';
import { join } from 'path';
import * as fs from 'fs/promises';

@Controller('me/documents')
export class DocumentsController {
  constructor(private prisma: PrismaService) {}

  // Health check endpoint (sem autenticação)
  @Get('health')
  async health() {
    return { 
      success: true, 
      message: 'Documents API is running',
      timestamp: new Date().toISOString()
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async list(@Req() req: any) {
    const userId = req.user?.id ?? req.user?.sub;
    const docs = await this.prisma.userDocument.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        code: true,
        originalName: true,
        mime: true,
        url: true,
        verified: true,
      },
    });
    return { success: true, data: docs };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { 
        fileSize: 20 * 1024 * 1024,  // 20 MB
        files: 1
      },
      fileFilter: (req, file, cb) => {
        // Aceita imagens, PDFs e documentos comuns
        const allowedMimes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/heic',
          'image/webp',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          console.log('[UPLOAD] Tipo de arquivo rejeitado:', file.mimetype);
          cb(new BadRequestException(`Tipo de arquivo não permitido: ${file.mimetype}`), false);
        }
      }
    }),
  )
  async upload(
    @Req() req: any,
    @Body('code') code: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const startTime = Date.now();
    console.log('[UPLOAD] Iniciando upload...');
    
    try {
      const userId = req.user?.id ?? req.user?.sub;
      
      // Validações
      if (!userId) {
        console.log('[UPLOAD] Erro: userId não encontrado');
        throw new BadRequestException('Usuário não autenticado');
      }
      
      if (!code) {
        console.log('[UPLOAD] Erro: code não fornecido');
        throw new BadRequestException('Campo "code" é obrigatório');
      }
      
      if (!file) {
        console.log('[UPLOAD] Erro: arquivo não recebido');
        throw new BadRequestException('Arquivo não recebido. Verifique se o campo "file" está correto.');
      }

      if (!file.buffer || file.buffer.length === 0) {
        console.log('[UPLOAD] Erro: buffer vazio');
        throw new BadRequestException('Arquivo vazio ou corrompido');
      }

      console.log('[UPLOAD] userId:', userId);
      console.log('[UPLOAD] code:', code);
      console.log('[UPLOAD] filename:', file.originalname);
      console.log('[UPLOAD] mimetype:', file.mimetype);
      console.log('[UPLOAD] size:', (file.size / 1024).toFixed(2), 'KB');

      // Cria diretório de uploads
      const uploadsDir = join(process.cwd(), 'uploads');
      await fs.mkdir(uploadsDir, { recursive: true });

      // Nome seguro do arquivo
      const safeName = (file.originalname || 'document')
        .replace(/[^\w.\-]+/g, '_')
        .substring(0, 100); // Limita tamanho do nome
      
      const filename = `${userId}_${Date.now()}_${safeName}`;
      const fullPath = join(uploadsDir, filename);

      // Salva arquivo
      await fs.writeFile(fullPath, file.buffer);
      console.log('[UPLOAD] Arquivo salvo em:', fullPath);

      // URL pública
      const base = process.env.PUBLIC_URL || process.env.API_URL || 'http://localhost:3333';
      const url = `${base.replace(/\/+$/, '')}/uploads/${filename}`;

      // Salva no banco
      const created = await this.prisma.userDocument.create({
        data: {
          userId,
          code,
          url,
          mime: file.mimetype || 'application/octet-stream',
          originalName: file.originalname || null,
        },
        select: {
          id: true,
          code: true,
          originalName: true,
          mime: true,
          url: true,
          verified: true,
        },
      });

      const duration = Date.now() - startTime;
      console.log('[UPLOAD] ✅ Sucesso! Tempo:', duration, 'ms');
      console.log('[UPLOAD] Documento ID:', created.id);

      return { success: true, data: created };
    } catch (e: any) {
      const duration = Date.now() - startTime;
      console.error('[UPLOAD] ❌ Erro após', duration, 'ms');
      console.error('[UPLOAD] Erro:', e?.message || e);
      console.error('[UPLOAD] Stack:', e?.stack);
      throw e;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    await this.prisma.userDocument.delete({ where: { id } });
    return { success: true, data: { ok: true } };
  }
}
