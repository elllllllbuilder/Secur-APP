// src/auth/roles.guard.ts
import {
  CanActivate, ExecutionContext, Injectable, ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';  // <= trocado

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', ctx.getHandler());
    if (!roles || roles.length === 0) return true;

    const req = ctx.switchToHttp().getRequest();
    const userId = req.user?.id ?? req.user?.sub;
    if (!userId) throw new ForbiddenException('Sem usuário no token');

    const user = await this.prisma.user.findUnique({
      where: { id: String(userId) },
      select: { role: true },
    });

    if (!user || !roles.includes(user.role)) {
      throw new ForbiddenException('Acesso negado');
    }
    return true;
  }
}
