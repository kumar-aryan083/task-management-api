import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { AppHealthIndicator } from './indicators/app.health-indicator';
import { PrismaHealthIndicator } from './indicators/prisma.health-indicator';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [AppHealthIndicator, PrismaHealthIndicator],
})
export class HealthModule {}
