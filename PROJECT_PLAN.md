# Task Management API Completion Plan

## Project Goal

Build a small but properly structured NestJS REST API for task management.

The final project should cover the full `PROJECT_SPEC.md`: NestJS modules, controllers, providers, DTOs, validation, exception handling, configuration, Prisma, PostgreSQL, users, task CRUD, pagination, filtering, sorting, logging, Swagger/OpenAPI, unit tests, E2E tests, Docker, health checks, and graceful startup/shutdown.

## Current Status

**All 18 phases are complete.** The project fully covers `PROJECT_SPEC.md`'s functional requirements and NestJS learning objectives:

- **Users & Tasks** (Phases 2–10): full CRUD for both, Prisma-backed (no in-memory storage anywhere), with pagination/filtering/search/sorting on task listing and cascade-delete from user to their tasks.
- **Configuration & Prisma** (Phases 6–7): typed, validated env config; `prisma/schema.prisma` with `User`/`Task` models, enums, indexes, and three applied migrations; `PrismaService` using the `@prisma/adapter-pg` driver adapter required by Prisma 7.
- **Exception handling & logging** (Phases 11–12): a global `PrismaExceptionFilter` sanitizes every unhandled database error; per-operation service logging plus a global HTTP request logger, both PII-free (ids only, never emails).
- **Health, Swagger, E2E, Docker** (Phases 13–16): `GET /health` via `@nestjs/terminus`; full interactive API docs at `/docs`; a real E2E suite (`npm run test:e2e`) against a dedicated test database; both a dev-only Postgres compose file and a fully containerized app+db Docker Compose stack.
- **Docs & verification** (Phases 17–18): `README.md` fully rewritten and verified command-by-command against the real running app; `npm run build`, `npm test` (42/42), and `npm run test:e2e` (24/24) all pass; every route walked end-to-end against the containerized stack.

Known, deliberate limitations (documented in `README.md`'s "Known limitations" and explained in `LEARNING_NOTES.md`, not oversights): no authentication (`/users/me` = most recently created user; `GET /tasks` isn't scoped per user), offset-based pagination, and — since there's no auth — no code path ever throws `UnauthorizedException`/`ForbiddenException`, and no operation needed a Prisma transaction (nothing writes to more than one table atomically).

## Phase Checklist

- [x] Phase 0: Baseline Review
- [x] Phase 1: Learning Notes Setup
- [x] Phase 2: Clean Current Task Module
- [x] Phase 3: Add Task Query DTO
- [x] Phase 4: Add Complete Task Endpoint
- [x] Phase 5: Users Module
- [x] Phase 6: Configuration
- [x] Phase 7: PostgreSQL + Prisma Setup
- [x] Phase 8: Move Users to Prisma
- [x] Phase 9: Move Tasks to Prisma
- [x] Phase 10: Real Task Listing
- [x] Phase 11: Exception Handling
- [x] Phase 12: Logging
- [x] Phase 13: Health Check
- [x] Phase 14: Swagger/OpenAPI
- [x] Phase 15: E2E Tests
- [x] Phase 16: Docker
- [x] Phase 17: Final Documentation
- [x] Phase 18: Final Verification

## Detailed Phase Plan

### Phase 0: Baseline Review

- [x] Read `PROJECT_SPEC.md`.
- [x] Confirm current NestJS project structure.
- [x] Confirm existing task routes.
- [x] Confirm validation setup.
- [x] Run `npm run build`.
- [x] Run `npm test`.
- [x] Record current baseline in `PROJECT_PLAN.md`.

Baseline notes:

- `npm run build` passes.
- `npm test -- --runInBand` passes.
- Current tests are very light and mostly starter-level.
- Existing task data is stored in a private array inside `TasksService`.

### Phase 1: Learning Notes Setup

- [x] Create `LEARNING_NOTES.md`.
- [x] Add notes for current concepts already used:
  - NestJS project structure
  - Modules
  - Controllers
  - Providers
  - Dependency Injection
  - DTOs
  - ValidationPipe
