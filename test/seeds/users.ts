import * as bcrypt from 'bcrypt';
import prisma from '../../prisma/prisma-client';

import { existingUser } from '../data/users';

export const createExistingUsers = async () => {
  const salt = await bcrypt.genSalt();
  const password = await bcrypt.hash(existingUser.password, salt);

  await prisma.user.create({
    data: {
      ...existingUser,
      password: password,
      salt,
    },
  });
};
