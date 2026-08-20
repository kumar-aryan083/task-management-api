# Task Management API Completion Plan

## Project Goal

Build a small but properly structured NestJS REST API for task management.

The final project should cover the full `PROJECT_SPEC.md`: NestJS modules, controllers, providers, DTOs, validation, exception handling, configuration, Prisma, PostgreSQL, users, task CRUD, pagination, filtering, sorting, logging, Swagger/OpenAPI, unit tests, E2E tests, Docker, health checks, and graceful startup/shutdown.

## Current Status

This project currently has a basic NestJS application with an in-memory `TasksModule`.

Done so far:

- Basic NestJS project structure exists.
- `TasksModule`, `TasksController`, and `TasksService` exist.
- Task status and priority enums exist.
- `CreateTaskDto` and `UpdateTaskDto` exist.
- Global validation is configured in `main.ts`.
- Basic task CRUD endpoints exist.
- The app builds successfully.
- The current test suite passes.

Important limitations:

- Tasks are stored in memory, not PostgreSQL.
- There is no `UsersModule` yet.
- There is no Prisma setup yet.
- Task list filtering, searching, sorting, and pagination are not implemented yet.
- Swagger, Docker, logging, health checks, and real E2E coverage are not implemented yet.
- `LEARNING_NOTES.md` still needs to be created and maintained.

## Phase Checklist

- [x] Phase 0: Baseline Review
- [x] Phase 1: Learning Notes Setup
- [x] Phase 2: Clean Current Task Module
- [ ] Phase 3: Add Task Query DTO
- [ ] Phase 4: Add Complete Task Endpoint
- [ ] Phase 5: Users Module
- [ ] Phase 6: Configuration
- [ ] Phase 7: PostgreSQL + Prisma Setup
- [ ] Phase 8: Move Users to Prisma
- [ ] Phase 9: Move Tasks to Prisma
- [ ] Phase 10: Real Task Listing
- [ ] Phase 11: Exception Handling
- [ ] Phase 12: Logging
- [ ] Phase 13: Health Check
- [ ] Phase 14: Swagger/OpenAPI
- [ ] Phase 15: E2E Tests
- [ ] Phase 16: Docker
- [ ] Phase 17: Final Documentation
- [ ] Phase 18: Final Verification

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
- [ ] Mark Phase 3 complete.

### Phase 4: Add Complete Task Endpoint

- [ ] Add `PATCH /tasks/:id/complete`.
- [ ] Update task status to `DONE`.
- [ ] Update `updatedAt`.
- [ ] Add unit tests.
- [ ] Leave fuller E2E coverage for the database-backed API phase.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Mark Phase 4 complete.

### Phase 5: Users Module

- [ ] Create `UsersModule`.
- [ ] Create `UsersController`.
- [ ] Create `UsersService`.
- [ ] Create DTOs:
  - `CreateUserDto`
  - `UpdateUserDto`
- [ ] Add user routes:
  - `POST /users`
  - `GET /users/me`
  - `PATCH /users/me`
  - `DELETE /users/me`
- [ ] Use a simple temporary current-user approach until authentication is introduced or clarified.
- [ ] Add user validation rules.
- [ ] Add user service tests.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Mark Phase 5 complete.

### Phase 6: Configuration

- [ ] Add environment configuration support.
- [ ] Add `.env.example`.
- [ ] Configure app port from environment.
- [ ] Configure database URL from environment.
- [ ] Make sure real secrets are not committed.
- [ ] Explain configuration in `LEARNING_NOTES.md`.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Mark Phase 6 complete.

### Phase 7: PostgreSQL + Prisma Setup

- [ ] Install Prisma dependencies.
- [ ] Initialize Prisma.
- [ ] Create `DatabaseModule`.
- [ ] Create `PrismaService`.
- [ ] Add graceful Prisma connection handling.
- [ ] Define Prisma models:
  - `User`
  - `Task`
- [ ] Add task status enum.
- [ ] Add task priority enum.
- [ ] Add user-task relation.
- [ ] Add justified indexes for common query fields.
- [ ] Create and run initial migration.
- [ ] Explain schema, migrations, generated client, and relations in `LEARNING_NOTES.md`.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Mark Phase 7 complete.

### Phase 8: Move Users to Prisma

- [ ] Replace temporary user storage with Prisma.
- [ ] Implement create user.
- [ ] Implement view profile.
- [ ] Implement update profile.
- [ ] Implement delete account.
- [ ] Handle duplicate user conflicts.
- [ ] Handle missing user errors.
- [ ] Add Prisma-mocked unit tests.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Mark Phase 8 complete.

### Phase 9: Move Tasks to Prisma

- [ ] Replace in-memory task storage with Prisma.
- [ ] Implement create task with `userId`.
- [ ] Implement get user tasks.
- [ ] Implement get one task.
- [ ] Implement update task.
- [ ] Implement delete task.
- [ ] Implement complete task.
- [ ] Preserve validation behavior.
- [ ] Add Prisma-mocked unit tests.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Mark Phase 9 complete.

### Phase 10: Real Task Listing