- [x] Keep updating this file after every future phase.

### Phase 2: Clean Current Task Module

- [x] Review `TasksModule`.
- [x] Review `TasksController`.
- [x] Review `TasksService`.
- [x] Explain controller vs service responsibility in `LEARNING_NOTES.md`.
- [x] Make sure task CRUD behavior is clean before database migration.
- [x] Add or expand unit tests for current in-memory service:
  - create task
  - find all tasks
  - find one task
  - update task
  - delete task
  - not found error
- [x] Run `npm test`.
- [x] Run `npm run build`.
- [x] Mark Phase 2 complete.

### Phase 3: Add Task Query DTO

- [x] Create `TaskQueryDto`.
- [x] Add validation for:
  - `page`
  - `limit`
  - `status`
  - `priority`
  - `search`
  - `sortBy`
  - `sortOrder`
- [x] Wire query DTO into `GET /tasks`.
- [x] Implement in-memory filtering, searching, sorting, and pagination first.
- [x] Return list metadata:
  - `items`
  - `page`
  - `limit`
  - `total`
  - `totalPages`
- [x] Add tests for task query behavior.
- [x] Run `npm test`.
- [x] Run `npm run build`.
- [x] Mark Phase 3 complete.

### Phase 4: Add Complete Task Endpoint

- [x] Add `PATCH /tasks/:id/complete`.
- [x] Update task status to `DONE`.
- [x] Update `updatedAt`.
- [x] Add unit tests.
- [x] Leave fuller E2E coverage for the database-backed API phase.
- [x] Run `npm test`.
- [x] Run `npm run build`.
- [x] Mark Phase 4 complete.

### Phase 5: Users Module

- [x] Create `UsersModule`.
- [x] Create `UsersController`.
- [x] Create `UsersService`.
- [x] Create DTOs:
  - `CreateUserDto`
  - `UpdateUserDto`
- [x] Add user routes:
  - `POST /users`
  - `GET /users/me`
  - `PATCH /users/me`
  - `DELETE /users/me`
- [x] Use a simple temporary current-user approach until authentication is introduced or clarified.
- [x] Add user validation rules.
- [x] Add user service tests.
- [x] Run `npm test`.
- [x] Run `npm run build`.
- [x] Mark Phase 5 complete.

### Phase 6: Configuration

- [x] Add environment configuration support.
- [x] Add `.env.example`.
- [x] Configure app port from environment.
- [x] Configure database URL from environment.
- [x] Make sure real secrets are not committed.
- [x] Explain configuration in `LEARNING_NOTES.md`.
- [x] Run `npm test`.
- [x] Run `npm run build`.
- [x] Mark Phase 6 complete.

### Phase 7: PostgreSQL + Prisma Setup

- [x] Install Prisma dependencies. (`prisma`, `@prisma/client`, `@prisma/adapter-pg`, `pg` — Prisma 7 requires an explicit driver adapter at runtime)
- [x] Initialize Prisma. (`prisma/schema.prisma` + `prisma.config.ts` — Prisma 7 moved the datasource URL out of `schema.prisma`)
- [x] Create `DatabaseModule`. (named `PrismaModule` instead — same role: a `@Global()` module exporting `PrismaService`)
- [x] Create `PrismaService`.
- [x] Add graceful Prisma connection handling. (`onModuleInit`/`onModuleDestroy` connect/disconnect)
- [x] Define Prisma models:
  - `User`
  - `Task`
- [x] Add task status enum.
- [x] Add task priority enum.
- [x] Add user-task relation.
- [x] Add justified indexes for common query fields. (`Task.userId`, `Task.status`, `Task.priority`, `Task.dueDate` — the fields `TaskQueryDto` filters/sorts by; added via migration `20260820171241_add_task_query_indexes`)
- [x] Create and run initial migration. (`prisma/migrations/20260820170542_init`, applied to the dev Postgres container)
- [x] Explain schema, migrations, generated client, and relations in `LEARNING_NOTES.md`.
- [x] Run `npm test`.
- [x] Run `npm run build`.
- [x] Mark Phase 7 complete.

