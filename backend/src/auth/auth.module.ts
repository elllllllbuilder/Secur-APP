// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    PrismaModule,
    // Usaremos AuthGuard('jwt') nas rotas → precisa registrar o Passport
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    // JWT para login/assinatura de tokens
    JwtModule.register({
      // use variável de ambiente em produção
      secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,   // valida o token e popula req.user
    RolesGuard,    // checa papéis no banco; usado pelas rotas admin
  ],
  // Exporta para outros módulos poderem usar AuthGuard/JwtService/RolesGuard
  exports: [PassportModule, JwtModule, RolesGuard],
})
export class AuthModule {}
