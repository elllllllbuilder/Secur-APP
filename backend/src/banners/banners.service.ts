// src/banners/banners.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.banner.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });
  }

  async findAllAdmin() {
    return this.prisma.banner.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async create(imageUrl: string) {
    const maxOrder = await this.prisma.banner.aggregate({
      _max: { order: true },
    });
    
    return this.prisma.banner.create({
      data: {
        imageUrl,
        order: (maxOrder._max.order || 0) + 1,
        active: true,
      },
    });
  }

  async update(id: number, data: { imageUrl?: string; active?: boolean; order?: number }) {
    return this.prisma.banner.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return this.prisma.banner.delete({
      where: { id },
    });
  }

  async reorder(bannerId: number, newOrder: number) {
    const banner = await this.prisma.banner.findUnique({ where: { id: bannerId } });
    if (!banner) throw new Error('Banner não encontrado');

    const oldOrder = banner.order;

    if (newOrder > oldOrder) {
      await this.prisma.banner.updateMany({
        where: {
          order: { gt: oldOrder, lte: newOrder },
        },
        data: { order: { decrement: 1 } },
      });
    } else if (newOrder < oldOrder) {
      await this.prisma.banner.updateMany({
        where: {
          order: { gte: newOrder, lt: oldOrder },
        },
        data: { order: { increment: 1 } },
      });
    }

    return this.prisma.banner.update({
      where: { id: bannerId },
      data: { order: newOrder },
    });
  }
}
