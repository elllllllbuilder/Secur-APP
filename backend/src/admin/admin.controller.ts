import { Controller, Get, Post, Delete, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';

// TODO: Criar AdminGuard para verificar se user.role === 'admin'
@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    return this.adminService.getUser(id);
  }

  @Patch('users/:id')
  async updateUser(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateUser(id, body);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Get('payments')
  async getAllPayments() {
    return this.adminService.getAllPayments();
  }

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  @Post('subscriptions/:id/cancel')
  async cancelSubscription(@Param('id') id: string) {
    return this.adminService.cancelSubscription(id);
  }

  @Post('users/:id/change-plan')
  async changePlan(@Param('id') userId: string, @Body() body: { planId: string }) {
    return this.adminService.changePlan(userId, body.planId);
  }

  @Post('users/:id/notify')
  async notifyUser(
    @Param('id') userId: string,
    @Body() body: { title: string; message: string; type?: string },
  ) {
    return this.adminService.notifyUser(userId, body.title, body.message, body.type);
  }
}
