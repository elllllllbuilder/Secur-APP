// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        street: true,
        number: true,
        city: true,
        state: true,
        zipCode: true,
        categoryId: true, // <- ESSENCIAL p/ Documentos
      },
    });
  }
}
