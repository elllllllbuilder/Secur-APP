import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin/categories')
@UseGuards(AuthGuard('jwt'))
export class AdminCategoriesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async listCategories() {
    const categories = await this.prisma.category.findMany({
      include: {
        requiredDocs: true,
        _count: {
          select: { users: true },
        },
      },
      orderBy: { title: 'asc' },
    });
    return { success: true, data: categories };
  }

  @Post()
  async createCategory(@Body() body: { title: string; slug: string; description: string }) {
    const category = await this.prisma.category.create({
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
      },
    });
    return { success: true, data: category };
  }

  @Patch(':id')
  async updateCategory(@Param('id') id: string, @Body() body: any) {
    const category = await this.prisma.category.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
      },
    });
    return { success: true, data: category };
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    await this.prisma.category.delete({ where: { id } });
    return { success: true };
  }

  @Post(':id/required-docs')
  async addRequiredDoc(
    @Param('id') categoryId: string,
    @Body() body: { code: string; label: string; isOptional: boolean },
  ) {
    const doc = await this.prisma.requiredDoc.create({
      data: {
        categoryId,
        code: body.code,
        label: body.label,
        isOptional: body.isOptional || false,
      },
    });
    return { success: true, data: doc };
  }

  @Delete('required-docs/:id')
  async deleteRequiredDoc(@Param('id') id: string) {
    await this.prisma.requiredDoc.delete({ where: { id } });
    return { success: true };
  }
}