- [ ] Implement database-backed pagination.
- [ ] Implement status filter.
- [ ] Implement priority filter.
- [ ] Implement title search.
- [ ] Implement sorting.
- [ ] Return list metadata:
  - `items`
  - `page`
  - `limit`
  - `total`
  - `totalPages`
- [ ] Add tests for query combinations.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Mark Phase 10 complete.

### Phase 11: Exception Handling

- [ ] Use NestJS built-in exceptions consistently:
  - `BadRequestException`
  - `NotFoundException`
  - `ConflictException`
  - `InternalServerErrorException` where appropriate
- [ ] Avoid leaking internal database errors.
- [ ] Explain exception flow in `LEARNING_NOTES.md`.
- [ ] Add or update tests for error paths.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Mark Phase 11 complete.

### Phase 12: Logging

- [ ] Add structured NestJS logging around important operations.
- [ ] Log useful context like ids and operation names.
- [ ] Avoid logging passwords, tokens, or secrets.
- [ ] Explain Nest Logger and log levels in `LEARNING_NOTES.md`.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Mark Phase 12 complete.

### Phase 13: Health Check

- [ ] Add `HealthModule`.
- [ ] Add `GET /health`.
- [ ] Check application availability.
- [ ] Check database connectivity.
- [ ] Return clear health response.
- [ ] Add tests for health endpoint.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Mark Phase 13 complete.

### Phase 14: Swagger/OpenAPI

- [ ] Install Swagger dependencies.
- [ ] Configure Swagger in `main.ts`.
- [ ] Document user endpoints.
- [ ] Document task endpoints.
- [ ] Document query params.
- [ ] Document DTOs.
- [ ] Document response status codes.
- [ ] Explain why Swagger matters in `LEARNING_NOTES.md`.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Mark Phase 14 complete.

### Phase 15: E2E Tests

- [ ] Replace default starter E2E test.
- [ ] Add E2E test flow:
  - create user
  - create task
  - get task
  - update task
  - complete task
  - delete task
- [ ] Add invalid input tests.
- [ ] Add missing resource tests.
- [ ] Use a test database strategy.
- [ ] Run `npm run test:e2e`.
- [ ] Run `npm run build`.
- [ ] Mark Phase 15 complete.

### Phase 16: Docker

- [ ] Add `Dockerfile`.
- [ ] Add `docker-compose.yml`.
- [ ] Run NestJS app container.
- [ ] Run PostgreSQL container.
- [ ] Add database health check.
- [ ] Use environment variables.
- [ ] Document local Docker startup.
- [ ] Explain production vs development Docker concerns in `LEARNING_NOTES.md`.
- [ ] Verify Docker Compose starts app and database.
- [ ] Mark Phase 16 complete.

### Phase 17: Final Documentation

- [ ] Update `README.md`.
- [ ] Document setup.
- [ ] Document environment variables.
- [ ] Document database migration commands.
- [ ] Document running tests.
- [ ] Document running with Docker.
- [ ] Document Swagger URL.
- [ ] Keep `PROJECT_PLAN.md` updated.
- [ ] Mark Phase 17 complete.

### Phase 18: Final Verification

- [ ] Run `npm run build`.
- [ ] Run `npm test`.
- [ ] Run `npm run test:e2e`.
- [ ] Verify Swagger opens.
- [ ] Verify Docker Compose starts app and database.
- [ ] Verify all required routes work.
- [ ] Confirm all `PROJECT_SPEC.md` requirements are covered.
- [ ] Mark project complete in `PROJECT_PLAN.md`.

## Testing Checklist

- [ ] Run `npm test` after unit-level changes.
- [ ] Run `npm run build` after TypeScript/module changes.
- [ ] Run `npm run test:e2e` after API behavior changes.
- [ ] Verify Docker only after Docker files are added.
- [ ] Do not mark a phase complete if relevant tests are failing.

## Documentation Checklist

- [ ] Keep `PROJECT_PLAN.md` updated after every phase.
- [ ] Keep `LEARNING_NOTES.md` updated after every phase.
- [ ] Update `README.md` near the end of the project.
- [ ] Document every dependency added.
- [ ] Document how to run the app locally.
- [ ] Document how to run tests.
- [ ] Document how to run with Docker.

## Completion Checklist

- [ ] Users API is complete.
- [ ] Tasks API is complete.
- [ ] PostgreSQL and Prisma are integrated.
- [ ] Filtering, searching, sorting, and pagination work.
- [ ] Validation is complete.
- [ ] Exceptions are consistent.
- [ ] Logging is present and safe.
- [ ] Health endpoint checks app and database.
- [ ] Swagger documentation is available.
- [ ] Unit tests cover core behavior.
- [ ] E2E tests cover required flows.
- [ ] Docker setup runs app and database.
- [ ] `README.md` explains the project clearly.
- [ ] `LEARNING_NOTES.md` explains the required NestJS concepts.
- [ ] All final verification commands pass.

## Assumptions

- Work will happen phase by phase.
- Each phase should include learning notes before it is marked complete.
- We will not add authentication unless the project direction changes later.
- Until authentication exists, `/users/me` will use a simple temporary current-user approach.
- Prisma will be injected through `PrismaService`.
- No repository abstraction will be added unless the project later needs one.
- Real secrets should stay out of source control.
