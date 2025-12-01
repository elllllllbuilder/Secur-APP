import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type CreateDocInput = {
  code: string;
  url: string;
  mime: string;
  originalName?: string | null;
};

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async listByUser(userId: string) {
    const docs = await this.prisma.userDocument.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        code: true,
        url: true,
        mime: true,
        originalName: true,
        verified: true,
        uploadedAt: true,
      },
    });
    return docs;
  }

  async createForUser(userId: string, input: CreateDocInput) {
    // opcional: validar se "code" existe nos RequiredDoc da categoria do usuário
    return this.prisma.userDocument.create({
      data: {
        userId,
        code: input.code,
        url: input.url,
        mime: input.mime,
        originalName: input.originalName ?? null,
        verified: false,
      },
      select: {
        id: true,
        code: true,
        url: true,
        mime: true,
        originalName: true,
        verified: true,
        uploadedAt: true,
      },
    });
  }

  async removeForUser(userId: string, docId: string) {
    const doc = await this.prisma.userDocument.findUnique({ where: { id: docId } });
    if (!doc) throw new NotFoundException('Documento não encontrado.');
    if (doc.userId !== userId) throw new ForbiddenException('Sem permissão para remover este documento.');

    await this.prisma.userDocument.delete({ where: { id: docId } });
    return { removed: true };
  }
}
