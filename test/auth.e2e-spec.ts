import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as cookie from 'cookie';

import prisma from '../prisma/prisma-client';

import { runApp } from './seeds/general';
import { existingUser } from './data/users';
import { createExistingUsers } from './seeds/users';
import { createAuthCookieFromResponse } from './utils/cookies';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  const userSignupRequestData = {
    email: 'user@mail.ru',
    password: 'passworD1',
  };

  beforeAll(async () => {
    await createExistingUsers();
  });

  beforeAll(async () => {
    app = await runApp();
  });

  it('should not sign up user with invalid sign up request data', () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'invalidemail', password: 'invalidpassword' })
      .expect(400);
  });

  it('should successfully sign up user with valid sign up request data', async () => {
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send(userSignupRequestData)
      .expect(201);

    const user = await prisma.user.findUnique({
      where: {
        email: userSignupRequestData.email,
      },
    });

    expect(user).toBeDefined();
    expect(user.confirmedAt).toBeNull();
  });

  it('should not verify user with invalid confirmation code', async () => {
    const user = await prisma.user.findUnique({
      where: {
        email: userSignupRequestData.email,
      },
    });

    await request(app.getHttpServer())
      .put('/auth/verify')
      .send({ email: user.email, confirmationCode: 'invalidconfirmationcode' })
      .expect(400);
  });

  it('should successfully verify user with valid confirmation code', async () => {
    const user = await prisma.user.findUnique({
      where: {
        email: userSignupRequestData.email,
      },
    });

    const response = await request(app.getHttpServer())
      .put('/auth/verify')
      .send({ email: user.email, confirmationCode: user.confirmationCode })
      .expect(200);

    expect(response.headers['set-cookie'][0]).toBeDefined();
    expect(cookie.parse(response.headers['set-cookie'][0])).toHaveProperty(
      'Authentication',
    );
  });

  it('should login user by valid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email: existingUser.email, password: existingUser.password })
      .expect(200);

    expect(response.headers['set-cookie'][0]).toBeDefined();
    expect(cookie.parse(response.headers['set-cookie'][0])).toHaveProperty(
      'Authentication',
    );
  });

  it('should not login user by invalid credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email: 'invalidemail', password: 'invalidpassword' })
      .expect(400);
  });

  it('should log out user by valid credentials', async () => {
    const signInResponse = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email: existingUser.email, password: existingUser.password })
      .expect(200);

    const signOutResponse = await request(app.getHttpServer())
      .put('/auth/signout')
      .set('Cookie', [createAuthCookieFromResponse(signInResponse)])
      .expect(200);

    const signOutCookies = cookie.parse(
      signOutResponse.headers['set-cookie'][0],
    );

    expect(signOutCookies).toHaveProperty('Authentication');
    expect(signOutCookies.Authentication).toEqual('');
  });

  afterAll(async () => {
    await app.close();
    await prisma.user.deleteMany();
  });
});
