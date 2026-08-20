import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
} from '@nestjs/terminus';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AppHealthIndicator } from './indicators/app.health-indicator';
import { PrismaHealthIndicator } from './indicators/prisma.health-indicator';

const HEALTHY_EXAMPLE = {
  status: 'ok',
  info: {
    app: { status: 'up', uptimeSeconds: 42 },
    database: { status: 'up', responseTimeMs: 3 },
  },
  error: {},
  details: {
    app: { status: 'up', uptimeSeconds: 42 },
    database: { status: 'up', responseTimeMs: 3 },
  },
};

const UNHEALTHY_EXAMPLE = {
  status: 'error',
  info: { app: { status: 'up', uptimeSeconds: 42 } },
  error: {
    database: {
      status: 'down',
      message: 'Database connectivity check failed',
    },
  },
  details: {
    app: { status: 'up', uptimeSeconds: 42 },
    database: {
      status: 'down',
      message: 'Database connectivity check failed',
    },
  },
};

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly appHealth: AppHealthIndicator,
    private readonly dbHealth: PrismaHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Liveness/readiness check: process plus database connectivity',
  })
  @ApiOkResponse({
    description: 'All indicators up.',
    schema: { example: HEALTHY_EXAMPLE },
  })
  @ApiServiceUnavailableResponse({
    description: 'One or more indicators down.',
    schema: { example: UNHEALTHY_EXAMPLE },
  })
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.appHealth.isHealthy('app'),
      () => this.dbHealth.isHealthy('database'),
    ]);
  }
}
