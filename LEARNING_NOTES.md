# Learning Notes

These notes explain the NestJS concepts used while building the Task Management API. Keep updating this file after each phase.

## Current Project Structure

This project is a NestJS application. NestJS organizes backend code into modules, controllers, providers, DTOs, and application bootstrap files.

Current important files:

- `src/main.ts`: starts the NestJS application.
- `src/app.module.ts`: root module of the application.
- `src/app.controller.ts`: default starter controller.
- `src/app.service.ts`: default starter service.
- `src/tasks/tasks.module.ts`: feature module for task-related code.
- `src/tasks/tasks.controller.ts`: HTTP routes for tasks.
- `src/tasks/tasks.service.ts`: task business logic and current in-memory data storage.
- `src/tasks/dto/create-task.dto.ts`: input shape and validation rules for creating tasks.
- `src/tasks/dto/update-task.dto.ts`: input shape and validation rules for updating tasks.
- `src/tasks/task.enums.ts`: every enum used by the tasks module — `TaskStatus`, `TaskPriority`, `TaskSortBy`, `SortOrder` — kept in one file per module rather than split one-enum-per-file.

Express equivalent:

- In Express, routes, request validation, and business logic are often wired together manually in route files and middleware.
- In NestJS, these responsibilities are separated into framework concepts: modules, controllers, providers, DTOs, pipes, and decorators.

## Modules

A module groups related application code together.

In this project:

- `AppModule` is the root module.
- `TasksModule` groups task-related controller and service code.
- `AppModule` imports `TasksModule`, which makes the task routes part of the application.

Why NestJS provides modules:

- They make the application easier to organize as it grows.
- They create clear feature boundaries.
- They tell NestJS which controllers and providers belong together.

Express equivalent:

- A module is similar to an Express router file plus the services/helpers that support it, but NestJS gives it a formal structure.

## Controllers

A controller handles incoming HTTP requests.

In `TasksController`, decorators define routes:

- `@Controller('tasks')` means every route starts with `/tasks`.
- `@Post()` handles `POST /tasks`.
- `@Get()` handles `GET /tasks`.
- `@Get(':id')` handles `GET /tasks/:id`.
- `@Patch(':id')` handles `PATCH /tasks/:id`.
- `@Delete(':id')` handles `DELETE /tasks/:id`.

The controller currently receives route params and request bodies, then calls `TasksService`.

Why NestJS provides controllers:

- Controllers keep HTTP-specific logic in one place.
- Controllers should not contain database or business logic.
- Controllers translate HTTP input into service method calls.

Express equivalent:

- A controller method is similar to an Express route handler such as `app.get('/tasks/:id', handler)`.

## Providers

A provider is a class managed by NestJS dependency injection.

In this project, `TasksService` is a provider because it uses `@Injectable()` and is registered in `TasksModule`.

Why NestJS provides providers:

- Providers hold reusable logic.
- Providers can be injected into controllers or other services.
- Providers make testing easier because dependencies can be replaced with mocks.

Express equivalent:

- A provider is similar to a service/helper class that route handlers import manually, except NestJS creates and injects it for you.

## Dependency Injection

Dependency Injection means a class receives the objects it needs instead of creating them directly.

In `TasksController`:

```ts
constructor(private readonly tasksService: TasksService) {}
```

NestJS sees that `TasksController` needs `TasksService`, creates the service, and passes it into the controller.

Why this matters:

- The controller does not need to know how to create the service.
- Tests can provide a fake service if needed.
- Code stays loosely coupled.

Express equivalent:

- In Express, you usually import a service manually at the top of a file. NestJS handles that wiring through the module system.

## DTOs

DTO means Data Transfer Object.

A DTO describes the shape of data entering or leaving an API boundary. In this project:

- `CreateTaskDto` describes the body for `POST /tasks`.
- `UpdateTaskDto` describes the body for `PATCH /tasks/:id`.

Why NestJS projects use DTOs:

- They make request bodies explicit.
- They centralize validation rules.
- They document what clients are allowed to send.
- They avoid passing unknown request data directly into business logic.

Entity/model vs DTO:

- An entity/model represents stored application data.
- A DTO represents data crossing the API boundary.
- They can look similar, but they have different purposes.

## Decorators

Decorators are metadata markers used by NestJS and validation libraries.

Examples from the project:

- `@Module()` marks a class as a NestJS module.
- `@Controller()` marks a class as a controller.
- `@Injectable()` marks a class as a provider.
- `@Post()`, `@Get()`, `@Patch()`, and `@Delete()` define HTTP routes.
- `@Body()` reads the request body.
- `@Param()` reads a route parameter.
- `@IsString()`, `@IsEnum()`, and `@IsUUID()` define validation rules.

Why NestJS uses decorators:

- They let the framework understand how classes and methods should behave.
- They reduce manual route and dependency wiring.

## ValidationPipe

`ValidationPipe` is registered globally in `src/main.ts`.

Current configuration:

```ts
new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
})
```

What this means:

- `whitelist: true` removes fields that are not defined in a DTO.
- `forbidNonWhitelisted: true` rejects requests that send unknown fields.
- `transform: true` allows NestJS to transform request values into expected DTO types where possible.

Why validation matters:

- It protects services from bad input.
- It gives clients clear error messages.
- It keeps controllers simpler because validation happens before controller methods run.

Express equivalent:

- In Express, this is usually done with middleware such as Joi, Zod, Yup, or express-validator.

## Current Request Flow

For a task creation request:

```text
POST /tasks
  -> ValidationPipe validates CreateTaskDto
  -> TasksController.create receives the DTO
  -> TasksController calls TasksService.create
  -> TasksService creates the task in memory
  -> NestJS returns the response
```

This will change later when Prisma and PostgreSQL replace the in-memory array.

## Current Limitations

The project is still early.

Current limitations:

- Data disappears when the server restarts because tasks are stored in memory.
- There is no user module yet.
- `userId` is accepted on tasks, but users are not actually stored or checked.
- Task filtering, searching, sorting, and pagination are not implemented.
- Swagger documentation is not available yet.
- Docker is not configured yet.
- Tests exist, but they do not yet cover the real task behavior.

## Controller vs Service Responsibility

In NestJS, controllers and services should have different jobs.

Controller responsibility:

- Define HTTP routes.
- Read request data using decorators like `@Body()` and `@Param()`.
- Apply route-specific pipes like `ParseUUIDPipe`.
- Call service methods.
- Return the service result as the HTTP response.

Service responsibility:

- Hold business logic.
- Create, find, update, and delete application data.
- Throw meaningful exceptions when an operation cannot be completed.
- Stay independent from HTTP details where possible.

In the current task module:

