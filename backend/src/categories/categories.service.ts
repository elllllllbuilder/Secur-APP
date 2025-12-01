import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async getById(id: string) {
    const cat = await this.prisma.category.findUnique({
      where: { id },
      include: { requiredDocs: true },
    });
    if (!cat) return null;

    return {
      id: cat.id,
      slug: cat.slug,
      title: cat.title,
      description: cat.description,
      requiredDocs: cat.requiredDocs.map((d) => ({
        id: d.id,
        code: d.code,
        label: d.label,
        isOptional: d.isOptional,
        // se no futuro você adicionar colunas:
        mimetypes: (d as any).mimetypes ?? undefined,
        maxSizeMb: (d as any).maxSizeMb ?? undefined,
      })),
    };
  }
}
