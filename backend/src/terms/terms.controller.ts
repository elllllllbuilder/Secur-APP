import { Controller, Get, Param } from '@nestjs/common';
import { TermsService } from './terms.service';

@Controller('public/terms')
export class TermsController {
  constructor(private readonly service: TermsService) {}

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.service.getBySlug(slug);
  }


@Get()
async list() {
  return this.service.listAll();
}
}
