import { randomUUID } from 'crypto';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { configureApp } from '../../src/app.setup';
import { PrismaService } from '../../src/prisma/prisma.service';

export interface TestApp {
  app: INestApplication<App>;
  prisma: PrismaService;
}

export interface UserBody {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskBody {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskListBody {
  items: TaskBody[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function body<T>(response: Response): T {
  return response.body as T;
}

export async function createTestApp(): Promise<TestApp> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication<INestApplication<App>>();
  configureApp(app);
  await app.init();

  return { app, prisma: app.get(PrismaService) };
}

export async function resetDatabase(prisma: PrismaService): Promise<void> {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "Task", "User" RESTART IDENTITY CASCADE',
  );
}

export function uniqueEmail(prefix = 'user'): string {
  return `${prefix}-${randomUUID()}@example.com`;
}

export function createUserPayload(
  overrides: Partial<{ name: string; email: string }> = {},
) {
  return {
    name: 'Test User',
    email: uniqueEmail(),
    ...overrides,
  };
}

export function createTaskPayload(
  userId: string,
  overrides: Partial<{
    title: string;
    description: string;
    status: string;
    priority: string;
    dueDate: string;
  }> = {},
) {
  return {
    title: 'Test task',
    userId,
    ...overrides,
  };
}
