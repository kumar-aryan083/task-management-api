# Task Management API

A task management REST API built with NestJS 11, Prisma 7, and PostgreSQL. This is a learning project, built phase by phase — see [`PROJECT_SPEC.md`](PROJECT_SPEC.md) for the original brief, [`PROJECT_PLAN.md`](PROJECT_PLAN.md) for the phase-by-phase build log, and [`LEARNING_NOTES.md`](LEARNING_NOTES.md) for a running explanation of every NestJS concept introduced along the way.

## Features

- User accounts: create, view, update, delete (`/users`)
- Task CRUD, plus a dedicated "mark complete" endpoint (`/tasks`)
- Task listing with pagination, status/priority filtering, title search, and sorting
- Global request validation (`class-validator` + `ValidationPipe`)
- A global exception filter that maps unhandled Prisma errors to clean HTTP responses without ever leaking database internals
- Structured logging (per-operation service logs, plus a global HTTP request/response logger)
- `GET /health` — liveness and database connectivity check
- Full OpenAPI/Swagger documentation
- Unit tests (Prisma mocked at the service boundary) and E2E tests (real database)
- Docker: both a dev-only Postgres container and a fully containerized app+database stack

## Tech stack

- [NestJS](https://nestjs.com/) 11, TypeScript 5.7
- [Prisma](https://www.prisma.io/) 7 (with the `@prisma/adapter-pg` driver adapter) + PostgreSQL 16
- Jest 30 + Supertest for unit and E2E tests
- `@nestjs/swagger` 11, `@nestjs/terminus` 11
- Docker / Docker Compose

## Prerequisites

- Node.js >= 20
- npm
- Docker Desktop (or another Docker Engine) — no local PostgreSQL install needed

## Getting started

```bash
npm install
cp .env.example .env

# start a local Postgres container (dev-only, no app container)
npm run docker:dev:up

# generate the Prisma client and apply migrations
npm run prisma:generate
npm run prisma:migrate

# start the app in watch mode
npm run start:dev
```

The API is now running at `http://localhost:3000`, with interactive docs at `http://localhost:3000/docs`.

## Project structure

```
src/
  main.ts                 # bootstrap: Swagger setup, port, calls configureApp()
  app.setup.ts             # shared global config (ValidationPipe, filters, interceptors, shutdown hooks)
  app.module.ts            # root module

  common/
    filters/               # PrismaExceptionFilter — sanitizes unhandled Prisma errors
    interceptors/           # LoggingInterceptor — logs every request's method/url/status/duration
    dto/                    # shared response DTOs used only for Swagger documentation

  config/
    env.ts                  # typed, validated environment configuration

  prisma/
    prisma.module.ts        # @Global() module exporting PrismaService
    prisma.service.ts        # PrismaClient wrapper (driver adapter, connect/disconnect lifecycle)

  health/                   # GET /health (Terminus: app liveness + DB connectivity)

  users/                    # UsersModule: controller, service, DTOs
  tasks/                    # TasksModule: controller, service, DTOs, enums

test/
  app.e2e-spec.ts, users.e2e-spec.ts, tasks.e2e-spec.ts
  setup/                    # E2E test-database bootstrap (see "Testing" below)
  utils/                    # shared test-app/test-data helpers
```

## Environment variables

`src/config/env.ts` reads and validates exactly two variables at startup:

| Variable       | Required | Default | Notes                                                                 |
| -------------- | -------- | ------- | ---------------------------------------------------------------------- |
| `PORT`         | No       | `3000`  | Must resolve to a positive integer, or the app fails to start.        |
| `DATABASE_URL` | Yes      | —       | Postgres connection string. The app fails to start if this is unset.  |

`.env.example` documents the local-dev value (Postgres on `localhost:5433` — see below for why not `5432`). `.env` is git-ignored and never committed. Prisma's CLI (`migrate`, `generate`, `studio`) reads `DATABASE_URL` through `prisma.config.ts`, not through NestJS's `ConfigModule` — both read the same variable, just via different mechanisms (see `LEARNING_NOTES.md`).

`.env.test` (committed — no real secrets, just local dev credentials) configures the separate E2E test database; see "Testing" below.

## Database & migrations

```bash
npm run prisma:generate        # regenerate the Prisma client after a schema change
npm run prisma:migrate         # create + apply a new migration (interactive, dev)
npm run prisma:migrate:deploy  # apply existing migrations without prompts (CI/production)
npx prisma migrate reset       # drop and recreate the dev database from scratch
npx prisma studio              # browse the database in a GUI
```

`PrismaService` (`src/prisma/prisma.service.ts`) wraps `PrismaClient` with the `@prisma/adapter-pg` driver adapter (required by Prisma 7), connecting in `onModuleInit` and disconnecting in `onModuleDestroy`.

## Running the app

```bash
npm run start        # normal mode
npm run start:dev     # watch mode
npm run start:debug   # watch mode with the debugger attached
npm run build         # compile to dist/
npm run start:prod    # run the compiled build (node dist/main.js)
```

## API documentation

Interactive Swagger UI: **`http://localhost:3000/docs`**
Raw OpenAPI JSON: **`http://localhost:3000/docs/json`**

Generated entirely from decorators on the actual DTOs and controllers — never a hand-maintained file that can drift from the code.

## Health check

```bash
curl http://localhost:3000/health
```

```json
{
  "status": "ok",
  "info": {
    "app": { "status": "up", "uptimeSeconds": 42 },
    "database": { "status": "up", "responseTimeMs": 3 }
  },
  "error": {},
  "details": {
    "app": { "status": "up", "uptimeSeconds": 42 },
    "database": { "status": "up", "responseTimeMs": 3 }
  }
}
```

Returns **200** when both indicators are up, **503** (with `status: "error"` and details under `error`) if the database is unreachable. Database errors are never leaked into the response.

## Endpoints

| Method | Path                 | Description                          |
| ------ | -------------------- | ------------------------------------ |
| POST   | `/users`              | Create a user account                |
| GET    | `/users/me`           | Get the current user's profile¹      |
| PATCH  | `/users/me`           | Update the current user's profile¹   |
| DELETE | `/users/me`           | Delete the current user's account¹   |
| POST   | `/tasks`              | Create a task                        |
| GET    | `/tasks`              | List tasks (pagination/filter/search/sort — see below) |
| GET    | `/tasks/:id`          | Get one task                         |
| PATCH  | `/tasks/:id`          | Update a task                        |
| PATCH  | `/tasks/:id/complete` | Mark a task as completed             |
| DELETE | `/tasks/:id`          | Delete a task                        |
| GET    | `/health`             | Liveness + database connectivity     |

¹ No authentication exists yet — `/users/me` always resolves to the most recently created user. See "Known limitations" below.

### Task list query parameters (`GET /tasks`)

| Param        | Type   | Default     | Notes                                             |
| ------------ | ------ | ----------- | -------------------------------------------------- |
| `page`       | number | `1`         | ≥ 1                                                 |
| `limit`      | number | `20`        | 1–100                                               |
| `status`     | enum   | —           | `TODO`, `IN_PROGRESS`, `DONE`                       |
| `priority`   | enum   | —           | `LOW`, `MEDIUM`, `HIGH`                             |
| `search`     | string | —           | Case-insensitive match on title (contains), ≤ 200 chars |
| `sortBy`     | enum   | `createdAt` | `createdAt`, `updatedAt`, `dueDate`, `title`, `status`, `priority` |
| `sortOrder`  | enum   | `desc`      | `asc`, `desc`                                       |

Example: `GET /tasks?status=TODO&priority=HIGH&search=nestjs&sortBy=dueDate&sortOrder=asc&page=1&limit=20`

### Error responses

| Status | When                                                                 |
| ------ | --------------------------------------------------------------------- |
| 400    | Invalid/missing fields, bad enum values, malformed UUIDs, or an unknown body field (unknown fields are rejected, not silently dropped, via `forbidNonWhitelisted`). `message` is an array of one string per failed field for body validation. |
| 404    | The requested resource doesn't exist — including creating a task with a `userId` that doesn't reference a real user. |
| 409    | Duplicate email on user create/update (case-insensitive comparison). |
| 500    | An unanticipated server error. The response is always a generic, sanitized message — never a raw database error. |

## Testing

```bash
npm test           # unit tests — Prisma mocked at the service boundary, no database needed
npm run test:watch
npm run test:cov
npm run test:e2e   # E2E tests — real HTTP requests against a real database
```

E2E tests run against a **second database** (`task_management_api_test`) on the same dev Postgres container used for local development — not the same database you'd be looking at with `psql` during manual testing, and not a separate container. A Jest `globalSetup` creates that database (if missing) and applies migrations before the suite runs; each test file truncates its tables between tests for isolation. The dev container (`npm run docker:dev:up`) must be running before `npm run test:e2e`. See the "E2E Tests" section of `LEARNING_NOTES.md` for the full reasoning.

## Running with Docker

Two distinct setups exist, for two different purposes:

**Dev-only Postgres** (`docker-compose.development.yml`) — just a database container; you still run the app on your host with `npm run start:dev`. This is what local development and the E2E test suite both use.

```bash
npm run docker:dev:up
npm run docker:dev:down
```

**Full containerized stack** (`docker-compose.yml`) — builds the app image and runs it alongside its own Postgres container, wired together over an internal Docker network. Includes a one-shot `migrate` service that applies migrations before the app starts.

```bash
npm run docker:up             # build + start app and database
npm run docker:logs           # follow the app container's logs
npm run docker:down           # stop and remove containers
npm run docker:down:volumes   # also delete the database volume
```

The two setups use different `DATABASE_URL`s (host `localhost:5433` for the dev-only Postgres vs. the container-network address `postgres:5432` inside the full stack) and are isolated Compose projects — bringing one up or down never affects the other.

## Available scripts

| Script                      | Description                                              |
| --------------------------- | --------------------------------------------------------- |
| `build`                     | Compile to `dist/`                                        |
| `format`                    | Format `src/`/`test/` with Prettier                        |
| `start` / `start:dev` / `start:debug` / `start:prod` | Run the app (normal / watch / watch+debug / compiled) |
| `lint`                      | ESLint with autofix                                        |
| `test` / `test:watch` / `test:cov` | Unit tests (run / watch / with coverage)             |
| `test:debug`                | Unit tests with the Node inspector attached                 |
| `test:e2e`                  | E2E tests against a real database                          |
| `docker:dev:up` / `docker:dev:down` | Dev-only Postgres container                        |
| `docker:up` / `docker:down` / `docker:down:volumes` / `docker:logs` | Full app+database Docker stack |
| `prisma:generate`           | Regenerate the Prisma client                                |
| `prisma:migrate`            | Create and apply a migration (dev, interactive)             |
| `prisma:migrate:deploy`     | Apply existing migrations without prompts                   |

## Known limitations

- **No authentication.** `/users/me` always resolves to the most recently created user; `POST /tasks` takes an explicit `userId` with no ownership check beyond "does this user exist."
- `GET /tasks` is not scoped to a particular user — it lists every task in the database.
- Pagination is offset-based (`page`/`limit`), not cursor-based.
- Swagger is exposed unconditionally, with no environment gate.

## License

`UNLICENSED` — private project.
