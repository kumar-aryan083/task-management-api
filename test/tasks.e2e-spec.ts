import request from 'supertest';
import {
  body,
  createTaskPayload,
  createTestApp,
  createUserPayload,
  resetDatabase,
  TaskBody,
  TaskListBody,
  TestApp,
  UserBody,
} from './utils/test-app';

describe('Tasks (e2e)', () => {
  let testApp: TestApp;

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase(testApp.prisma);
  });

  afterAll(async () => {
    await testApp.app.close();
  });

  function server() {
    return testApp.app.getHttpServer();
  }

  async function createUser(): Promise<string> {
    const response = await request(server())
      .post('/users')
      .send(createUserPayload())
      .expect(201);

    return body<UserBody>(response).id;
  }

  it('full lifecycle: create -> get -> update -> complete -> delete -> 404 after delete', async () => {
    const userId = await createUser();

    const created = await request(server())
      .post('/tasks')
      .send(createTaskPayload(userId, { title: 'Learn NestJS' }))
      .expect(201);

    const createdTask = body<TaskBody>(created);
    expect(createdTask).toMatchObject({
      title: 'Learn NestJS',
      status: 'TODO',
      priority: 'MEDIUM',
      userId,
    });
    const taskId = createdTask.id;

    await request(server()).get(`/tasks/${taskId}`).expect(200);

    const updated = await request(server())
      .patch(`/tasks/${taskId}`)
      .send({ title: 'Learn NestJS deeply' })
      .expect(200);
    expect(body<TaskBody>(updated).title).toBe('Learn NestJS deeply');

    const completed = await request(server())
      .patch(`/tasks/${taskId}/complete`)
      .expect(200);
    expect(body<TaskBody>(completed).status).toBe('DONE');

    await request(server()).delete(`/tasks/${taskId}`).expect(200);

    await request(server()).get(`/tasks/${taskId}`).expect(404);
  });

  it('GET /tasks returns the pagination envelope', async () => {
    const userId = await createUser();
    await request(server())
      .post('/tasks')
      .send(createTaskPayload(userId))
      .expect(201);

    const response = await request(server()).get('/tasks').expect(200);
    const list = body<TaskListBody>(response);

    expect(Array.isArray(list.items)).toBe(true);
    expect(list).toMatchObject({
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    });
  });

  it('filters by status and priority', async () => {
    const userId = await createUser();
    await request(server())
      .post('/tasks')
      .send(
        createTaskPayload(userId, {
          title: 'Low priority todo',
          status: 'TODO',
          priority: 'LOW',
        }),
      )
      .expect(201);
    const matching = await request(server())
      .post('/tasks')
      .send(
        createTaskPayload(userId, {
          title: 'High priority done',
          status: 'DONE',
          priority: 'HIGH',
        }),
      )
      .expect(201);

    const response = await request(server())
      .get('/tasks')
      .query({ status: 'DONE', priority: 'HIGH' })
      .expect(200);

    const list = body<TaskListBody>(response);
    expect(list.items).toHaveLength(1);
    expect(list.items[0].id).toBe(body<TaskBody>(matching).id);
  });

  it('searches by title case-insensitively', async () => {
    const userId = await createUser();
    const matching = await request(server())
      .post('/tasks')
      .send(createTaskPayload(userId, { title: 'Learn NestJS pipes' }))
      .expect(201);
    await request(server())
      .post('/tasks')
      .send(createTaskPayload(userId, { title: 'Write Docker notes' }))
      .expect(201);

    const response = await request(server())
      .get('/tasks')
      .query({ search: 'NESTJS' })
      .expect(200);

    const list = body<TaskListBody>(response);
    expect(list.items).toHaveLength(1);
    expect(list.items[0].id).toBe(body<TaskBody>(matching).id);
  });

  it('sorts and paginates', async () => {
    const userId = await createUser();
    // Alphabetically: A task, B task, C task. With limit=1, page 2 (asc by
    // title) is the *second* alphabetical item — "B task" — regardless of
    // creation order.
    const bTask = await request(server())
      .post('/tasks')
      .send(createTaskPayload(userId, { title: 'B task' }))
      .expect(201);
    await request(server())
      .post('/tasks')
      .send(createTaskPayload(userId, { title: 'A task' }))
      .expect(201);
    await request(server())
      .post('/tasks')
      .send(createTaskPayload(userId, { title: 'C task' }))
      .expect(201);

    const response = await request(server())
      .get('/tasks')
      .query({ page: 2, limit: 1, sortBy: 'title', sortOrder: 'asc' })
      .expect(200);

    const list = body<TaskListBody>(response);
    expect(list).toMatchObject({ page: 2, limit: 1, total: 3, totalPages: 3 });
    expect(list.items[0].id).toBe(body<TaskBody>(bTask).id);
  });

  it('POST /tasks returns 404 when userId does not reference an existing user', () => {
    return request(server())
      .post('/tasks')
      .send(createTaskPayload('7354d194-9a22-4865-8128-cc0fb0b33267'))
      .expect(404);
  });

  it('POST /tasks returns 400 for missing title', async () => {
    const userId = await createUser();

    return request(server()).post('/tasks').send({ userId }).expect(400);
  });

  it('POST /tasks returns 400 for an invalid status enum', async () => {
    const userId = await createUser();

    return request(server())
      .post('/tasks')
      .send(createTaskPayload(userId, { status: 'BOGUS' }))
      .expect(400);
  });

  it('POST /tasks returns 400 for an invalid dueDate', async () => {
    const userId = await createUser();

    return request(server())
      .post('/tasks')
      .send(createTaskPayload(userId, { dueDate: 'yesterday' }))
      .expect(400);
  });

  it('POST /tasks returns 400 for a malformed userId', () => {
    return request(server())
      .post('/tasks')
      .send(createTaskPayload('not-a-uuid'))
      .expect(400);
  });

  it('GET /tasks/:id returns 400 for a malformed id', () => {
    return request(server()).get('/tasks/not-a-uuid').expect(400);
  });

  it('GET /tasks?status=BOGUS returns 400', () => {
    return request(server())
      .get('/tasks')
      .query({ status: 'BOGUS' })
      .expect(400);
  });

  it('PATCH /tasks/:id rejects an attempt to change userId (omitted from UpdateTaskDto)', async () => {
    const userId = await createUser();
    const created = await request(server())
      .post('/tasks')
      .send(createTaskPayload(userId))
      .expect(201);

    return request(server())
      .patch(`/tasks/${body<TaskBody>(created).id}`)
      .send({ userId: '7354d194-9a22-4865-8128-cc0fb0b33267' })
      .expect(400);
  });

  it('returns 404 for get/patch/delete on a well-formed but unknown task id', async () => {
    const unknownId = '7354d194-9a22-4865-8128-cc0fb0b33267';

    await request(server()).get(`/tasks/${unknownId}`).expect(404);
    await request(server())
      .patch(`/tasks/${unknownId}`)
      .send({ title: 'x' })
      .expect(404);
    await request(server()).delete(`/tasks/${unknownId}`).expect(404);
  });

  it('cascades: deleting a user deletes their tasks too', async () => {
    const userId = await createUser();
    const created = await request(server())
      .post('/tasks')
      .send(createTaskPayload(userId))
      .expect(201);

    await request(server()).delete('/users/me').expect(200);

    await request(server())
      .get(`/tasks/${body<TaskBody>(created).id}`)
      .expect(404);
    const listed = await request(server()).get('/tasks').expect(200);
    expect(body<TaskListBody>(listed).total).toBe(0);
  });
});
