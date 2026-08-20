import request from 'supertest';
import {
  body,
  createTestApp,
  createUserPayload,
  resetDatabase,
  TestApp,
  UserBody,
  uniqueEmail,
} from './utils/test-app';

describe('Users (e2e)', () => {
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

  it('full lifecycle: create -> get -> update -> delete -> 404 after delete', async () => {
    const payload = createUserPayload({ name: 'Aryan Srivastava' });

    const created = await request(server())
      .post('/users')
      .send(payload)
      .expect(201);

    const createdUser = body<UserBody>(created);
    expect(created.body).toMatchObject({
      name: payload.name,
      email: payload.email,
    });
    expect(typeof createdUser.id).toBe('string');

    const fetched = await request(server()).get('/users/me').expect(200);
    expect(body<UserBody>(fetched).id).toBe(createdUser.id);

    const updated = await request(server())
      .patch('/users/me')
      .send({ name: 'Aryan K.' })
      .expect(200);
    const updatedUser = body<UserBody>(updated);
    expect(updatedUser.name).toBe('Aryan K.');
    expect(updatedUser.email).toBe(payload.email);

    await request(server()).delete('/users/me').expect(200);

    await request(server()).get('/users/me').expect(404);
  });

  it('GET /users/me returns 404 when no user exists', () => {
    return request(server()).get('/users/me').expect(404);
  });

  it('POST /users returns 409 for a case-insensitive duplicate email', async () => {
    const email = uniqueEmail('dup');

    await request(server())
      .post('/users')
      .send(createUserPayload({ email }))
      .expect(201);

    await request(server())
      .post('/users')
      .send(createUserPayload({ email: email.toUpperCase() }))
      .expect(409);
  });

  it("PATCH /users/me returns 409 when updating to another user's email", async () => {
    const firstEmail = uniqueEmail('first');
    const secondEmail = uniqueEmail('second');

    await request(server())
      .post('/users')
      .send(createUserPayload({ email: firstEmail }))
      .expect(201);
    // /users/me resolves to the most recently created user, so create the
    // "current" user second and attempt to steal the first user's email.
    await request(server())
      .post('/users')
      .send(createUserPayload({ email: secondEmail }))
      .expect(201);

    await request(server())
      .patch('/users/me')
      .send({ email: firstEmail })
      .expect(409);
  });

  it('POST /users returns 400 for missing name', () => {
    return request(server())
      .post('/users')
      .send({ email: uniqueEmail() })
      .expect(400);
  });

  it('POST /users returns 400 for an invalid email', () => {
    return request(server())
      .post('/users')
      .send({ name: 'Bad Email', email: 'not-an-email' })
      .expect(400);
  });

  it('POST /users returns 400 for an unknown field (forbidNonWhitelisted)', () => {
    return request(server())
      .post('/users')
      .send({ ...createUserPayload(), role: 'admin' })
      .expect(400);
  });
});
