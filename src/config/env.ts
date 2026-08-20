import { registerAs } from '@nestjs/config';

export const ENV_CONFIG_KEY = 'env';

export interface EnvConfig {
  port: number;
  databaseUrl: string;
}

export const envConfig = registerAs(ENV_CONFIG_KEY, (): EnvConfig => {
  return {
    port: parsePort(process.env.PORT),
    databaseUrl: readString('DATABASE_URL'),
  };
});

function parsePort(value: string | undefined): number {
  const port = Number(value ?? 3000);

  if (!Number.isInteger(port) || port < 1) {
    throw new Error('PORT must be a positive integer');
  }

  return port;
}

function readString(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} is required`);
  }

  return value;
}
