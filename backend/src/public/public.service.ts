import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '../config/config.service';

@Injectable()
export class PublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cfg: ConfigService,
  ) {}

  async health() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      return {
        status: 'degraded',
        db: 'down',
        nodeEnv: this.cfg.get<string>('nodeEnv'),
        time: new Date().toISOString(),
      };
    }
    return {
      status: 'ok',
      db: 'up',
      nodeEnv: this.cfg.get<string>('nodeEnv'),
      time: new Date().toISOString(),
    };
  }

  async getPlans() {
    const plans = await this.prisma.plan.findMany({
      where: { active: true },
      orderBy: { priceCents: 'asc' },
      select: {
        id: true,
        tier: true,
        displayName: true,
        priceCents: true,
        currency: true,
        active: true,
      },
    });
    return plans;
  }

  async getCategories() {
    const cats = await this.prisma.category.findMany({
      orderBy: { title: 'asc' },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        requiredDocs: {
          orderBy: { code: 'asc' },
          select: { id: true, code: true, label: true, isOptional: true },
        },
      },
    });
    return cats;
  }

  async getTerm(slug: string) {
    const term = await this.prisma.term.findUnique({
      where: { slug },
      select: { id: true, slug: true, title: true, contentMd: true, active: true, updatedAt: true },
    });
    return term;
  }

async getActivities() {
  const cats = await this.prisma.category.findMany({
    orderBy: { title: 'asc' },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
    },
  });
  return cats;
}

}
