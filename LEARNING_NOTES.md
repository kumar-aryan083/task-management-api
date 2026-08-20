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