- `TasksController` handles routes such as `POST /tasks` and `GET /tasks/:id`.
- `TasksService` handles task creation, lookup, update, deletion, default values, and `NotFoundException`.

Why this separation matters:

- Controllers stay small and easy to read.
- Business logic can be tested without starting an HTTP server.
- Later, when the in-memory array is replaced with Prisma, most controller code should not need to change.

Express equivalent:

- In Express, this same separation is possible but manual. A route handler would receive `req` and `res`, then call a separate service function. NestJS encourages that structure by default.

## Query Parameters and Pagination

Query parameters are values passed after `?` in a URL.

Example:

```text
GET /tasks?page=1&limit=20&status=TODO&search=nestjs
```

In NestJS, controllers can read query parameters with `@Query()`.

In this project, `TaskQueryDto` describes the allowed query parameters for `GET /tasks`:

- `page`: which page of results to return.
- `limit`: how many tasks to return per page.
- `status`: filter by task status.
- `priority`: filter by task priority.
- `search`: search by task title.
- `sortBy`: choose which field to sort by.
- `sortOrder`: choose ascending or descending order.

Why use a DTO for query parameters:

- The API only accepts known query parameters.
- Invalid enum values can be rejected before reaching the service.
- Number-like query strings can be transformed into numbers.
- The service can receive a clear object instead of manually reading raw strings.

Pagination response shape:

