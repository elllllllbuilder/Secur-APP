import { Controller, Get, Post, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin/support/tickets')
@UseGuards(AuthGuard('jwt'))
export class AdminSupportController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getAllTickets() {
    const tickets = await this.prisma.supportTicket.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
    return { success: true, data: tickets };
  }

  @Get(':id')
  async getTicket(@Param('id') id: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            cpf: true,
          },
        },
      },
    });
    return { success: true, data: ticket };
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    const ticket = await this.prisma.supportTicket.update({
      where: { id },
      data: { 
        status: body.status,
        resolvedAt: body.status === 'resolved' || body.status === 'closed' ? new Date() : null,
      },
      include: { user: true },
    });

    // Notifica usuário sobre mudança de status
    const statusMessages = {
      in_progress: '🔄 Sua solicitação está sendo atendida',
      resolved: '✅ Sua solicitação foi resolvida',
      closed: '📋 Sua solicitação foi fechada',
    };

    if (statusMessages[body.status as keyof typeof statusMessages]) {
      await this.prisma.notification.create({
        data: {
          userId: ticket.userId,
          type: 'support_status_changed',
          title: statusMessages[body.status as keyof typeof statusMessages],
          message: `Status da sua solicitação: ${body.status}`,
        },
      });
    }

    return { success: true, data: ticket };
  }

  @Patch(':id/priority')
  async updatePriority(@Param('id') id: string, @Body() body: { priority: string }) {
    const ticket = await this.prisma.supportTicket.update({
      where: { id },
      data: { priority: body.priority },
    });
    return { success: true, data: ticket };
  }

  @Get(':id/messages')
  async getMessages(@Param('id') ticketId: string) {
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
  async sendMessage(
    @Req() req: any,
    @Param('id') ticketId: string,
    @Body() body: { message: string },
  ) {
    const userId = req.user?.id ?? req.user?.sub;

    const message = await this.prisma.ticketMessage.create({
      data: {
        ticketId,
        userId,
        message: body.message,
        isAdmin: true,
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    // Notifica o usuário do ticket
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (ticket) {
      await this.prisma.notification.create({
        data: {
          userId: ticket.userId,
          type: 'support_message',
          title: '💬 Nova Mensagem no Suporte',
          message: `Você recebeu uma nova mensagem sobre sua solicitação.`,
        },
      });
    }

    return { success: true, data: message };
  }
}
