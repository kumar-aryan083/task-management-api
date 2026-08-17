# Project 1 --- Task Management API

## Purpose

Build a small but properly structured NestJS REST API from an empty
directory.

This project is the foundation for the entire curriculum. The goal is
not feature complexity; the goal is to understand the NestJS programming
model and how it differs from Express.

**Difficulty:** Beginner\
**Architecture:** Single NestJS application\
**Database:** PostgreSQL\
**ORM:** Prisma\
**Testing:** Jest + Supertest\
**Documentation:** Swagger/OpenAPI\
**Deployment:** Docker

------------------------------------------------------------------------

## Learning Objectives

By the end of this project, you must understand:

-   NestJS CLI and project structure
-   Modules
-   Controllers
-   Providers
-   Dependency Injection
-   DTOs
-   Decorators
-   Request lifecycle
-   Pipes
-   Validation
-   Exception handling
-   Configuration
-   Prisma integration
-   PostgreSQL
-   CRUD APIs
-   Pagination
-   Filtering
-   Sorting
-   Logging
-   Swagger
-   Unit tests
-   E2E tests
-   Docker
-   Graceful application startup/shutdown

Do not move to the next project until you can recreate this project
without following a tutorial.

------------------------------------------------------------------------

## Functional Requirements

Build a task management API.

### User

A user can:

-   Create an account
-   View their profile
-   Update their profile
-   Delete their account

### Task

A user can:

-   Create a task
-   View their tasks
-   View one task
-   Update a task
-   Delete a task
-   Mark a task as completed
-   Filter tasks by status
-   Search tasks by title
-   Sort tasks
-   Paginate tasks

### Task fields

At minimum:

-   id
-   title
-   description
-   status
-   priority
-   dueDate
-   userId
-   createdAt
-   updatedAt

Use enums for status and priority.

------------------------------------------------------------------------

## Suggested API

``` text
POST   /users
GET    /users/me
PATCH  /users/me
DELETE /users/me

POST   /tasks
GET    /tasks
GET    /tasks/:id
PATCH  /tasks/:id
DELETE /tasks/:id
PATCH  /tasks/:id/complete
```

Task listing should support:

``` text
?page=1
&limit=20
&status=TODO
&priority=HIGH
&search=nestjs
&sortBy=createdAt
&sortOrder=desc
```

------------------------------------------------------------------------

## NestJS Concepts To Learn

### Modules

Understand:

-   Why modules exist
-   Feature modules
-   Module boundaries
-   `imports`
-   `controllers`
-   `providers`
-   `exports`
-   Global modules and why they should be used sparingly

Create at least:

``` text
AppModule
UsersModule
TasksModule
DatabaseModule
```

### Controllers

Understand:

-   Route decorators
-   HTTP methods
-   Parameters
-   Query parameters
-   Request body
-   HTTP status codes
-   Controller responsibility

Do not put database logic inside controllers.

### Providers

Understand:

-   `@Injectable()`
-   Dependency Injection
-   Constructor injection
-   Provider scope
-   Why DI makes code testable

### DTOs

Create:

``` text
CreateUserDto
CreateTaskDto
UpdateTaskDto
TaskQueryDto
```

Understand the difference between:

``` text
Entity/model
DTO
Response DTO
```

### Validation

Use:

-   `ValidationPipe`
-   class-validator
-   class-transformer

Learn:

-   required fields
-   optional fields
-   enums
-   string length
-   UUID validation
-   date transformation
-   whitelist
-   forbidNonWhitelisted

### Exception Handling

Learn NestJS built-in exceptions:

``` text
BadRequestException
UnauthorizedException
ForbiddenException
NotFoundException
ConflictException
InternalServerErrorException
```

Understand how exceptions propagate.

### Request Lifecycle

You must be able to explain:

``` text
Request
→ middleware
→ guards
→ interceptors
→ pipes
→ controller
→ service
→ response/interceptors
```

Also understand that the exact lifecycle depends on what features are
registered.

------------------------------------------------------------------------

## Database

Use PostgreSQL with Prisma.

Learn:

