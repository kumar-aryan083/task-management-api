import { Logger } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { PrismaService } from '../../prisma/prisma.service';
import { PrismaHealthIndicator } from './prisma.health-indicator';

describe('PrismaHealthIndicator', () => {
  let indicator: PrismaHealthIndicator;
  let prisma: { $queryRaw: jest.Mock };

  beforeEach(() => {
    prisma = { $queryRaw: jest.fn() };
    indicator = new PrismaHealthIndicator(
      new HealthIndicatorService(),
      prisma as unknown as PrismaService,
    );
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('reports up when the database query succeeds', async () => {
    prisma.$queryRaw.mockResolvedValueOnce([{ '?column?': 1 }]);

    const result = await indicator.isHealthy('database');

    expect(result.database.status).toBe('up');
  });

  it('reports down without leaking the raw error message when the query fails', async () => {
    prisma.$queryRaw.mockRejectedValueOnce(
      new Error('password authentication failed for user "postgres"'),
    );

    const result = await indicator.isHealthy('database');

    expect(result.database.status).toBe('down');
    expect(JSON.stringify(result)).not.toContain('password authentication');
  });

  it('reports down if the query never resolves within the timeout', async () => {
    prisma.$queryRaw.mockReturnValueOnce(new Promise(() => undefined));

    const result = await indicator.isHealthy('database');

    expect(result.database.status).toBe('down');
  }, 10000);
});