```ts
{
  items: Task[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

Why include metadata:

- `items` contains the actual data for the current page.
- `total` tells the client how many matching records exist.
- `totalPages` helps the client know whether more pages are available.

Express equivalent:

- In Express, you would usually read `req.query.page`, `req.query.limit`, and other values manually, convert strings to numbers yourself, validate them, and pass them into a service.

## Action-Specific Routes

Most task updates go through `PATCH /tasks/:id` because the client sends fields to change.

Marking a task complete has its own endpoint:

```text
PATCH /tasks/:id/complete
```

Why use a separate route here:

- Completing a task is a common domain action.
- The client does not need to know the internal status value.
- The service can keep the rule in one place: completed tasks use `TaskStatus.DONE`.

In the controller, the complete route calls `TasksService.complete(id)`.

In the service, `complete()`:

- Finds the task.
- Sets `status` to `DONE`.
- Updates `updatedAt`.
- Returns the updated task.

If the task does not exist, `findOne()` throws `NotFoundException`, and NestJS turns that into a `404` HTTP response.

Express equivalent:

- In Express, this would be a route like `router.patch('/tasks/:id/complete', handler)`, and the handler would manually call a service function.

## Users Module

`UsersModule` is the second feature module in this project.

It contains:

- `UsersController`: HTTP routes for user actions.
- `UsersService`: user business logic, backed by `PrismaService` (see "Prisma and PostgreSQL" below).
- `CreateUserDto`: request body rules for creating a user.
- `UpdateUserDto`: request body rules for updating a user.

Current user routes:

```text
POST   /users
GET    /users/me
PATCH  /users/me
DELETE /users/me
```

Current user fields:

- `id`
- `name`
- `email`
- `createdAt`
- `updatedAt`

Temporary current-user behavior:

- The project does not have authentication yet.
- The most recently created user is still the temporary current user — but this is now derived directly from the database (`prisma.user.findFirst({ orderBy: { createdAt: 'desc' } })`) instead of an in-memory pointer variable. This means the "current user" survives an app restart, since it comes from real stored data rather than process memory.
- `/users/me` reads, updates, or deletes that temporary current user.
- This keeps the beginner API moving without adding guards, JWTs, sessions, or passwords too early.

Why this is temporary:

- A real API should not decide the current user from the most recently created user.
- Later projects or phases can introduce authentication properly.

Validation rules:

- `name` must be a non-empty string.
- `name` has a maximum length of 100 characters.
- `email` must be a valid email address.
- `email` has a maximum length of 255 characters.

Error behavior:

- Creating a user with an existing email throws `ConflictException`. The duplicate check is case-insensitive (`mode: 'insensitive'` in the Prisma query), matching the original in-memory behavior — `Aryan@example.com` and `aryan@example.com` are treated as the same email.
- Reading, updating, or deleting `/users/me` with no temporary current user throws `NotFoundException`.

Express equivalent:

- In Express, user routes would usually live in a user router file.
- Validation would usually happen through middleware or explicit schema parsing.
- The router would manually call service functions for create, read, update, and delete behavior.

### Phase 8: Users moved to Prisma

`UsersService` no longer keeps a private `users: User[]` array or a `currentUserId` pointer. Every method now goes through `PrismaService`:

- `create(dto)`: checks for a case-insensitive duplicate email (`ensureEmailIsAvailable`), then `prisma.user.create(...)`.
- `findCurrentUser()`: `prisma.user.findFirst({ orderBy: { createdAt: 'desc' } })` — the most recently created row, throwing `NotFoundException` if the table is empty.
- `updateCurrentUser(dto)`: re-checks email availability only if the email actually changed (excluding the current user's own row via `id: { not: user.id }`), then `prisma.user.update(...)`.
- `deleteCurrentUser()`: `prisma.user.delete({ where: { id: user.id } })`.

Because every method is now asynchronous (Prisma calls return promises), `UsersController`'s methods now return `Promise<User>` instead of `User`, and `User` is imported from `@prisma/client` instead of a hand-written interface.

Testing change: `users.service.spec.ts` no longer calls the real database. It provides a mocked `PrismaService` (plain `jest.fn()`s for `user.create`/`findFirst`/`update`/`delete`) via Nest's testing module `providers` array — `{ provide: PrismaService, useValue: prisma }`. This keeps unit tests fast and independent of Postgres, while the actual database interaction was verified separately by booting the app against the dev Postgres container and exercising `/users` end to end with `curl`.

### Phase 9: Tasks moved to Prisma (and real DB-backed listing)

`TasksService` no longer keeps a private `tasks: Task[]` array. Every method now goes through `PrismaService`, and — because preserving the existing filtering/searching/sorting/pagination behavior meant implementing it against a real query instead of an in-memory `.filter()`/`.sort()`/`.slice()` — this phase also fully satisfies Phase 10 (Real Task Listing) along the way:

- `create(dto)`: `prisma.task.create(...)`. If `userId` doesn't reference a real user, Postgres rejects the insert with a foreign-key violation (Prisma error code `P2003`), which is caught and turned into a `NotFoundException` instead of a raw database error.
- `findAll(query)`: builds a single `Prisma.TaskWhereInput` from the optional `status`/`priority`/`search` query params (search uses `{ contains, mode: 'insensitive' }`, matching Postgres's `ILIKE`), then runs `prisma.task.findMany({ where, orderBy, skip, take })` and `prisma.task.count({ where })` together with `Promise.all` so pagination metadata (`total`, `totalPages`) reflects the same filter as the page of results.
- `findOne(id)` / `update(id, dto)` / `complete(id)` / `remove(id)`: each calls `findOne` first (or is `findOne` itself) so a missing task always surfaces as `NotFoundException`, not a Prisma "record not found" error.

Enum unification: `TaskStatus`/`TaskPriority` are re-exported from `@prisma/client` instead of being declared separately. Both enums already had identical key/value pairs (e.g. `TODO = 'TODO'`), so this was a safe, transparent change — but it matters because TypeScript treats two separately-declared string enums as incompatible types even when their values match. Reusing Prisma's generated enum everywhere (DTO validation, service logic, Prisma queries) avoids that mismatch entirely instead of littering the code with type casts.

All four task-related enums (`TaskStatus`, `TaskPriority`, `TaskSortBy`, `SortOrder`) now live together in `src/tasks/task.enums.ts`, one file per module rather than one file per enum. `TaskSortBy`/`SortOrder` moved out of `task-query.dto.ts` into this file for the same reason — a module's enums live in one place, and DTOs/services import from there.

Cascading delete: deleting a user who still has tasks used to throw an unhandled 500 (a raw Postgres foreign-key violation), because the `Task.user` relation had no `onDelete` behavior defined. The schema now declares `onDelete: Cascade` on that relation (migration `20260820172651_cascade_delete_tasks_on_user_delete`), so deleting a user also deletes their tasks — matching typical "delete my account" semantics. This was found by actually exercising the API end to end, not by the mocked unit tests (which don't touch real foreign-key constraints).

Testing change: `tasks.service.spec.ts` follows the same mocked-`PrismaService` pattern as `users.service.spec.ts`, with `jest.fn()`s for `task.create`/`findMany`/`count`/`findUnique`/`update`/`delete`. Query-building tests assert the exact `where`/`orderBy`/`skip`/`take` object passed to `findMany`, rather than re-testing Postgres's own filtering/sorting logic.

Express equivalent:

- In Express + Prisma, this same code would look almost identical — the ORM layer doesn't change based on the web framework. What NestJS adds is the dependency-injected `PrismaService` and the `@Injectable()`/`@Controller()` structure around it.

## Configuration

Configuration means values the application needs at runtime but should not hard-code into source files.

Examples:

- `PORT`: which port the HTTP server listens on.
- `DATABASE_URL`: how the application will connect to PostgreSQL once Prisma is added.

This project now uses `@nestjs/config` with a central `src/config/env.ts` file.

Why this dependency was added:

- It is the standard NestJS configuration package.
- It loads values from `.env`.
- It exposes `ConfigService`, which can be injected or read from the Nest application.
- It avoids scattering direct `process.env` reads throughout the codebase.

Current setup:

- `ConfigModule.forRoot({ isGlobal: true, load: [envConfig] })` is registered in `AppModule`.
- `isGlobal: true` means other modules can use configuration later without importing `ConfigModule` every time.
- `envConfig` reads and validates environment variables once during application startup.
- `main.ts` reads the typed `env` config object through `ConfigService`.
- `.env.example` documents required environment variables.

Why use a central `env.ts` file:

- All environment variable names live in one place.
- Parsing rules live in one place.
- Required variables fail fast at startup.
- The rest of the backend can use typed config instead of calling `process.env` directly.
- Future modules can inject `ConfigService` and read the same `env` config object.

Why `.env.example` exists:

- It tells developers which variables the project expects.
- It gives safe placeholder values.
- It can be committed to source control.

Why `.env` should not be committed:

- Real `.env` files can contain passwords, tokens, database URLs, and other secrets.
- This project already ignores `.env` in `.gitignore`.

Current environment variables:

```text
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/task_management_api?schema=public"
```

Important details:

- Environment variables are strings.
- `env.ts` converts `PORT` into a number before it reaches `main.ts`.
- If `PORT` is not a positive integer, startup fails clearly.
- `DATABASE_URL` is required — Prisma/PostgreSQL are now set up (see "Prisma and PostgreSQL" below). Port `5433` (not Postgres's default `5432`) is used because the local dev container in `docker-compose.development.yml` maps to that host port to avoid clashing with another Postgres instance already running on this machine.

Express equivalent:

- In Express, projects often use `dotenv` directly and read `process.env.PORT`.
- NestJS can still use environment variables, but `@nestjs/config` gives the app a central configuration module.

## Prisma and PostgreSQL

Prisma is an ORM (Object-Relational Mapper). It lets the application read and write PostgreSQL data using generated, type-safe JavaScript/TypeScript methods instead of hand-written SQL.

### Schema

`prisma/schema.prisma` is the single source of truth for the database structure. In this project it defines:

- A `generator client` block, which tells Prisma to generate a JS/TS client (`prisma-client-js`) into `node_modules/@prisma/client`.
- A `datasource db` block, which declares the database type (`postgresql`). Note: as of Prisma 7, the connection URL no longer lives in `schema.prisma` — it moved to `prisma.config.ts` (see below).
- Two enums, `TaskStatus` and `TaskPriority`, matching the values re-exported from `src/tasks/task.enums.ts` exactly, so the database only ever stores known values.
- Two models, `User` and `Task`, matching the shape of the in-memory `User`/`Task` interfaces that `UsersService`/`TasksService` still use today.
- A relation: `Task.userId` references `User.id`. This is how Prisma expresses a foreign key — each task belongs to exactly one user, and a user can have many tasks (`User.tasks`).
- Indexes (`@@index(...)`) on `Task.userId`, `Task.status`, `Task.priority`, and `Task.dueDate` — these are the fields `TaskQueryDto` filters and sorts by (see "Query Parameters and Pagination" above), so Postgres can look them up without scanning every row once the table grows.

### Prisma 7 configuration change

Prisma 7 moved datasource connection details out of `schema.prisma` and into a separate `prisma.config.ts` file at the project root:

```ts
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: process.env.DATABASE_URL },
});
```

This file is read by the Prisma CLI (`migrate`, `generate`, `studio`, etc.), not by the running application.

### Migrations

A migration is a versioned, ordered set of SQL changes that brings the database schema in line with `schema.prisma`.

- `npx prisma migrate dev --name <name>` compares the schema to the database, generates a SQL file under `prisma/migrations/<timestamp>_<name>/migration.sql`, and applies it.
- Each migration folder is committed to source control, so any developer (or CI) can run `prisma migrate deploy` and get an identical database structure.
- This project has two migrations so far: `..._init` (creates the `User`/`Task` tables) and `..._add_task_query_indexes` (adds the indexes described above).

### Generated client and runtime connection

Running `prisma generate` (or `migrate dev`, which runs it automatically) reads `schema.prisma` and writes a typed client into `node_modules/@prisma/client`. This gives methods like `prisma.task.create(...)`, `prisma.task.findMany(...)`, fully typed against the `Task` model.

Prisma 7 also requires an explicit **driver adapter** to actually connect at runtime — this is separate from the CLI config above. `PrismaService` (`src/prisma/prisma.service.ts`) passes one in:

```ts
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  }
  async onModuleInit() { await this.$connect(); }
  async onModuleDestroy() { await this.$disconnect(); }
}
```

Without the adapter, `PrismaClient` throws `PrismaClientInitializationError` on startup — this was discovered by actually booting the app, not just type-checking it.

### Wiring into NestJS

`PrismaModule` (`src/prisma/prisma.module.ts`) is a `@Global()` module that provides and exports `PrismaService`, so any feature module (`TasksModule`, `UsersModule`, future ones) can inject `PrismaService` without re-importing `PrismaModule` everywhere. It's imported once, in `AppModule`.

`OnModuleInit`/`OnModuleDestroy` are NestJS lifecycle hooks:

- `onModuleInit` runs once, after the module's dependencies are resolved — used here to open the database connection explicitly at startup rather than lazily on first query.
- `onModuleDestroy` runs during a graceful shutdown — used here to close the connection cleanly instead of leaving it dangling.

Express equivalent:

- In Express, you'd typically wire up an ORM (Prisma, Sequelize, TypeORM) manually — instantiate a client somewhere, import it into route files, and manage connect/disconnect yourself around server startup/shutdown. NestJS's module system and lifecycle hooks give that a standard, testable place to live.

## Exception Handling

Before this phase, `TasksService` and `UsersService` already threw `NotFoundException`/`ConflictException` directly for the errors they anticipated (missing record, duplicate email, missing referenced user). `BadRequestException` was already happening too, just automatically — the global `ValidationPipe` in `main.ts` throws it for invalid DTO bodies, and `ParseUUIDPipe` throws it for malformed UUID route params. Nothing new was needed for those three.

The gap was **unanticipated** database errors — anything Prisma throws that a service didn't explicitly catch. Two examples found by testing, not by reading the code:

- A concurrent duplicate-email `create` could theoretically race past `UsersService`'s pre-check and still hit Postgres's unique constraint, throwing a raw `Prisma.PrismaClientKnownRequestError` (code `P2002`) that no code was catching.
- Any other unexpected Prisma error (a `P2025` "record not found" from a delete/update race, a connection failure, etc.) would otherwise propagate as an unhandled exception.

NestJS's default behavior for an exception that isn't an `HttpException` is already reasonably safe — it responds with a generic `{ statusCode: 500, message: 'Internal server error' }` rather than echoing the thrown error's message. But that means every unanticipated Prisma error becomes a generic 500, even ones that really should be a 404 or 409 for the client.

### `PrismaExceptionFilter`

`src/common/filters/prisma-exception.filter.ts` is a NestJS **exception filter** — a class that intercepts exceptions thrown anywhere in the request pipeline and controls the HTTP response for them.

```ts
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    // map exception.code (P2002, P2003, P2025, ...) to the right HttpException,
    // log the real error server-side, and send only the safe, mapped message.
  }
}
```

- `@Catch(Prisma.PrismaClientKnownRequestError)` means this filter only runs for that one exception type — it does not interfere with `NotFoundException`, `ConflictException`, or anything else already thrown deliberately.
- It maps known Prisma error codes to the right NestJS exception (`P2002` unique constraint → `ConflictException`, `P2003` foreign key violation → `NotFoundException`, `P2025` record not found → `NotFoundException`), and anything unrecognized → a generic `InternalServerErrorException`.
- It logs the real error (code + message) via NestJS's `Logger` before responding, so the detail isn't lost — it just never reaches the client.
- It's registered once, globally, in `main.ts`: `app.useGlobalFilters(new PrismaExceptionFilter())`.

This is a safety net, not a replacement for the explicit checks already in `UsersService`/`TasksService` — those still run first and produce more precise messages (e.g. "User with email x already exists" instead of the filter's generic "A record with this value already exists"). The filter only fires for whatever those checks didn't anticipate.

### Testing an exception filter

`prisma-exception.filter.spec.ts` unit-tests the `catch()` method directly: build a fake `ArgumentsHost` whose `getResponse()` returns a mocked `{ status, json }` object, call `filter.catch(error, host)`, and assert what `status`/`json` were called with. This proves the mapping logic (which code → which status/message) without needing HTTP or Prisma to actually run.

`prisma-exception.filter.integration.spec.ts` goes one level up: it boots a real (throwaway) NestJS app with one controller whose routes deliberately throw Prisma errors, registers the filter with `app.useGlobalFilters(...)` exactly like `main.ts` does, and sends real HTTP requests to it with `supertest`. This is the test that actually proves the filter is wired up correctly — a unit test of `catch()` alone wouldn't catch a mistake in *how* the filter gets registered. It also directly asserts that a raw Prisma message containing a password/connection string never appears in the JSON response, which is the actual "don't leak internal database errors" requirement.

Express equivalent:

- In Express there's no built-in exception filter concept — this is usually a `(err, req, res, next)` error-handling middleware registered last, and you'd write the same code/status mapping by hand.

## Logging

NestJS ships a built-in `Logger` class (`import { Logger } from '@nestjs/common'`) instead of requiring a third-party library for basic logging. It's what prints the familiar `[Nest] 12345  - ... LOG [InstanceLoader] ...` lines every time the app boots.

### Log levels

`Logger` has one method per level: `log` (general info), `warn` (something notable but not broken), `error` (something failed), `debug`, and `verbose`. This project uses two of them deliberately:

- **`log`** for operations that succeeded — a resource was created, updated, or deleted. These are the normal, expected outcomes of a request.
- **`warn`** for anticipated failure paths — a task/user wasn't found, a duplicate email was rejected. These aren't bugs (the code handled them correctly and threw the right exception), but they're worth a lower-severity note in the logs, distinct from actual application errors.
- **`error`** is reserved for genuinely unexpected problems — this is what `PrismaExceptionFilter` (see "Exception Handling" above) already uses for Prisma errors nobody anticipated.

### Per-operation logging in the services

Each mutating method in `TasksService`/`UsersService` now has its own `private readonly logger = new Logger(TasksService.name)` (or `UsersService.name`), and logs right after the operation succeeds, or right before throwing on an anticipated failure:

```ts
const task = await this.prisma.task.create({ ... });
this.logger.log(`Created task id=${task.id} userId=${task.userId}`);
```

The context passed to `new Logger(...)` (the class name) becomes the bracketed tag shown in every log line from that service — e.g. `[TasksService]` — which is how you tell at a glance which part of the app produced a given line.

**Deliberate choice: log ids, never emails.** Every log line uses `id=...`, never the user's name or email address, even though the code has that data on hand. `TaskStatus`/other enum values are logged since they're not personal data. This isn't just about "passwords/tokens/secrets" (the checklist's literal wording) — it's a slightly stricter, safer default: log the minimum needed to correlate a request to a record (its id), and leave any actual PII out of the logs entirely. If someone needs to know *which* email caused a conflict, that's exactly what the 409 response body already tells the caller — the log doesn't need to repeat it.

### `LoggingInterceptor`: HTTP-level logging

Per-operation logs inside services tell you *what happened*; they don't tell you *what the client actually got back* (status code, timing) for requests that don't reach a service at all — like a `400` from `ValidationPipe` on bad input. `src/common/interceptors/logging.interceptor.ts` is a NestJS **interceptor** — code that wraps every request/response — added to log exactly that, for every request, regardless of which controller/service handled it:

```ts
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const start = Date.now();

    response.on('finish', () => {
      this.logger.log(`${request.method} ${request.originalUrl} ${response.statusCode} +${Date.now() - start}ms`);
    });

    return next.handle();
  }
}
```

The tricky part: at the moment an interceptor's handler observable emits a value (or errors), NestJS hasn't necessarily written the real HTTP response yet — the actual status code isn't final until Nest (or an exception filter) calls `response.status(...)`. Logging `response.statusCode` too early would show a stale/default value. Instead, this interceptor listens to the raw Express response's `'finish'` event, which fires only once headers have actually been sent — by then, `response.statusCode` is guaranteed correct whether the request succeeded, failed validation, or was caught by `PrismaExceptionFilter`. It's registered once, globally, in `main.ts`: `app.useGlobalInterceptors(new LoggingInterceptor())`.

### Testing logging

- `logging.interceptor.spec.ts` mocks `Logger.prototype.log` and a fake Express response built from Node's real `EventEmitter` (so `.on('finish', ...)` behaves exactly like the real thing), then manually calls `response.emit('finish')` to prove the log line only fires once the response actually completes — and never fires before that.
- A recurring gotcha caught while writing these tests: `jest.spyOn(Logger.prototype, 'log')` called again in a later test's `beforeEach` **reuses the same spy** instead of creating a fresh one (Jest detects the method is already mocked), so call counts silently leak across tests unless `jest.restoreAllMocks()` runs in `afterEach`. Both `logging.interceptor.spec.ts` and `prisma-exception.filter.spec.ts` now do this.

Express equivalent:

- Express projects typically reach for `morgan` (HTTP request logging middleware) plus `winston`/`pino` for application-level logging. NestJS's built-in `Logger` covers the same ground without an extra dependency, and interceptors/lifecycle hooks give you the same "wrap every request" capability that `morgan` provides as middleware.

## Health Check

`GET /health` exists to answer one question automated systems ask constantly: "is this instance safe to send traffic to?" A load balancer, a Kubernetes readiness probe, or a deploy script all poll this instead of guessing from application logs.

### What a health check actually proves — and what it doesn't

Responding at all already proves the process is alive and the HTTP stack works. It does **not** prove any of the app's real dependencies work — a process can be "up" while its database is completely unreachable, and every real request would still fail. That's why this endpoint checks two things, not one:

- **App liveness** (`AppHealthIndicator`) — always reports `up` with `process.uptime()`. This is intentionally trivial: if the process can run this code at all, it's alive. It exists mainly so the response visibly reports "application health" (the spec's literal wording), not because it can ever meaningfully fail on its own.
- **Database connectivity** (`PrismaHealthIndicator`) — runs `prisma.$queryRaw\`SELECT 1\`` against the real database. This is the check that actually matters: it proves the connection pool, credentials, and network path to Postgres all work right now, not just at startup.

