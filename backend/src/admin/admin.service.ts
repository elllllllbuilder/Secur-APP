import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers() {
    return this.prisma.user.findMany({
      include: {
        subscriptions: {
          include: {
            plan: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUser(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        subscriptions: {
          include: {
            plan: true,
          },
        },
        payments: true,
      },
    });
  }

  async updateUser(id: string, data: any) {
    const updateData: any = {};
    
    // Apenas campos permitidos
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.role !== undefined) updateData.role = data.role;
    
    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return { success: true, data: updated };
  }

  async deleteUser(id: string) {
    await this.prisma.user.delete({ where: { id } });
    return { success: true, message: 'Usuário deletado' };
  }

  async getAllPayments() {
    return this.prisma.payment.findMany({
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getStats() {
    const [totalUsers, activeSubscriptions, totalPayments] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.subscription.count({
        where: { status: SubStatus.ACTIVE },
      }),
      this.prisma.payment.aggregate({
        where: { status: 'approved' },
        _sum: { amountCents: true },
      }),
    ]);

    return {
      totalUsers,
      activeSubscriptions,
      totalRevenue: (totalPayments._sum.amountCents || 0) / 100,
    };
  }

  async cancelSubscription(subscriptionId: string) {
    await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: SubStatus.CANCELED },
    });

    return { success: true, message: 'Assinatura cancelada' };
  }

  async changePlan(userId: string, planId: string) {
    // Cancela assinatura atual
    await this.prisma.subscription.updateMany({
      where: { userId, status: SubStatus.ACTIVE },
      data: { status: SubStatus.CANCELED },
    });

    // Cria nova assinatura
    await this.prisma.subscription.create({
      data: {
        userId,
        planId,
        status: SubStatus.ACTIVE,
        startedAt: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return { success: true, message: 'Plano alterado' };
  }

  async notifyUser(userId: string, title: string, message: string, type?: string) {
    console.log('[NOTIFY] Enviando notificação para userId:', userId);
    console.log('[NOTIFY] Título:', title);
    console.log('[NOTIFY] Mensagem:', message);

    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type: type || 'admin_message',
        title,
        message,
      },
    });

    console.log('[NOTIFY] Notificação criada:', notification.id);

    return { success: true, data: notification };
  }
}
