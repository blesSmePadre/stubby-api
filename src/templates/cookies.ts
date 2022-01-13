import { template } from 'lodash';

export const signInCookie = template(
  'Authentication=<%= token %>; Secure; HttpOnly; Path=/; Max-Age=<%= exp %>',
);

export const signOutCookie =
  'Authentication=; Secure; HttpOnly; Path=/; Max-Age=0';
