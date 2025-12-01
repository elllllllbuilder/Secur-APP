import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomBytes } from 'crypto';
import { StorageService } from './storage.service';
import type { MulterModuleOptions } from '@nestjs/platform-express';

export function multerDiskConfig(storageService: StorageService): MulterModuleOptions {
  return {
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        const full = storageService.localPathFor('');
        const dir = full.endsWith('/') || full.endsWith('\\') ? full : full.replace(/[\\/]$/, '');
        cb(null, dir || './uploads');
      },
      filename: (_req, file, cb) => {
        const id = randomBytes(16).toString('hex');
        const ext = extname(file.originalname || '').toLowerCase();
        cb(null, `${id}${ext}`);
      },
    }),
    fileFilter: (
      _req: any,
      file: Express.Multer.File,
      callback: (error: Error | null, acceptFile: boolean) => void,
    ) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowed.includes(file.mimetype)) {
        return callback(new Error('Tipo de arquivo não permitido.'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  };
}
