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
- `src/tasks/task-status.enum.ts`: allowed task status values.
- `src/tasks/task-priority.enum.ts`: allowed task priority values.

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
- `UsersService`: temporary in-memory user storage and user business logic.
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
- For now, the most recently created user becomes the temporary current user.
- `/users/me` reads, updates, or deletes that temporary current user.
- This keeps the beginner API moving without adding guards, JWTs, sessions, or passwords too early.

Why this is temporary:

- A real API should not decide the current user from the most recently created user.
- Later projects or phases can introduce authentication properly.
- When Prisma is added, users will be stored in PostgreSQL instead of an in-memory array.

Validation rules:

- `name` must be a non-empty string.
- `name` has a maximum length of 100 characters.
- `email` must be a valid email address.
- `email` has a maximum length of 255 characters.

Error behavior:

- Creating a user with an existing email throws `ConflictException`.
- Reading, updating, or deleting `/users/me` with no temporary current user throws `NotFoundException`.

Express equivalent:

- In Express, user routes would usually live in a user router file.
- Validation would usually happen through middleware or explicit schema parsing.
- The router would manually call service functions for create, read, update, and delete behavior.

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
- Two enums, `TaskStatus` and `TaskPriority`, matching the existing `task-status.enum.ts`/`task-priority.enum.ts` values exactly, so the database only ever stores known values.
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

### What's still in-memory

`TasksService` and `UsersService` still use plain in-memory arrays — Prisma is wired up and verified (a real create/read/delete round-trip against the dev Postgres container was tested), but the services themselves haven't been switched over to call `PrismaService` yet. That's Phases 8 and 9.

Express equivalent:

- In Express, you'd typically wire up an ORM (Prisma, Sequelize, TypeORM) manually — instantiate a client somewhere, import it into route files, and manage connect/disconnect yourself around server startup/shutdown. NestJS's module system and lifecycle hooks give that a standard, testable place to live.