**Known limitation, worth stating plainly:** `PrismaService.onModuleInit()` calls `$connect()` during app bootstrap. If Postgres is unreachable *at startup*, the app fails to start entirely — `/health` never gets a chance to report `down`, because there's no running process to ask. This endpoint only helps once the app is already running and the database disappears afterward (a restart, a network blip, a crashed container) — which is still the far more common real-world failure mode, but it's not total dependency coverage.

### `@nestjs/terminus`

Terminus is NestJS's official health-check package. `HealthCheckService.check([...])` runs a list of indicator functions concurrently and assembles Terminus's standard response shape:

```json
{ "status": "ok", "info": {...up indicators...}, "error": {...down indicators...}, "details": {...everything...} }
```

If anything is `down`, `status` becomes `"error"` and the HTTP status becomes **503** automatically (Terminus throws a `ServiceUnavailableException` internally) — no manual status-code logic was written for this.

### Why a custom Prisma indicator, not Terminus's built-in one

Terminus ships a `PrismaHealthIndicator.pingCheck(...)`, but it's designed Mongo-first: it calls `$runCommandRaw({ ping: 1 })` and only falls back to a SQL `SELECT 1` by pattern-matching the *text* of the error message it gets back. That's fragile against this project's Prisma 7 + `@prisma/adapter-pg` client, where error text isn't guaranteed to match what the built-in indicator expects. Writing a ~20-line custom indicator using Terminus's current function-based API (`HealthIndicatorService.check(key).up()/.down()`) is more robust and, per the spec's own goal, forces understanding what the check is actually doing instead of trusting a black box.

