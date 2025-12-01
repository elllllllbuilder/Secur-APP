import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { AttachmentsService } from './attachments.service';
import { User } from '../../common/decorators/user.decorator';
import { StorageService } from '../../documents/storage/storage.service';
import { AttachDto } from '../dtos/attach.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('support/:id/attachments')
export class AttachmentsController {
  constructor(
    private readonly attachments: AttachmentsService,
    private readonly storage: StorageService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async attach(
    @Param('id') supportId: string,
    @UploadedFile() file?: Express.Multer.File,
    @Body() dto?: AttachDto,
    @User() user?: { userId: string },
  ) {
    if (!user) throw new BadRequestException('Usuário inválido.');
    if (!file) throw new BadRequestException('Arquivo é obrigatório.');

    return this.attachments.add(user.userId, supportId, {
      code: dto?.code,
      url: this.storage.publicUrlFor(file.filename),
      mime: file.mimetype,
    });
  }
}
