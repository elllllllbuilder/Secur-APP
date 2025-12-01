import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

import * as express from 'express';
import { resolve } from 'path';
import { ConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Config
  const cfg = app.get(ConfigService);

  // ====== CORS ======
  // Aceita múltiplas origens separadas por vírgula em FRONTEND_ORIGIN / frontendOrigin.
  // Ex.: http://localhost:8081,http://10.0.2.2:8081,http://192.168.0.10:8081
  const rawOrigins =
    cfg.get<string>('frontendOrigin') ||
    process.env.FRONTEND_ORIGIN ||
    '*';

  const origins = rawOrigins.split(',').map((s) => s.trim()).filter(Boolean);

  app.enableCors({
    origin: origins.length === 1 && origins[0] === '*' ? true : origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    exposedHeaders: ['Content-Disposition'],
    maxAge: 86400,
  });

  // ====== Globais ======
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    disableErrorMessages: false,
    exceptionFactory: (errors) => {
      try {
        console.log('[VALIDATION][ERR]', JSON.stringify(errors, null, 2));
      } catch {}
      const msgs = errors.flatMap(e => Object.values(e.constraints ?? {}));
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { BadRequestException } = require('@nestjs/common');
      return new BadRequestException(msgs.length ? msgs : 'Validation failed');
    },
  }),
);


  // ====== Static: /uploads ======
  // Só ativa quando storage.driver === 'local'
  if ((cfg.get<string>('storage.driver') || 'local') === 'local') {
    const uploadDir =
      cfg.get<string>('storage.uploadDir') ||
      process.env.UPLOAD_DIR ||
      './uploads';
    const abs = resolve(uploadDir);
    app.use('/uploads', express.static(abs, { fallthrough: false, maxAge: 0 }));
  }

  // ====== Network / Bind ======
  // Para funcionar em emulador/dispositivo físico, NÃO use apenas 'localhost'.
  // Escute em 0.0.0.0 e acesse usando o IP da máquina (ex.: 192.168.x.x).
  const host = cfg.get<string>('host') || process.env.HOST || '0.0.0.0';
  const port = Number(cfg.get<number>('port') || process.env.PORT || 3333);

  // Encerramento gracioso (SIGTERM/SIGINT)
  app.enableShutdownHooks();

  await app.listen(port, host);

  const urlShown =
    host === '0.0.0.0' || host === '::'
      ? `http://localhost:${port}`
      : `http://${host}:${port}`;

  // Dica: use o IP da máquina na mesma rede do celular/emulador
  console.log(`🚀 Backend rodando em ${urlShown}`);
  console.log(`🔗 CORS: ${origins.join(', ') || '*'}`);
  console.log(`📁 Uploads: ${(cfg.get<string>('storage.driver') || 'local') === 'local' ? '/uploads' : 'desativado'}`);
}
bootstrap();
