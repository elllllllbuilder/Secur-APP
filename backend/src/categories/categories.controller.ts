import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Get(':id')
  async byId(@Param('id') id: string) {
    const cat = await this.service.getById(id);
    if (!cat) throw new NotFoundException();
    return cat;
  }
}
