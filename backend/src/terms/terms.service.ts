import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TermsService {
  constructor(private readonly prisma: PrismaService) {}

  async getBySlug(slug: string) {
    const term = await this.prisma.term.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        contentMd: true,
        active: true,
        updatedAt: true,
      },
    });

    if (!term || !term.active) {
      throw new NotFoundException('Documento não encontrado.');
    }

    return term;
  }


async listAll() {
  return this.prisma.term.findMany({
    where: { active: true },
    select: { id: true, slug: true, title: true, updatedAt: true },
    orderBy: { title: 'asc' },
  });
}
}
