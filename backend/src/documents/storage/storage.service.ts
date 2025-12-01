import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  constructor(private readonly cfg: ConfigService) {}

  get isS3() {
    return this.cfg.get<string>('storage.driver') === 's3';
  }

  // Para MVP, usamos storage local. (S3 pode ser adicionado aqui depois)
  public localPathFor(filename: string) {
    const dir = this.cfg.get<string>('storage.uploadDir') || './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, filename);
  }

  public publicUrlFor(filename: string) {
    // Para ambientes locais, vamos servir estático no futuro ou retornar caminho relativo.
    // Em prods com CDN/S3, retornar URL final.
    return `/uploads/${filename}`;
  }
}
