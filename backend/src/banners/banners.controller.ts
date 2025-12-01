// src/banners/banners.controller.ts
import { Controller, Get } from '@nestjs/common';
import { BannersService } from './banners.service';

@Controller('banners')
export class BannersController {
  constructor(private bannersService: BannersService) {}

  @Get()
  async findAll() {
    return this.bannersService.findAll();
  }
}
