import { template } from 'lodash';

export const signInCookie = template(
  'Authentication=<%= token %>; HttpOnly; SameSite=None; Path=/; Max-Age=<%= exp %>',
);

export const signOutCookie =
  'Authentication=; HttpOnly; SameSite=None; Path=/; Max-Age=0';
