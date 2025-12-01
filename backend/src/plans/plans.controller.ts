import { Controller, Get } from '@nestjs/common';
import { PlansService } from './plans.service';

@Controller('public/plans')
export class PlansController {
  constructor(private readonly service: PlansService) {}

  @Get()
  async list() {
    return this.service.list();
  }
}
