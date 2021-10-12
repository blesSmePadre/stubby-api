import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from './../src/app.module';

describe('Users Controller (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(`should not know allow for /users/current request for unauthorized user`, () => {
    return request(app.getHttpServer()).get('/users/current').expect(401);
  });

  afterAll(async () => {
    await app.close();
  });
});
