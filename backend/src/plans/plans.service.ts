import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const plans = await this.prisma.plan.findMany({
      where: { active: true },
      orderBy: { priceCents: 'asc' },
      select: {
        id: true,
        tier: true,
        priceCents: true,
        currency: true,
        displayName: true,
        paymentProviderPlanId: true,
      },
    });

    return plans.map((p) => ({
      id: p.id,
      tier: p.tier,
      displayName: p.displayName ?? p.tier,
      priceCents: p.priceCents,
      currency: p.currency,
      paymentProviderPlanId: p.paymentProviderPlanId,
    }));
  }
}
