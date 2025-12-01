import { Controller, Get, Param } from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private readonly svc: PublicService) {}

  @Get('health')
  health() {
    return this.svc.health();
  }

  @Get('plans')
  getPlans() {
    return this.svc.getPlans();
  }

  @Get('categories')
  getCategories() {
    return this.svc.getCategories();
  }

  @Get('terms/:slug')
  getTerm(@Param('slug') slug: string) {
    return this.svc.getTerm(slug);
  }


@Get('activities')
getActivities() {
  return this.svc.getActivities();
}
}
