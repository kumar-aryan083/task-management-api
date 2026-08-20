import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import { ENV_CONFIG_KEY } from './config/env';
import type { EnvConfig } from './config/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const { port } = configService.getOrThrow<EnvConfig>(ENV_CONFIG_KEY);

  configureApp(app);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Task Management API')
    .setDescription(
      'A task management REST API. There is no authentication yet: ' +
        '`/users/me` always resolves to the most recently created user. ' +
        'Unexpected server errors are sanitized before being returned — see `GET /health` for liveness/DB connectivity.',
    )
    .setVersion('1.0.0')
    .addTag('users')
    .addTag('tasks')
    .addTag('health')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument, {
    jsonDocumentUrl: 'docs/json',
    customSiteTitle: 'Task Management API — API Docs',
  });

  await app.listen(port);
}

void bootstrap();
