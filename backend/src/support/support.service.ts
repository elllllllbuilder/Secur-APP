// src/support/support.service.ts
import {
  Injectable, BadRequestException, NotFoundException, InternalServerErrorException,
} from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupportDto } from './dtos/create-support.dto';

type AddAttachmentInput = {
  code: string;
  mime: string;
  originalName?: string | null;
  buffer?: Buffer | null;
  path?: string | null;
};

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async listByUser(userId: string) {
    return this.prisma.supportCase.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { attachments: true, approval: true },
    });
  }

  async getOne(userId: string, id: string) {
    const sup = await this.prisma.supportCase.findFirst({
      where: { id, userId },
      include: { attachments: true, approval: true },
    });
    if (!sup) throw new NotFoundException('Suporte não encontrado');
    return sup;
  }

  async create(userId: string, dto: CreateSupportDto) {
    return this.prisma.supportCase.create({
      data: {
        userId,
        type: dto.type,
        description: dto.description?.trim() || null,
      },
      include: { attachments: true, approval: true },
    });
  }

  async addAttachment(userId: string, supportId: string, input: AddAttachmentInput) {
    const sup = await this.prisma.supportCase.findFirst({
      where: { id: supportId, userId },
      select: { id: true },
    });
    if (!sup) throw new NotFoundException('Suporte não encontrado');

    let buf = input.buffer || null;
    if (!buf?.length && input.path) {
      try {
        buf = await fs.readFile(input.path);
      } catch (e) {
        console.error('[ATT][ERR] readFile', e);
      }
    }
    if (!buf?.length) throw new BadRequestException('Arquivo vazio');

    const dir = path.resolve('uploads', 'support');
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (e) {
      console.error('[ATT][ERR] mkdir', dir, e);
      throw new InternalServerErrorException('Falha ao preparar diretório de upload');
    }

    const ext = (input.mime?.split('/')?.[1] || 'bin').toLowerCase();
    const fileName = `${supportId}-${Date.now()}.${ext}`;
    const abs = path.join(dir, fileName);

    try {
      await fs.writeFile(abs, buf);
    } catch (e) {
      console.error('[ATT][ERR] writeFile', abs, e);
      throw new InternalServerErrorException('Falha ao salvar arquivo');
    }

    const url = `/uploads/support/${fileName}`;

    try {
      const att = await this.prisma.supportAttachment.create({
        data: {
          code: input.code || 'ANEXO',
          url,
          mime: input.mime,
          supportCase: { connect: { id: supportId } },
        },
      });
      return att;
    } catch (e) {
      console.error('[ATT][ERR] prisma.create supportAttachment', e);
      throw new InternalServerErrorException('Falha ao registrar anexo');
    }
  }
}
