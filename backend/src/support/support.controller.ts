import { Controller, Get, Post, Patch, Param, Body, UseGuards, Req, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { PrismaService } from '../prisma/prisma.service';
import { join } from 'path';
import * as fs from 'fs/promises';

@Controller('support/tickets')
@UseGuards(AuthGuard('jwt'))
export class SupportController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getMyTickets(@Req() req: any) {
    const userId = req.user?.id ?? req.user?.sub;
    const tickets = await this.prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: tickets };
  }

  @Get(':id')
  async getTicket(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.id ?? req.user?.sub;
    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id, userId },
      include: { user: { select: { name: true, email: true, phone: true } } },
    });
    return { success: true, data: ticket };
  }

  @Post()
  async createTicket(@Req() req: any, @Body() body: any) {
    const userId = req.user?.id ?? req.user?.sub;
    
    const ticket = await this.prisma.supportTicket.create({
      data: {
        userId,
        type: body.type,
        title: body.title || `Solicitação de ${body.type}`,
        description: body.description,
        location: body.location,
        latitude: body.latitude,
        longitude: body.longitude,
        status: 'open',
        priority: body.priority || 'normal',
      },
    });

    console.log('[SUPPORT] Ticket criado:', ticket.id, 'userId:', userId);

    // Cria notificação para o usuário
    await this.prisma.notification.create({
      data: {
        userId,
        type: 'support_created',
        title: '✅ Solicitação Recebida',
        message: `Sua solicitação de apoio foi recebida. Nossa equipe entrará em contato em breve.`,
      },
    });

    return { success: true, data: ticket };
  }

  @Get(':id/messages')
  async getMessages(@Req() req: any, @Param('id') ticketId: string) {
    const userId = req.user?.id ?? req.user?.sub;
    
    // Verifica se o ticket pertence ao usuário
    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id: ticketId, userId },
    });

    if (!ticket) {
      return { success: false, message: 'Ticket não encontrado' };
    }

    const messages = await this.prisma.ticketMessage.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return { success: true, data: messages };
  }

  @Post(':id/messages')
  @UseInterceptors(
    FilesInterceptor('attachments', 5, {
      storage: multer.memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB por arquivo
    }),
  )
  async sendMessage(
    @Req() req: any,
    @Param('id') ticketId: string,
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const userId = req.user?.id ?? req.user?.sub;

    // Verifica se o ticket pertence ao usuário
    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id: ticketId, userId },
    });

    if (!ticket) {
      return { success: false, message: 'Ticket não encontrado' };
    }

    // Upload de anexos
    const attachments: string[] = [];
    if (files && files.length > 0) {
      const uploadsDir = join(process.cwd(), 'uploads', 'support');
      await fs.mkdir(uploadsDir, { recursive: true });

      for (const file of files) {
        const filename = `${Date.now()}_${file.originalname.replace(/[^\w.\-]+/g, '_')}`;
        const fullPath = join(uploadsDir, filename);
        await fs.writeFile(fullPath, file.buffer);

        const base = process.env.PUBLIC_URL || process.env.API_URL || 'http://localhost:3333';
        const url = `${base.replace(/\/+$/, '')}/uploads/support/${filename}`;
        attachments.push(url);
      }
    }

    const message = await this.prisma.ticketMessage.create({
      data: {
        ticketId,
        userId,
        message: body.message || null,
        attachments: attachments.length > 0 ? attachments : undefined,
        isAdmin: false,
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return { success: true, data: message };
  }
}
