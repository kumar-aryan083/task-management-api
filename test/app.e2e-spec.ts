import request from 'supertest';
import { body, createTestApp, resetDatabase, TestApp } from './utils/test-app';

interface HealthBody {
  status: string;
  info: { database?: { status: string } };
}

describe('AppController (e2e)', () => {
  let testApp: TestApp;

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase(testApp.prisma);
  });

  afterAll(async () => {
    await testApp.app.close();
  });

  it('/ (GET) — proves the full module graph (including Prisma/the database) boots', () => {
    return request(testApp.app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/health (GET) — reports the app and database as up against the real test database', async () => {
    const response = await request(testApp.app.getHttpServer()).get('/health');
    const healthBody = body<HealthBody>(response);

    expect(response.status).toBe(200);
    expect(healthBody.status).toBe('ok');
    expect(healthBody.info.database?.status).toBe('up');
  });
});
