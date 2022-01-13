import { template } from 'lodash';

export const signInCookie = template(
  'Authentication=<%= token %>; HttpOnly; Path=/; Max-Age=<%= exp %>',
);

export const signOutCookie = 'Authentication=; HttpOnly; Path=/; Max-Age=0';
