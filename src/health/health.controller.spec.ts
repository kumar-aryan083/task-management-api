import { HealthCheckService } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { AppHealthIndicator } from './indicators/app.health-indicator';
import { PrismaHealthIndicator } from './indicators/prisma.health-indicator';

describe('HealthController', () => {
  let controller: HealthController;
  let health: { check: jest.Mock };

  beforeEach(() => {
    health = { check: jest.fn().mockResolvedValue({ status: 'ok' }) };
    controller = new HealthController(
      health as unknown as HealthCheckService,
      {} as AppHealthIndicator,
      {} as PrismaHealthIndicator,
    );
  });

  it('checks exactly the app and database indicators', async () => {
    await controller.check();

    expect(health.check).toHaveBeenCalledTimes(1);
    const [indicatorFns] = health.check.mock.calls[0] as [(() => unknown)[]];
    expect(indicatorFns).toHaveLength(2);
  });

  it('returns whatever HealthCheckService.check resolves', async () => {
    const result = await controller.check();

    expect(result).toEqual({ status: 'ok' });
  });
});
