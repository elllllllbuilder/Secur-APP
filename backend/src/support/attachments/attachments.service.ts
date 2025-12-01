import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type AddAttachmentInput = {
  code?: string;
  url: string;
  mime: string;
};

@Injectable()
export class AttachmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async add(userId: string, supportId: string, input: AddAttachmentInput) {
    const support = await this.prisma.supportCase.findUnique({ where: { id: supportId } });
    if (!support) throw new NotFoundException('Solicitação não encontrada.');
    if (support.userId !== userId) throw new ForbiddenException('Sem permissão.');

    const att = await this.prisma.supportAttachment.create({
      data: {
        supportCaseId: supportId,
        code: input.code ?? null,
        url: input.url,
        mime: input.mime,
      },
      select: { id: true, code: true, url: true, mime: true, uploadedAt: true },
    });

    return att;
  }
}
