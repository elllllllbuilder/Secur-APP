import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';
import { PlanTier } from '@prisma/client';

@Controller('admin/plans')
@UseGuards(AuthGuard('jwt'))
export class AdminPlansController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async listPlans() {
    const plans = await this.prisma.plan.findMany({
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
      orderBy: { priceCents: 'asc' },
    });
    return { success: true, data: plans };
  }

  @Post()
  async createPlan(@Body() body: { tier: PlanTier; displayName: string; priceCents: number }) {
    const plan = await this.prisma.plan.create({
      data: {
        tier: body.tier,
        displayName: body.displayName,
        priceCents: body.priceCents,
      },
    });
    return { success: true, data: plan };
  }

  @Patch(':id')
  async updatePlan(@Param('id') id: string, @Body() body: any) {
    const plan = await this.prisma.plan.update({
      where: { id },
      data: {
        displayName: body.displayName,
        priceCents: body.priceCents,
      },
    });
    return { success: true, data: plan };
  }

  @Delete(':id')
  async deletePlan(@Param('id') id: string) {
    await this.prisma.plan.delete({ where: { id } });
    return { success: true };
  }
}
