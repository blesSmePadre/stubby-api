import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import prisma from '../prisma/prisma-client';

import { runApp } from './seeds/general';
import { createExistingUsers } from './seeds/users';
import { createAuthCookieFromResponse } from './utils/cookies';
import { existingUser } from './data/users';

describe('Users Controller (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await prisma.user.deleteMany();
    await createExistingUsers();
  });

  beforeAll(async () => {
    app = await runApp();
  });

  it(`should not allow for /users/current request for unauthorized user`, () => {
    return request(app.getHttpServer()).get('/users/current').expect(401);
  });

  it(`should return user data for /users/current request for authorized user`, async () => {
    const signInResponse = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: existingUser.email,
        password: existingUser.password,
      })
      .expect(200);

    await request(app.getHttpServer())
      .get('/users/current')
      .set('Cookie', [createAuthCookieFromResponse(signInResponse)])
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
    await prisma.user.deleteMany();
  });
});