The custom indicator also does two things deliberately, both patterns already established in this project:
- **Never leaks the raw error.** A dead database throws a `PrismaClientInitializationError`/similar whose message can contain host/user details. The indicator logs the real error via `Logger` (server-side only) and returns a static `'Database connectivity check failed'` string to the client — the exact same discipline as `PrismaExceptionFilter` (Phase 11).
- **Has its own timeout** (3 seconds, via a `Promise.race`-style wrapper). Without one, a hung TCP connection attempt would make `/health` hang indefinitely instead of reporting `down` quickly — worse than a fast failure for anything polling this endpoint.

### Graceful shutdown: `app.enableShutdownHooks()`

Added in `main.ts` (and later folded into the shared `app.setup.ts`). Without this call, NestJS lifecycle hooks like `PrismaService.onModuleDestroy()` (`$disconnect()`) never run when the process receives `SIGTERM` — the process just dies mid-connection. This directly serves the spec's "graceful application startup/shutdown" objective, and matters even more once the app runs in Docker (Phase 16), where `docker stop` sends `SIGTERM` and expects a clean exit.

### Testing

`prisma.health-indicator.spec.ts` mocks `PrismaService.$queryRaw` directly (resolves → `up`; rejects → `down`; never resolves → times out and reports `down`) and — following the same discipline as the code itself — asserts the returned result never contains the raw thrown error text. `health.controller.spec.ts` checks the controller wires exactly two indicator functions into `HealthCheckService.check(...)`.

