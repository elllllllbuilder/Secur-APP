import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly jwt: JwtService, private readonly cfg: ConfigService) {
    super();
  }

  async validate(req: any): Promise<any> {
    // aceita refreshToken no body para simplicidade do app mobile
    const token = req.body?.refreshToken;
    if (!token) return null;
    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: this.cfg.get<string>('jwt.refreshSecret'),
      });
      return { userId: payload.sub, email: payload.email };
    } catch {
      return null;
    }
  }
}
