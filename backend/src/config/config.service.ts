import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private readonly cfg: NestConfigService) {}

  /**
   * Mapa amigável de chaves "dot.notation" -> variáveis de ambiente reais.
   */
  private mapKey(key: string): string {
    const map: Record<string, string> = {
      port: 'PORT',
      nodeEnv: 'NODE_ENV',
      apiUrl: 'API_URL',
      frontendOrigin: 'FRONTEND_ORIGIN',

      'jwt.secret': 'JWT_SECRET',
      'jwt.expiresIn': 'JWT_EXPIRES',
      'jwt.refreshSecret': 'JWT_REFRESH_SECRET',
      'jwt.refreshExpiresIn': 'JWT_REFRESH_EXPIRES',

      'storage.driver': 'STORAGE_DRIVER',
      'storage.uploadDir': 'UPLOAD_DIR',

      'pagarme.apiKey': 'PAGARME_API_KEY',
      'pagarme.baseUrl': 'PAGARME_BASE_URL',
    };
    return map[key] ?? key;
  }

  get<T = any>(key: string): T | undefined {
    return this.cfg.get<T>(this.mapKey(key));
  }
}