Verified for real: booted the app against the dev Postgres container (`GET /health` → 200), stopped the container (`GET /health` → 503, `error.database.status: "down"`, response grepped for leaked details — none), restarted the container **without restarting the app** and confirmed recovery to 200 — proving the check is live, not cached at startup.

Express equivalent:

- Express has no standard health-check module; teams typically hand-roll a route (`app.get('/health', ...)`) or use a package like `express-healthcheck`. Terminus gives the same idea a standard response shape and automatic status-code handling.

## Swagger / OpenAPI

Swagger UI is a browsable, interactive page generated from an OpenAPI document — a machine-readable description of every route, its parameters, its request/response shapes, and its status codes. `@nestjs/swagger` builds that document from decorators already sitting on the DTOs and controllers, rather than a hand-maintained YAML/JSON file living separately from the code (the classic Express approach, and the classic way API docs silently go stale).

### Wiring it up

`main.ts` builds a `DocumentBuilder` (title/description/version/tags) and calls `SwaggerModule.createDocument(app, config)` to produce the OpenAPI document, then `SwaggerModule.setup('docs', app, document, {...})` mounts both the interactive UI (`/docs`) and the raw JSON (`/docs/json`). `/docs` was chosen over the more common `/api` specifically because this app's real resources (`/users`, `/tasks`, `/health`) sit at the root with no global prefix — `/api` would read like a resource namespace and collide the moment a `setGlobalPrefix('api')` gets added later.

### A real bug this phase caught: `PartialType`/`OmitType` import source matters

`UpdateUserDto`/`UpdateTaskDto` were built with `PartialType`/`OmitType` from `@nestjs/mapped-types` (Phase 5/2). That package copies `class-validator` metadata correctly but **silently drops `@ApiProperty` metadata** — so before this phase's fix, Swagger would have rendered both DTOs as an empty `{}` schema, telling API consumers nothing about what fields a `PATCH` request actually accepts. `@nestjs/swagger` exports its *own* `PartialType`/`OmitType` that copy both kinds of metadata. The fix was a one-line import change in each file — verified concretely, not just assumed, by checking `.components.schemas.UpdateUserDto.properties` in the generated JSON actually has content.

### Documenting responses without changing runtime behavior

Controllers return raw Prisma model objects (`User`, `Task`) directly — there was never a separate "response DTO" layer, and this phase didn't add one at runtime. But Swagger can't introspect Prisma's generated types (they're not decorated with `@ApiProperty`), so documenting a response type needs *something*. The fix: thin classes like `UserResponseDto implements User` that exist purely for `@ApiResponse({ type: UserResponseDto })` to point at — never instantiated, never returned by any controller. The `implements User` clause is the important bit: if `schema.prisma` ever adds/renames a field, `tsc` fails to compile until the response DTO is updated too, so the documented shape can't silently drift from reality the way a hand-written, undeclared copy could.

Enums (`TaskStatus`, `TaskPriority`, `TaskSortBy`, `SortOrder`) get both `enum:` (the actual values) and `enumName:` (e.g. `'TaskStatus'`) in their `@ApiProperty`/`@ApiPropertyOptional` options — `enumName` is what makes Swagger emit one reusable `TaskStatus` schema component instead of inlining the same list of values into every DTO that uses it, confirmed by checking `TaskStatus` appears once under `components.schemas` rather than duplicated per-DTO.

`ValidationErrorResponseDto` (400s) is a separate class from `ErrorResponseDto` (404/409s) because `ValidationPipe` returns `message` as an **array** of one string per failed field, while the exceptions thrown directly by services (`NotFoundException`, `ConflictException`) return `message` as a single string. Documenting them with one shared class would misdescribe one or the other.

### Query DTOs need no extra decorators on the controller

`TaskQueryDto`'s fields are annotated with `@ApiPropertyOptional`, and because the route handler receives it via `@Query() query: TaskQueryDto`, Swagger automatically explodes each property into its own documented query parameter — no `@ApiQuery()` decorators needed on `TasksController` itself. Confirmed by checking the generated JSON: `GET /tasks` lists all seven query params (`page`, `limit`, `status`, `priority`, `search`, `sortBy`, `sortOrder`) with their types/defaults/min/max, straight from the DTO.

### Verifying documentation, not just trusting the decorators compiled

Adding `@ApiProperty` decorators that type-check doesn't guarantee Swagger renders what you intended — the only real proof is reading the generated document. This phase's verification fetched `/docs/json` and asserted on it directly with `jq`: exact path list, exact response-code list per route (`POST /users` → `201/400/409`; `PATCH /tasks/:id` → `200/400/404`, deliberately no `409` since `Task` has no unique constraint), `UpdateUserDto`'s properties being non-empty, and `GET /tasks`'s 200 response resolving to a `$ref` for `TaskListResponseDto` rather than an untyped object.

Express equivalent:

- Express projects typically either hand-write a `swagger.json`/YAML file and serve it with `swagger-ui-express`, or use `swagger-jsdoc` to generate one from comment blocks above each route. Both approaches keep the documentation in a different place from the code that implements it, which is exactly the drift risk NestJS's decorator-on-the-actual-class approach avoids.

## E2E Tests

Unit tests (`*.spec.ts`, run by plain `npm test`) mock `PrismaService` — they prove a service's *logic* is correct in isolation, fast, with no real database. E2E ("end-to-end") tests are a different layer entirely: they boot the *real* Nest application — real `ValidationPipe`, real `PrismaExceptionFilter`, real `LoggingInterceptor`, real Prisma client — and send real HTTP requests at it with `supertest`, proving the whole stack wired together actually behaves correctly, including things a mocked unit test can't see at all (a real Postgres foreign-key constraint, a real `ValidationPipe` rejecting an unknown field, a real cascade delete).

### A bug this phase fixed just by trying to write it: `dist/src/main.js`

