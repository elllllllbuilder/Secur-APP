import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin/documents')
@UseGuards(AuthGuard('jwt'))
export class AdminDocumentsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async listDocuments() {
    return this.prisma.userDocument.findMany({
      orderBy: { uploadedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            // categoria do usuário
            category: {
              select: { title: true },
            },
            // pega o plano atual (ou o mais recente ativo)
            subscriptions: {
              where: { status: 'ACTIVE' },
              orderBy: { startedAt: 'desc' },
              take: 1,
              select: {
                plan: {
                  select: {
                    displayName: true,
                    tier: true, // fallback se displayName vier null
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  @Patch(':id/approve')
  async approveDocument(@Param('id') id: string) {
    const doc = await this.prisma.userDocument.update({
      where: { id },
      data: { verified: true },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    console.log('[APPROVE] Documento aprovado:', doc.id, 'userId:', doc.userId);

    // Cria notificação de aprovação
    const notification = await this.prisma.notification.create({
      data: {
        userId: doc.userId,
        type: 'document_approved',
        title: '✅ Documento Aprovado',
        message: `Seu documento "${doc.code}" foi aprovado com sucesso!`,
      },
    });

    console.log('[APPROVE] Notificação criada:', notification.id);

    return { success: true, data: doc };
  }

  @Patch(':id/reject')
  async rejectDocument(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    const doc = await this.prisma.userDocument.update({
      where: { id },
      data: { verified: false },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    console.log('[REJECT] Documento rejeitado:', doc.id, 'userId:', doc.userId);

    // Cria notificação de recusa
    const reason = body.reason || 'Documento não atende aos requisitos';
    const notification = await this.prisma.notification.create({
      data: {
        userId: doc.userId,
        type: 'document_rejected',
        title: '❌ Documento Recusado',
        message: `Seu documento "${doc.code}" foi recusado. Motivo: ${reason}. Por favor, reenvie um novo documento.`,
      },
    });

    console.log('[REJECT] Notificação criada:', notification.id);

    return { success: true, data: doc };
  }

  @Patch(':id')
  async updateVerified(
    @Param('id') id: string,
    @Body() body: { verified: boolean | null },
  ) {
    return this.prisma.userDocument.update({
      where: { id },
      data: { verified: body.verified ?? undefined },
    });
  }
}
