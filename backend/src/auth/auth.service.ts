import { Injectable, BadRequestException, ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

// Se quiser tipar o DTO, importe a classe:
import { RegisterDto } from './dtos/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /** Login: valida email/senha e devolve token + dados do usuário */
  async login(email: string, password: string) {
    const emailNorm = String(email ?? '').toLowerCase().trim();

    const user = await this.prisma.user.findUnique({
      where: { email: emailNorm },
      select: { id: true, name: true, email: true, passwordHash: true },
    });

    if (!user) throw new BadRequestException('Credenciais inválidas');

    const ok = await bcrypt.compare(String(password ?? ''), user.passwordHash);
    if (!ok) throw new BadRequestException('Credenciais inválidas');

    const accessToken = this.jwt.sign({ sub: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken,
      refreshToken: '', // Adicione lógica de refresh token se necessário
    };
  }

  /** Register: cria usuário e devolve token + dados do usuário */
  async register(dto: RegisterDto) {
    this.logger.log(`Register start email=${dto.email}`);

    const emailNorm = String(dto.email ?? '').toLowerCase().trim();

    // Verifica se o CPF já está cadastrado
    if (dto.cpf) {
      const cpfExists = await this.prisma.user.findUnique({
        where: { cpf: dto.cpf },
        select: { id: true },
      });
      if (cpfExists) throw new ConflictException('CPF já cadastrado');
    }

    const exists = await this.prisma.user.findUnique({
      where: { email: emailNorm },
      select: { id: true },
    });
    if (exists) throw new ConflictException('E-mail já cadastrado');

    const passwordHash = await bcrypt.hash(String(dto.password ?? ''), 10);

    try {
      const created = await this.prisma.user.create({
        data: {
          name: dto.name?.trim() || 'Usuário',
          email: emailNorm,
          phone: dto.phone ?? null,
          cpf: dto.cpf ?? null,
          passwordHash,
          role: 'member',
        },
        select: { id: true, name: true, email: true },
      });

      const accessToken = this.jwt.sign({ sub: created.id, email: created.email });
      this.logger.log(`Register ok userId=${created.id}`);
      
      return {
        user: {
          id: created.id,
          name: created.name,
          email: created.email,
        },
        accessToken,
        refreshToken: '',
      };
    } catch (err: any) {
      if (err?.code === 'P2002') {
        // Verifica qual campo está duplicado
        const target = err?.meta?.target;
        if (target?.includes('cpf')) {
          throw new ConflictException('CPF já cadastrado');
        }
        throw new ConflictException('E-mail já cadastrado');
      }
      if (err?.code === 'P2009' || err?.code === 'P2010') {
        this.logger.error(`Prisma arg error on register: ${err?.meta?.target || ''}`, err?.stack);
        throw new BadRequestException('Dados inválidos para cadastro');
      }

      this.logger.error('Register failed', err?.stack || err);
      throw new InternalServerErrorException('Falha ao registrar');
    }
  }
}