Before this phase, `npm run start:prod` ran `node dist/main` — but `nest build` was actually emitting `dist/src/main.js`, not `dist/main.js`. This had gone unnoticed because local development always used `nest start` (which auto-detects the correct nested path as a fallback), and nothing had tried `start:prod` yet. The real cause: `tsconfig.build.json` had no `include`, so TypeScript inferred the common root of all compiled files as the *project root* (since `prisma.config.ts` at the repo root was also being swept into the build), nesting everything under `dist/src/` to preserve relative structure. Adding `"include": ["src/**/*"]` to `tsconfig.build.json` scopes the build to just `src/`, which both fixes `dist/main.js` and stops `prisma.config.ts` from being needlessly compiled into `dist/` (it's read directly by the Prisma CLI via `ts-node`-style loading, never from a compiled `dist` copy). This mattered for this phase specifically because a working `dist/main.js` is what the eventual Docker `CMD` depends on.

### Extracting `src/app.setup.ts`

`main.ts` used to inline every global registration (`ValidationPipe`, `PrismaExceptionFilter`, `LoggingInterceptor`, `enableShutdownHooks`) directly in `bootstrap()`. E2E tests need that *exact* same configuration applied to the app they boot in-process — otherwise a test asserting a 400 for bad input would actually get a 500 or worse, because there'd be no `ValidationPipe` at all. `configureApp(app: INestApplication)` in `src/app.setup.ts` is the one shared place both `main.ts` and `test/utils/test-app.ts` call. Swagger setup deliberately stayed in `main.ts` only — regenerating a full OpenAPI document for every E2E test run would be pure overhead with no test value.

### Test database strategy: a second database, not a second container

E2E tests need a real Postgres to hit, but they also **truncate tables between every test** — running them against the same database used for manual `curl` testing during development would be actively destructive. The chosen approach: a second logical database, `task_management_api_test`, living on the *same* dev Postgres container (`docker-compose.development.yml`) that already exists for local development — not a whole separate container. Reasoning: dev/test isolation is a database-level concern, not a process-level one, and this machine's host ports 5432/5433 were already both taken by unrelated Postgres containers, making yet another container annoying to place.

Two new Jest hooks make this self-managing:
- **`globalSetup`** (`test/setup/global-setup.ts`) runs once, in Jest's main process, before any test file. It connects to Postgres's own `postgres` maintenance database via the `pg` client (a real dependency already, no new package), checks whether `task_management_api_test` exists, creates it if not, then shells out to `prisma migrate deploy` (not `migrate dev` — no interactive prompts, no drift-triggered resets, matching how a CI pipeline would apply migrations to a real environment).
- **`setupFiles`** (`test/setup/load-test-env.ts`) runs inside *every Jest worker*, before any module import. This is required because `PrismaService`'s constructor reads `process.env.DATABASE_URL` directly (never through `ConfigService` — see the Prisma section above), so the env var must already be correct before `AppModule` is ever imported. `globalSetup` alone wouldn't guarantee this — it runs in a separate process from the workers that actually run the tests.
- The single most load-bearing line in the whole setup: `load-test-env.ts` **throws if the resolved `DATABASE_URL` doesn't end in a database name ending in `_test`**. Without this guard, any misconfiguration (a stale `.env.test`, a typo) would silently point the per-test `TRUNCATE` at the real development database.

### Test isolation: truncate, don't recreate

Each spec file's `beforeAll` creates **one** app instance (and one Prisma connection pool) for the whole file; `beforeEach` runs a single `TRUNCATE TABLE "Task", "User" RESTART IDENTITY CASCADE` (the double quotes matter — Postgres table names are case-sensitive here because Prisma created them with PascalCase). This is a deliberate departure from the original `test/app.e2e-spec.ts` boilerplate pattern (which created a fresh app in every `beforeEach`) — with a real database behind it, creating a new Prisma connection pool for every single test would mean dozens of connect/disconnect cycles per run, which is slow and needlessly connection-hungry. Truncating achieves the same "every test starts from a clean slate" guarantee far more cheaply. `jest-e2e.json` also sets `maxWorkers: 1` — with a shared database, two spec files truncating concurrently could wipe out data the other file's test just set up.

### Coverage

`test/users.e2e-spec.ts` and `test/tasks.e2e-spec.ts` cover the spec's exact required flow (create → get → update → complete → delete for tasks; create → get → update → delete for users) plus: validation 400s (missing/invalid fields, bad enum values, malformed UUIDs — both in the body and in route params), 404s (missing resources, and specifically `POST /tasks` with a well-formed but non-existent `userId`, which exercises the `P2003`-to-`NotFoundException` mapping from Phase 9), 409s (case-insensitive duplicate email, both on create and on update), and the cascade-delete interaction from Phase 9 (deleting a user deletes their tasks too — verified here against a real foreign key, not a mock).

A real bug this phase's own tests caught (in the test, not the app): a "sorts and paginates" test initially asserted the wrong task would appear on page 2 of an alphabetically-sorted list — it's a good example of why running the assertion against a real database matters even for test *authoring*, not just the code under test.

Express equivalent:

- Supertest is framework-agnostic and works identically with a plain Express app — the difference here is entirely in how the *app under test* gets built: `moduleFixture.createNestApplication()` mirrors Nest's own DI-driven bootstrap, whereas an Express E2E test just imports the exported `app` object directly.

## Docker

Containerizing the app means packaging it (and, separately, its database) as portable, self-contained images that run identically regardless of the host machine — no "works on my machine because I have Node 24 and you have Node 18" problems.

### Multi-stage builds

The `Dockerfile` has four stages, and the reason for splitting them is caching and final image size, not just organization:

- `deps` installs **all** dependencies (including dev) — needed to compile TypeScript and run `prisma generate`, but this stage's `node_modules` never ships in the final image.
- `builder` (from `deps`) copies source, runs `prisma generate` and `nest build`. This is where compilation happens, inside a real Linux environment — not copied in from the host, which matters because native/platform-specific artifacts (Prisma's generated client, in this case) need to match the container's OS, not the developer's laptop.
- `prod-deps` installs only production dependencies (`npm ci --omit=dev`) — a separate, smaller `node_modules` than `builder`'s.
- `runner` (the actual image that ships) copies only what's needed to *run* the app: `prod-deps`'s `node_modules`, `builder`'s compiled `dist/`, and one specific extra piece — see below.

None of the TypeScript compiler, ESLint, Jest, or the Prisma CLI ends up in the final image — they're all `builder`/`deps`-only tools, never copied into `runner`.

### A subtle Prisma + Docker gotcha: what `--omit=dev` actually leaves behind

`prisma`, the CLI package, is a devDependency — `npm ci --omit=dev` correctly excludes it. But the *generated Prisma Client code* (produced by `prisma generate`, which only the `builder` stage ever runs) lives in `node_modules/.prisma/client/`, a directory `npm install` never creates on its own. `node_modules/@prisma/client/default.js` is literally just `module.exports = { ...require('.prisma/client/default') }` — a re-export. So a naive `runner` stage built only from a `--omit=dev` install would have `@prisma/client` installed but pointing at nothing, and would crash on the first import. The fix: explicitly `COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma` into the runtime image, alongside the production `node_modules`. This was verified concretely — `docker run --rm <image> node -e "require('@prisma/client')"` — rather than assumed.

### Why `binaryTargets` never came up

Prisma has historically needed a `binaryTargets` entry in `schema.prisma` when building on one OS (e.g. a Mac) for another (Linux, inside Docker), because Prisma's query engine used to be a compiled Rust binary specific to an OS/libc combination. This project's Prisma 7 + `@prisma/adapter-pg` setup uses a **WASM query compiler** instead (confirmed by checking `node_modules/.prisma/client/` — it contains a `.wasm` file, no `.node` binary anywhere). WASM is platform-independent, so there's nothing to cross-compile. The only remaining platform-specific piece is the **schema engine** (used by `prisma migrate`/`generate` themselves, never at runtime) — and since the whole Docker build happens *inside* the Linux build stage, it downloads the correct Linux binary automatically at `npm install` time. Nothing to configure.

### Base image choice, and a warning worth heeding

`node:24-bookworm-slim` (Debian-based) rather than an Alpine image — mainly because the **schema engine** (used by the `migrate` service) still benefits from glibc's better-tested path, and Prisma explicitly warned about it during the first build attempt: `bookworm-slim` doesn't ship OpenSSL by default, and Prisma's schema engine probes for it to detect compatibility. Ignoring the warning wouldn't have broken anything immediately, but it was a real signal — `RUN apt-get install -y openssl` in the base stage removed it, at the cost of a few MB.

### Why migrations run as their own compose service

The `migrate` service builds from the `builder` stage (not `runner`) and runs `prisma migrate deploy`, then exits. It has to use `builder`, not the slim runtime image, because both the `prisma` CLI and `dotenv` (which `prisma.config.ts` imports) are devDependencies — entirely absent from the pruned production `node_modules`. `docker-compose.yml` sequences this with `depends_on: { postgres: { condition: service_healthy } }` and the `api` service additionally waits on `depends_on: { migrate: { condition: service_completed_successfully } }` — so the app container never starts against a database that hasn't been migrated yet.

### A real incident: two compose files sharing an implicit project silently swapped containers

The first time `docker compose up` ran for the new `docker-compose.yml`, it printed `Container task-management-api-postgres-dev Recreate` — a container name that new file never even mentions. What happened: neither `docker-compose.yml` nor the pre-existing `docker-compose.development.yml` declared an explicit Compose **project name**, so both defaulted to the same one (derived from the directory name, `task-management-api`). Compose's reconciliation logic tracks "which container belongs to which service" primarily via `(project, service-name)` labels — and both files happen to name their Postgres service `postgres`. Docker Compose concluded the two files described the *same* service and **replaced one container with the other** every time either file's `up` ran, regardless of their different explicit `container_name` values. The dev Postgres container briefly disappeared entirely from `docker ps -a`.

No data was actually lost — the named data volume (`postgres_dev_data`) survived independently of the container — but it was a genuine near-miss, caught immediately by checking `docker ps -a` and the container's actual database contents (all three prior migrations, with their original timestamps, were still there) rather than assuming things were fine. The fix has two parts, both necessary:
1. Both compose files now declare an explicit top-level `name:` (`task-management-api-dev` and `task-management-api-full-stack`), so Compose never again considers them the same project.
2. `docker-compose.development.yml`'s volume is now declared `external: true` with an explicit `name:` pinned to its actual current volume name. This matters because Compose normally prefixes a declared volume's name with the project name — so simply adding a *different* project name, without also pinning the volume, would have made Compose look for a volume that doesn't exist and silently create a fresh, empty one instead of reattaching to the real data.

The lesson: multiple Compose files in the same repo/directory need explicit, distinct project names from the start — relying on the directory-derived default is only safe when there's just one.

Express equivalent:

- There's no Express-specific parallel here — this is purely a Docker Compose mechanic. Any multi-compose-file setup (Express, NestJS, or otherwise) in the same directory needs the same explicit `name:` discipline.

## The Full Request Lifecycle

Every piece above (`ValidationPipe`, `PrismaExceptionFilter`, `LoggingInterceptor`, controllers, services) has been explained individually as it was introduced. Here's how a single real request actually flows through all of them together, using `PATCH /tasks/:id` as a concrete example — NestJS's full request pipeline, in the order things really run:

```text
1. Middleware        — none custom in this app (no cookie parsing, no custom auth header
                         checks — there's no authentication at all, see "Known limitations").
2. Guards             — none registered. Guards decide *if* a request is allowed to proceed
                         at all (e.g. "is this user logged in?"); this app has no such
                         concept yet, so this step is a no-op here.
3. Interceptors (pre) — LoggingInterceptor.intercept() runs, records the start time, and
                         attaches a `response.on('finish', ...)` listener — it does not
                         block or transform anything yet, it just observes.
4. Pipes              — ParseUUIDPipe validates the `:id` route param is a real UUID (or
                         throws BadRequestException, ending the request here); the global
                         ValidationPipe then validates/transforms the request body against
                         UpdateTaskDto (or throws BadRequestException with one message per
                         invalid field).
5. Controller         — TasksController.update(id, dto) runs, delegates immediately to the
                         service.
6. Service            — TasksService.update() calls this.findOne(id) (throwing
                         NotFoundException if missing), then prisma.task.update(...).
7. Interceptors (post) — LoggingInterceptor's stream continues; nothing to transform, the
                         response value passes through untouched.
8. Response            — Nest serializes the returned Task to JSON and writes the HTTP
                         response.
9. (exception path)    — If anything in steps 4–6 threw, none of steps 5–8 run as written
                         above; instead NestJS's exception handling takes over: known
                         HttpExceptions (BadRequestException, NotFoundException, etc.) are
                         serialized directly; an unhandled Prisma error is caught by the
                         globally-registered PrismaExceptionFilter, mapped to the right
                         status, and only *then* does the response get written.
10. Always-runs        — Regardless of success or failure, once the HTTP response is
                         actually sent, LoggingInterceptor's `'finish'` listener fires and
                         logs the final method/url/status/duration — this is why it's
                         implemented that way (see "Logging" above) rather than inside the
                         normal interceptor success path, which an exception would skip.
```

The key thing this app demonstrates: the lifecycle isn't a fixed, always-identical sequence — it depends on what's actually registered. This app has no middleware and no guards (both no-ops here), but does have global pipes, a global interceptor, and a global exception filter, each doing one clearly separated job.

Express equivalent:

- Express's pipeline is `request → middleware chain → route handler → response`, with no separate concepts for guards/pipes/interceptors/exception filters — everything (auth checks, input validation, error handling) is just more middleware, in whatever order you registered it. NestJS's request lifecycle names each concern so it's unambiguous which layer is responsible for what.