### Phase 8: Move Users to Prisma

- [x] Replace temporary user storage with Prisma. (in-memory array + `currentUserId` pointer removed; current user is now derived via `prisma.user.findFirst({ orderBy: { createdAt: 'desc' } })`)
- [x] Implement create user.
- [x] Implement view profile.
- [x] Implement update profile.
- [x] Implement delete account.
- [x] Handle duplicate user conflicts. (case-insensitive email check, `ConflictException`)
- [x] Handle missing user errors. (`NotFoundException` when no user exists)
- [x] Add Prisma-mocked unit tests. (`users.service.spec.ts` mocks `PrismaService` via Nest's testing module)
- [x] Run `npm test`. (27/27 passing)
- [x] Run `npm run build`.
- [x] Mark Phase 8 complete.

Verification beyond the checklist: booted the app against the dev Postgres container and exercised `POST /users`, `GET /users/me`, `PATCH /users/me`, duplicate-email `POST /users` (409), `DELETE /users/me` (200), and `GET /users/me` after deletion (404) with real `curl` requests — all behaved correctly against the actual database, not just mocks.

### Phase 9: Move Tasks to Prisma

- [x] Replace in-memory task storage with Prisma.
- [x] Implement create task with `userId`. (invalid `userId` now surfaces as `NotFoundException`, not a raw FK error)
- [x] Implement get user tasks. (`GET /tasks`, fully DB-backed — see Phase 10 below, completed alongside this)
- [x] Implement get one task.
- [x] Implement update task.
- [x] Implement delete task.
- [x] Implement complete task.
- [x] Preserve validation behavior.
- [x] Add Prisma-mocked unit tests. (`tasks.service.spec.ts`, mocked `PrismaService`)
- [x] Run `npm test`. (28/28 passing)
- [x] Run `npm run build`.
- [x] Mark Phase 9 complete.

Bug found and fixed during real end-to-end testing (not caught by mocked unit tests): deleting a user with existing tasks threw an unhandled 500 (Postgres FK violation) because the `Task.user` relation had no `onDelete` behavior. Added `onDelete: Cascade` to the schema (migration `20260820172651_cascade_delete_tasks_on_user_delete`) — deleting a user now cleanly deletes their tasks too. Verified with real `curl` requests against the dev Postgres container: invalid-`userId` task creation (404), full filter/search/sort/pagination combinations, complete/update/delete, and the cascade-delete scenario itself.

### Phase 10: Real Task Listing

Completed as part of Phase 9 — moving `TasksService` to Prisma required implementing real filtering/searching/sorting/pagination at the same time to avoid regressing existing behavior, so this phase's work was already done.

- [x] Implement database-backed pagination. (`skip`/`take` in `prisma.task.findMany`)
- [x] Implement status filter.
- [x] Implement priority filter.
- [x] Implement title search. (case-insensitive `contains`)
- [x] Implement sorting. (dynamic `orderBy: { [sortBy]: sortOrder }`)
- [x] Return list metadata:
  - `items`
  - `page`
  - `limit`
  - `total`
  - `totalPages`
- [x] Add tests for query combinations. (filter, search, sort, pagination — in `tasks.service.spec.ts`)
- [x] Run `npm test`.
- [x] Run `npm run build`.
- [x] Mark Phase 10 complete.

### Phase 11: Exception Handling

- [x] Use NestJS built-in exceptions consistently:
  - `BadRequestException` (already automatic via the global `ValidationPipe` and `ParseUUIDPipe`)
  - `NotFoundException` (already used in `UsersService`/`TasksService`; now also mapped from Prisma `P2003`/`P2025`)
  - `ConflictException` (already used in `UsersService`; now also mapped from Prisma `P2002`)
  - `InternalServerErrorException` where appropriate (new: `PrismaExceptionFilter`'s fallback for unrecognized Prisma errors)
- [x] Avoid leaking internal database errors. (`src/common/filters/prisma-exception.filter.ts`, registered globally in `main.ts`; logs the real error server-side, returns only a sanitized message)
- [x] Explain exception flow in `LEARNING_NOTES.md`.
- [x] Add or update tests for error paths. (`prisma-exception.filter.spec.ts` unit-tests the mapping logic; `prisma-exception.filter.integration.spec.ts` boots a real app + `supertest` to prove the filter is wired correctly and that no raw Prisma message ever reaches the response body)
- [x] Run `npm test`. (34/34 passing)
- [x] Run `npm run build`.
- [x] Mark Phase 11 complete.

Verified beyond the checklist: booted the app against the dev Postgres container and confirmed invalid email (400), malformed UUID param (400), duplicate email (409, via the existing pre-check, not the new filter), and normal create/delete (200/201) all still behave correctly — the new global filter doesn't interfere with existing exception paths, since `@Catch(Prisma.PrismaClientKnownRequestError)` only intercepts unhandled Prisma errors.

### Phase 12: Logging

- [x] Add structured NestJS logging around important operations. (`TasksService`/`UsersService` log every create/update/complete/delete via a per-class `Logger`; a global `LoggingInterceptor` logs method/url/status/duration for every request)
- [x] Log useful context like ids and operation names. (e.g. `Created task id=... userId=...`, `HTTP GET /tasks 200 +12ms`)
- [x] Avoid logging passwords, tokens, or secrets. (no passwords/tokens exist in this app; went further and never log email addresses either — only ids — even in duplicate-email warnings)
- [x] Explain Nest Logger and log levels in `LEARNING_NOTES.md`.
- [x] Run `npm test`. (37/37 passing)
- [x] Run `npm run build`.
- [x] Mark Phase 12 complete.

Beyond the checklist: added `logging.interceptor.spec.ts` to test the new interceptor (found and fixed a latent Jest spy-leakage bug while writing it, in both this file and `prisma-exception.filter.spec.ts` — repeated `jest.spyOn` on an already-mocked method reuses the same spy, so call counts leaked across tests without `jest.restoreAllMocks()`). Also booted the app against the dev Postgres container, exercised create/list/duplicate-conflict/not-found/delete, and confirmed in the real log output that ids, operation names, and HTTP status/duration all appear correctly — and grepped the full log for the test email address used, confirming it never appears anywhere.

### Phase 13: Health Check

- [x] Add `HealthModule`. (`src/health/health.module.ts`, imports `@nestjs/terminus`'s `TerminusModule`)
- [x] Add `GET /health`.
- [x] Check application availability. (`AppHealthIndicator` — always up, reports `process.uptime()`)
- [x] Check database connectivity. (`PrismaHealthIndicator` — custom, not Terminus's built-in Mongo-first one; runs `SELECT 1` via `PrismaService` with a 3s timeout, never leaks the raw error)
- [x] Return clear health response. (Terminus's standard `{status, info, error, details}` shape; 200 when healthy, 503 automatically when any indicator is down)
- [x] Add tests for health endpoint. (`prisma.health-indicator.spec.ts`, `health.controller.spec.ts`)
- [x] Run `npm test`. (42/42 passing)
- [x] Run `npm run build`.
- [x] Mark Phase 13 complete.

Also added `app.enableShutdownHooks()` in `main.ts` (serves the spec's graceful-shutdown objective directly, and is required for `PrismaService.onModuleDestroy()` to fire on `SIGTERM` — matters for Docker in Phase 16 too). Verified beyond the checklist: booted against the dev Postgres container, confirmed 200 healthy → stopped the container → confirmed 503 with a sanitized message (grepped the response for leaked host/credential details — none found) → restarted the container without restarting the app → confirmed recovery to 200.

### Phase 14: Swagger/OpenAPI

- [x] Install Swagger dependencies. (`@nestjs/swagger`, bundles Swagger UI)
- [x] Configure Swagger in `main.ts`. (`DocumentBuilder` + `SwaggerModule.setup('docs', ...)`, JSON at `/docs/json`)
- [x] Document user endpoints. (`@ApiTags`/`@ApiOperation`/response codes on all four `UsersController` routes)
- [x] Document task endpoints. (same on all six `TasksController` routes, plus `@ApiParam` on the `:id` routes)
- [x] Document query params. (`TaskQueryDto`'s `@ApiPropertyOptional` fields auto-explode into 7 documented query params — verified in the generated JSON)
- [x] Document DTOs. (`@ApiProperty`/`@ApiPropertyOptional` on every field of every request DTO, plus new documentation-only response classes — `UserResponseDto`, `TaskResponseDto`, `TaskListResponseDto`, `ErrorResponseDto`, `ValidationErrorResponseDto` — each `implements` the real type so `tsc` fails if the docs drift from the schema)
- [x] Document response status codes. (actual per-route codes, e.g. `POST /users` → 201/400/409, `PATCH /tasks/:id` → 200/400/404 with no 409 since `Task` has no unique constraint)
- [x] Explain why Swagger matters in `LEARNING_NOTES.md`.
- [x] Run `npm test`. (42/42 passing)
- [x] Run `npm run build`.
- [x] Mark Phase 14 complete.

Real bug found and fixed: `UpdateUserDto`/`UpdateTaskDto` imported `PartialType`/`OmitType` from `@nestjs/mapped-types`, which drops `@ApiProperty` metadata — both would have rendered as an empty `{}` schema. Switched both imports to `@nestjs/swagger`'s versions. Verified beyond the checklist by fetching `/docs/json` and asserting on it directly with `jq`: exact path list (`/`, `/health`, `/tasks`, `/tasks/{id}`, `/tasks/{id}/complete`, `/users`, `/users/me`), exact response-code sets per route, `UpdateUserDto`/`UpdateTaskDto` properties non-empty (proving the fix worked), reusable enum schema components (`TaskStatus`, `TaskPriority`, `TaskSortBy`, `SortOrder`), and `GET /tasks`'s 200 response resolving to `$ref: TaskListResponseDto`. Also confirmed `/docs` loads (200) and normal CRUD still works unaffected.

### Phase 15: E2E Tests

- [x] Replace default starter E2E test. (`test/app.e2e-spec.ts` now also checks `/health`; two new files added)
- [x] Add E2E test flow:
  - create user
  - create task
  - get task
  - update task
  - complete task
  - delete task
- [x] Add invalid input tests. (missing/invalid fields, bad enums, malformed UUIDs in body and route params, unknown fields via `forbidNonWhitelisted`)
- [x] Add missing resource tests. (404s for users/tasks, plus `POST /tasks` with a non-existent `userId`)
- [x] Use a test database strategy. (a second database, `task_management_api_test`, on the existing dev Postgres container — see `test/setup/global-setup.ts`/`load-test-env.ts`)
- [x] Run `npm run test:e2e`. (24/24 passing)
- [x] Run `npm run build`.
- [x] Mark Phase 15 complete.

Real bug found and fixed just by attempting this phase: `npm run start:prod` (`node dist/main`) was silently broken — `nest build` was actually emitting `dist/src/main.js`, not `dist/main.js`, because `tsconfig.build.json` had no `include` and TypeScript nested output under `src/` to preserve the project's common root (which included `prisma.config.ts` at the repo root). Fixed with `"include": ["src/**/*"]`; verified both `nest start` (dev) and `start:prod` boot correctly afterward. Also extracted `src/app.setup.ts` (`configureApp(app)`) so E2E tests exercise the exact same `ValidationPipe`/`PrismaExceptionFilter`/`LoggingInterceptor`/`enableShutdownHooks` as production — without this, none of the 400/409 assertions in the new specs would have meant anything.

A bug in the tests themselves (not the app) was caught and fixed during verification: a pagination/sort test asserted the wrong task would land on page 2 of an alphabetically-sorted list.

### Phase 16: Docker

Note: `docker-compose.development.yml` (dev-only Postgres container, no app container) was added early to support Phase 7 work.

- [x] Add `Dockerfile`. (four stages: `deps`, `builder`, `prod-deps`, `runner` — `node:24-bookworm-slim`, non-root `node` user)
- [x] Add `docker-compose.yml`. (distinct from the dev-only file — `postgres`, `migrate`, `api` services)
- [x] Run NestJS app container.
- [x] Run PostgreSQL container.
- [x] Add database health check. (Postgres's `pg_isready`, plus the `api` service's own healthcheck hitting `GET /health` from Phase 13)
- [x] Use environment variables. (`DATABASE_URL` pointed at the `postgres` service name over the compose network, never the host's `.env`)
- [x] Document local Docker startup. (done as part of Phase 17's README rewrite, referencing the final `docker:up`/`docker:down` scripts)
- [x] Explain production vs development Docker concerns in `LEARNING_NOTES.md`.
- [x] Verify Docker Compose starts app and database.
- [x] Mark Phase 16 complete.

**Real incident during verification, documented in full in `LEARNING_NOTES.md`:** the first `docker compose up` for the new file printed `Container task-management-api-postgres-dev Recreate` — a container name that file never mentions. Neither compose file declared an explicit project `name:`, so both defaulted to the same directory-derived project name, and Compose's `(project, service-name)` reconciliation considered both files' identically-named `postgres` service the same container — replacing one with the other on every `up`. The dev container briefly vanished from `docker ps -a`. No data was lost (the named volume survived independently and was confirmed intact — same three migrations, same timestamps, after recovery), but it was caught by checking, not assumed. Fixed with two changes: both compose files now declare distinct explicit `name:` fields, and the dev file's volume is now pinned `external: true` with its exact existing name (necessary because changing the project name alone would have made Compose resolve a different, empty volume instead of reattaching to the real data).

Also caught and fixed during the `builder` stage's first build: Prisma warned about failing to detect the OpenSSL version on `bookworm-slim` (which doesn't ship it by default) — added `apt-get install -y openssl` to the base stage per Prisma's own suggestion.

Verified beyond the checklist: built the `builder` stage standalone first (proving `prisma generate` + `nest build` work inside Linux) before the full image; confirmed `node_modules/.prisma` must be copied from `builder` into `runner` separately from the `--omit=dev` install (`@prisma/client`'s own code just re-exports from it) via `docker run ... node -e "require('@prisma/client')"`; ran a full CRUD smoke test (health, create user, create task, list tasks, delete) against the actual containerized stack; confirmed `docker compose restart api` shuts down and restarts cleanly; confirmed a full `down`/`up` cycle is idempotent (`migrate` logs "No pending migrations to apply" the second time); and confirmed — after the incident above — that the two compose stacks now run simultaneously with zero interference, and that `npm run test:e2e` (which depends on the dev container) still passes unaffected.

### Phase 17: Final Documentation

- [x] Update `README.md`. (full rewrite — was 100% unmodified Nest starter boilerplate)
- [x] Document setup.
- [x] Document environment variables. (matches `src/config/env.ts` exactly — just `PORT`/`DATABASE_URL`)
- [x] Document database migration commands.
- [x] Document running tests. (unit vs E2E, including the E2E test-database strategy)
- [x] Document running with Docker. (both compose setups explained distinctly, with their different `DATABASE_URL`s)
- [x] Document Swagger URL.
- [x] Keep `PROJECT_PLAN.md` updated.
- [x] Mark Phase 17 complete.

Verified beyond the checklist: every script name in the README's tables diffed against actual `package.json` keys (added a missing `test:debug` row); `npm run prisma:generate` and `npm run prisma:migrate:deploy` actually run as documented; booted the app and confirmed every claimed URL (`/`, `/docs`, `/docs/json`, `/health`) returns exactly what the README shows, including the literal health-check payload shape.

### Phase 18: Final Verification

- [x] Run `npm run build`.
- [x] Run `npm test`. (42/42 passing)
- [x] Run `npm run test:e2e`. (24/24 passing, against the dedicated test database)
- [x] Verify Swagger opens. (`/docs` and `/docs/json` both confirmed 200)
- [x] Verify Docker Compose starts app and database. (`npm run docker:up` — postgres healthy, migrate exited 0, api healthy)
- [x] Verify all required routes work. (all 11 routes walked end-to-end against the containerized stack: `/`, `/health`, `/docs`, full user lifecycle, full task lifecycle including complete/cascade-delete)
- [x] Confirm all `PROJECT_SPEC.md` requirements are covered.
- [x] Mark project complete in `PROJECT_PLAN.md`.

Coverage review against `PROJECT_SPEC.md`'s Functional Requirements and NestJS Concepts lists: every user/task CRUD operation, every task field, every enum, every suggested route, and every listed query param is implemented. Modules/Controllers/Providers/DI/DTOs/Validation/Exception-Handling/Database/Health/Logging/Swagger/Testing/Docker are all present and explained in `LEARNING_NOTES.md`, including a dedicated "Full Request Lifecycle" section added during this phase after noticing it was named explicitly in the spec but hadn't been tied together as one coherent explanation yet.

Two spec-listed concepts are **deliberately** not implemented, per this project's own long-standing assumptions (stated since Phase 5/8): `UnauthorizedException`/`ForbiddenException` have no natural trigger point because there is no authentication (`/users/me` = most recently created user, by design); Prisma transactions were never needed because no operation in this app writes to more than one table atomically. Both are called out explicitly in `README.md`'s "Known limitations" and `LEARNING_NOTES.md`, not silently omitted.

The one structural naming divergence from the spec's suggested architecture (`DatabaseModule` → this project's `PrismaModule`, same role) was a deliberate choice made and documented back in Phase 7.

## Testing Checklist

- [x] Run `npm test` after unit-level changes.
- [x] Run `npm run build` after TypeScript/module changes.
- [x] Run `npm run test:e2e` after API behavior changes.
- [x] Verify Docker only after Docker files are added.
- [x] Do not mark a phase complete if relevant tests are failing.

## Documentation Checklist

- [x] Keep `PROJECT_PLAN.md` updated after every phase.
- [x] Keep `LEARNING_NOTES.md` updated after every phase.
- [x] Update `README.md` near the end of the project.
- [x] Document every dependency added. (`README.md`'s Tech Stack section; each dependency's purpose also explained in `LEARNING_NOTES.md` at the phase it was introduced)
- [x] Document how to run the app locally.
- [x] Document how to run tests.
- [x] Document how to run with Docker.

## Completion Checklist

- [x] Users API is complete.
- [x] Tasks API is complete.
- [x] PostgreSQL and Prisma are integrated.
- [x] Filtering, searching, sorting, and pagination work.
- [x] Validation is complete.
- [x] Exceptions are consistent.
- [x] Logging is present and safe.
- [x] Health endpoint checks app and database.
- [x] Swagger documentation is available.
- [x] Unit tests cover core behavior.
- [x] E2E tests cover required flows.
- [x] Docker setup runs app and database.
- [x] `README.md` explains the project clearly.
- [x] `LEARNING_NOTES.md` explains the required NestJS concepts.
- [x] All final verification commands pass.

## Assumptions

- Work will happen phase by phase.
- Each phase should include learning notes before it is marked complete.
- We will not add authentication unless the project direction changes later.
- Until authentication exists, `/users/me` will use a simple temporary current-user approach.
- Prisma will be injected through `PrismaService`.
- No repository abstraction will be added unless the project later needs one.
- Real secrets should stay out of source control.
