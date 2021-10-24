import { TestingModule, Test } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';

import { AppModule } from '../../src/app.module';

export const runApp = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  app.use(cookieParser());

  return app.init();
};
