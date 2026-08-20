import { execFileSync } from 'child_process';
import { resolve } from 'path';
import { Client } from 'pg';
import './load-test-env';

const REPO_ROOT = resolve(__dirname, '../..');

export default async function globalSetup(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL not set after loading .env.test');
  }

  const testDatabaseUrl = new URL(databaseUrl);
  const databaseName = testDatabaseUrl.pathname.replace('/', '');

  if (!/^[a-z0-9_]+$/.test(databaseName)) {
    throw new Error(
      `Refusing to create a database with an unexpected name: "${databaseName}"`,
    );
  }

  const maintenanceUrl = new URL(databaseUrl);
  maintenanceUrl.pathname = '/postgres';

  const client = new Client({ connectionString: maintenanceUrl.toString() });

  try {
    await client.connect();

    const existing = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [databaseName],
    );

    if (existing.rowCount === 0) {
      await client.query(`CREATE DATABASE "${databaseName}"`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Could not prepare the E2E test database at ${maintenanceUrl.host}. Is the dev Postgres container running? Try "npm run docker:dev:up". Original error: ${message}`,
    );
  } finally {
    await client.end();
  }

  execFileSync('npx', ['prisma', 'migrate', 'deploy'], {
    cwd: REPO_ROOT,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'inherit',
  });
}
