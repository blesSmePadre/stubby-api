import * as request from 'supertest';
import * as cookie from 'cookie';

import { signInCookie } from 'templates/cookies';

export const createAuthCookieFromResponse = (response: request.Response) =>
  signInCookie({
    token: cookie.parse(response.headers['set-cookie'][0]).Authentication,
    exp: process.env.JWT_EXPIRATION_TIME,
  });
