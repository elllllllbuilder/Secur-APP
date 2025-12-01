// src/subscriptions/subscriptions.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async getMyActiveSubscription(userId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },   // <- MAIÚSCULO
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!sub) return null;

    return {
      id: sub.id,
      status: 'active', // normaliza
      startedAt: sub.startedAt,
      graceEndsAt: sub.graceEndsAt ?? null,
      currentPeriodEnd: sub.currentPeriodEnd ?? null,
      planId: sub.planId,
      plan: sub.plan
        ? {
            id: sub.plan.id,
            displayName: sub.plan.displayName ?? sub.plan.tier ?? null,
            priceCents: sub.plan.priceCents ?? null,
            tier: sub.plan.tier ?? null,
          }
        : null,
    };
  }
}
