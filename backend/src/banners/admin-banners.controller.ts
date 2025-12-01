// src/banners/admin-banners.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BannersService } from './banners.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('admin/banners')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminBannersController {
  constructor(private bannersService: BannersService) {}

  @Get()
  async findAll() {
    return this.bannersService.findAllAdmin();
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/banners',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `banner-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new BadRequestException('Apenas imagens são permitidas'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async create(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Imagem é obrigatória');
    }

    const imageUrl = `/uploads/banners/${file.filename}`;
    return this.bannersService.create(imageUrl);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: { active?: boolean; order?: number },
  ) {
    return this.bannersService.update(+id, data);
  }

  @Put(':id/reorder')
  async reorder(@Param('id') id: string, @Body('order') order: number) {
    return this.bannersService.reorder(+id, order);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.bannersService.delete(+id);
  }
}