-   schema design
-   relations
-   migrations
-   Prisma Client
-   transactions
-   indexes
-   unique constraints
-   foreign keys
-   pagination
-   filtering

Add indexes where justified.

Do not blindly index every column.

------------------------------------------------------------------------

## Architecture

Use a feature-oriented structure such as:

``` text
src/
  app.module.ts
  main.ts

  common/
    filters/
    interceptors/
    pipes/
    decorators/

  database/
    database.module.ts
    prisma.service.ts

  users/
    users.module.ts
    users.controller.ts
    users.service.ts
    dto/

  tasks/
    tasks.module.ts
    tasks.controller.ts
    tasks.service.ts
    dto/

  health/
```

Do not introduce unnecessary repositories, abstractions, or generic CRUD
frameworks.

------------------------------------------------------------------------

## Health Check

Add:

``` text
GET /health
```

It should report application health and database connectivity.

Use this project to understand what a health endpoint is actually
checking.

------------------------------------------------------------------------

## Logging

Implement structured application logging.

Every important operation should be diagnosable.

Learn:

-   Nest Logger
-   log levels
-   useful context
-   avoiding passwords/tokens/secrets in logs

------------------------------------------------------------------------

## Swagger

Expose OpenAPI documentation.

Document:

-   endpoints
-   DTOs
-   parameters
-   responses
-   status codes

Learn why API documentation is part of backend engineering.

------------------------------------------------------------------------

## Testing

### Unit tests

Test at least:

-   TasksService create
-   TasksService find
-   TasksService update
-   TasksService delete
-   validation/error paths

Mock Prisma at the unit-test boundary.

### E2E tests

Test:

``` text
Create user
Create task
Get task
Update task
Complete task
Delete task
```

Also test invalid input and missing resources.

------------------------------------------------------------------------

## Docker

Create a Docker setup that can run:

``` text
NestJS application
PostgreSQL
```

Use environment variables.

Understand:

-   Dockerfile
-   Docker Compose
-   container networking
-   health checks
-   production vs development configuration

------------------------------------------------------------------------

## Manual Build Process

The coding agent must NOT simply generate the entire project.

Work in these stages:

### Stage 1 --- Setup

Manually initialize:

-   Node project
-   NestJS CLI/project
-   TypeScript
-   linting/formatting
-   environment configuration

Explain every generated file.

### Stage 2 --- First Module

Build `TasksModule` manually.

Explain:

-   module
-   controller
-   provider
-   DI

### Stage 3 --- Validation

Add DTOs and global validation.

Explain every decorator.

### Stage 4 --- Database

Set up PostgreSQL and Prisma.

Explain schema, migration, generated client, and relation handling.

### Stage 5 --- CRUD

Implement one endpoint at a time.

### Stage 6 --- Cross-cutting concerns

Add:

-   exceptions
-   logging
-   interceptors
-   health checks

### Stage 7 --- Documentation and tests

Add Swagger, unit tests, and E2E tests.

### Stage 8 --- Docker

Containerize the application.

------------------------------------------------------------------------

## Coding Agent Rules

The coding agent must:

1.  Explain the concept before implementing it.
2.  Explain why NestJS provides the concept.
3.  Explain the Express equivalent where useful.
4.  Make changes in small stages.
5.  Show the files it plans to change before changing them.
6.  Never silently introduce a library.
7.  Explain every dependency.
8.  Prefer NestJS conventions over custom abstractions.
9.  Run tests after meaningful changes.
10. Fix failures rather than hiding them.
11. Never put secrets in source control.
12. Never generate a giant project in one step.
13. Ask for confirmation only when a decision genuinely changes
    architecture.
14. Maintain a running `LEARNING_NOTES.md` explaining concepts learned.

------------------------------------------------------------------------

## Definition of Done

You are done when you can explain without notes:

-   What a NestJS module is
-   What a provider is
-   How DI works
-   How controllers differ from services
-   Why DTOs exist
-   How validation works
-   How exceptions work
-   How Prisma is injected
-   How the request lifecycle works
-   How to write unit and E2E tests
-   How to containerize the app

Then rebuild the core API from scratch.
