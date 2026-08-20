import { Controller, Get, INestApplication, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import request from 'supertest';
import type { App } from 'supertest/types';
import { PrismaExceptionFilter } from './prisma-exception.filter';

@Controller('throws')
class ThrowingController {
  @Get('unique')
  throwUniqueViolation(): never {
    throw new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed on the fields: (`email`)',
      { code: 'P2002', clientVersion: 'test' },
    );
  }

  @Get('unknown')
  throwUnknownError(): never {
    throw new Prisma.PrismaClientKnownRequestError(
      'Connection to database at postgres:5432 failed: password authentication failed',
      { code: 'P9999', clientVersion: 'test' },
    );
  }
}

@Module({ controllers: [ThrowingController] })
class ThrowingModule {}

describe('PrismaExceptionFilter (integration)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ThrowingModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new PrismaExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns a clean 409 for a unique constraint violation raised inside a controller', async () => {
    const response = await request(app.getHttpServer()).get('/throws/unique');
    const body = response.body as { message: string };

    expect(response.status).toBe(409);
    expect(body.message).toBe('A record with this value already exists');
  });

  it('returns a sanitized 500 and never leaks the raw Prisma message', async () => {
    const response = await request(app.getHttpServer()).get('/throws/unknown');
    const body = response.body as { message: string };

    expect(response.status).toBe(500);
    expect(body.message).toBe('Internal server error');
    expect(JSON.stringify(body)).not.toContain('password');
    expect(JSON.stringify(body)).not.toContain('postgres:5432');
  });
});
