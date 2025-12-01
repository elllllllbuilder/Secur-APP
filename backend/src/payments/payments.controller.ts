import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';
import { User } from '../common/decorators/user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('me/invoices')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Get()
  list(@User() user: any) {
    return this.payments.list(user.id);
  }

  @Get(':id')
  get(@User() user: any, @Param('id') id: string) {
    return this.payments.get(user.id, id);
  }
}
