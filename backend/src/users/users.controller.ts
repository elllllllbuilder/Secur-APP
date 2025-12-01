// src/users/users.controller.ts (ou onde está seu GET /me)
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @Get('me')
  async me(@Req() req: any) {
    const userId = req.user?.id ?? req.user?.sub;
    console.log('GET /me -> userId:', userId, 'payload:', req.user);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, name: true, categoryId: true,
        city: true, number: true, state: true, street: true, zipCode: true,
      },
    });

    console.log('GET /me -> prisma result:', user);
    return { success: true, data: user };
  }
}
