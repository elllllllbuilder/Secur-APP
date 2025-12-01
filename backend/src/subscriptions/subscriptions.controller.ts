// src/subscriptions/subscriptions.controller.ts
import { Controller, Get, Post, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionJobsService } from './subscription-jobs.service';

@Controller('me')
@UseGuards(AuthGuard('jwt'))
export class SubscriptionsController {
  constructor(
    private readonly service: SubscriptionsService,
    private readonly jobsService: SubscriptionJobsService,
  ) {}

  @Get('subscription')
  async mySubscription(@Req() req: any) {
    const userId = req.user?.id ?? req.user?.sub;
    if (!userId) throw new UnauthorizedException();
    const data = await this.service.getMyActiveSubscription(userId);
    return { success: true, data };  // <- mantém seu wrapper
  }

  // Endpoint para testar o job manualmente (apenas para desenvolvimento)
  @Post('subscription/check-expirations')
  async checkExpirations() {
    return this.jobsService.runManualCheck();
  }
}
