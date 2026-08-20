import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

const DEFAULT_TEST_DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5433/task_management_api_test?schema=public';

loadEnv({ path: resolve(__dirname, '../../.env.test'), override: true });

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = DEFAULT_TEST_DATABASE_URL;
}

const databaseName = new URL(process.env.DATABASE_URL).pathname.replace(
  '/',
  '',
);

if (!databaseName.endsWith('_test')) {
  throw new Error(
    `Refusing to run E2E tests: DATABASE_URL points at "${databaseName}", which does not look like a test database (expected a name ending in "_test"). Tests truncate tables on every run — check .env.test.`,
  );
}
