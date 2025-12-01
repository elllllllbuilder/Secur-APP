// src/auth/auth.controller.ts
import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto'; // <-- ADICIONE ISSO

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto) {
    const result = await this.auth.login(dto.email, dto.password);
    return result;
  }

 @Post('register')
@HttpCode(201)
async register(@Body() dto: RegisterDto) {
  const result = await this.auth.register(dto);
  return result;
}

  // 🔎 TEMPORÁRIO: endpoint para inspecionar o que o app está enviando
  @Post('_echo')
  @HttpCode(200)
  echo(@Req() req: any, @Body() body: any) {
    console.log('ECHO content-type:', req.headers['content-type']);
    console.log('ECHO body:', body);
    return { contentType: req.headers['content-type'], body };
  }
}

