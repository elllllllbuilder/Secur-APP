import { Body, Controller, Post, Delete, Get, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PushService } from './push.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly pushService: PushService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Busca notificações do usuário
   */
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMyNotifications(@Req() req: any) {
    const userId = req.user?.id ?? req.user?.sub;
    console.log('[GET NOTIFICATIONS] userId:', userId);
    
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50, // últimas 50 notificações
    });
    
    console.log('[GET NOTIFICATIONS] Encontradas:', notifications.length, 'notificações');
    if (notifications.length > 0) {
      console.log('[GET NOTIFICATIONS] Primeira notificação:', notifications[0]);
    }
    
    return { success: true, data: notifications };
  }

  /**
   * Deleta uma notificação
   */
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteNotification(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.id ?? req.user?.sub;
    await this.prisma.notification.deleteMany({
      where: { id, userId }, // garante que é do usuário
    });
    return { success: true };
  }

  /**
   * Deleta todas notificações do usuário
   */
  @Delete('all')
  @UseGuards(AuthGuard('jwt'))
  async deleteAllNotifications(@Req() req: any) {
    const userId = req.user?.id ?? req.user?.sub;
    await this.prisma.notification.deleteMany({
      where: { userId },
    });
    return { success: true };
  }

  /**
   * Registra o push token do usuário
   */
  @Post('register-token')
  @UseGuards(AuthGuard('jwt'))
  async registerToken(@Req() req: any, @Body() body: { pushToken: string }) {
    const userId = req.user?.id ?? req.user?.sub;
    return this.pushService.registerPushToken(userId, body.pushToken);
  }

  /**
   * Remove o push token (logout)
   */
  @Delete('remove-token')
  @UseGuards(AuthGuard('jwt'))
  async removeToken(@Req() req: any) {
    const userId = req.user?.id ?? req.user?.sub;
    return this.pushService.removePushToken(userId);
  }

  /**
   * Endpoint para admin enviar notificações
   * TODO: Adicionar guard de admin
   */
  @Post('send-to-all')
  async sendToAll(@Body() body: { title: string; body: string; data?: any }) {
    return this.pushService.sendToAllUsers(body.title, body.body, body.data);
  }

  @Post('send-to-users-without-plan')
  async sendToWithoutPlan(@Body() body: { title: string; body: string; data?: any }) {
    return this.pushService.sendToUsersWithoutPlan(body.title, body.body, body.data);
  }

  @Post('send-to-users-with-plan')
  async sendToWithPlan(@Body() body: { title: string; body: string; data?: any }) {
    return this.pushService.sendToUsersWithActivePlan(body.title, body.body, body.data);
  }
}
