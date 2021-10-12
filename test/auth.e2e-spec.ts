import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';

import prisma from '../prisma/prisma-client';
import { AppModule } from './../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  const existingUser = {
    email: 'someemail@mail.ru',
    confirmationCode: 'someconfirmationcode',
    confirmedAt: new Date(),
    password: 'somepassword',
  };

  const userSignupRequestData = {
    email: 'user@mail.ru',
    password: 'passworD1',
  };

  beforeAll(async () => {
    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash(existingUser.password, salt);

    await prisma.user.create({
      data: {
        ...existingUser,
        password: password,
        salt,
      },
    });
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
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

    await request(app.getHttpServer())
      .put('/auth/verify')
      .send({ email: user.email, confirmationCode: user.confirmationCode })
      .expect(200);
  });

  it('should login user by valid credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email: existingUser.email, password: existingUser.password })
      .expect(200);
  });

  it('should not login user by invalid credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email: 'invalidemail', password: 'invalidpassword' })
      .expect(400);
  });

  afterAll(async () => {
    await app.close();
  });
});
