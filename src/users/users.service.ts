import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { omit } from 'lodash';
import { User } from '@prisma/client';

import { SignUpDto } from 'auth/dto/sign-up';
import { SignInCredentialsDto } from 'auth/dto/sign-in-credentials';
import { PrismaService } from 'shared/services/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  createOAuthUser(email: string) {
    return this.prisma.user.create({
      data: {
        email,
        oauth: true,
      },
    });
  }

  async createUser(signUpDto: SignUpDto & { confirmationCode: string }) {
    const { email, password, confirmationCode } = signUpDto;

    const salt = await bcrypt.genSalt();

    return this.prisma.user.create({
      data: {
        email,
        salt,
        oauth: false,
        confirmationCode: String(confirmationCode),
        password: await this.hashPassword(password, salt),
      },
    });
  }

  async getUserById(id: number) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async setConfirmationCode(user: User, confirmationCode: string) {
    return this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        confirmationCode,
      },
    });
  }

  async validatePassword(user: User, password: string) {
    const hash = await this.hashPassword(password, user.salt);
    return hash === user.password;
  }

  async validateUser({ email, password }: SignInCredentialsDto) {
    const user = await this.getUserByEmail(email);

    if (user) {
      const isPasswordValid = await this.validatePassword(user, password);
      return isPasswordValid ? user : null;
    }

    return Promise.resolve(null);
  }

  async confirmUser(user: User) {
    return this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        confirmedAt: new Date(),
      },
    });
  }

  async getUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  getUserData(user: User) {
    return omit(
      user,
      'oauth',
      'password',
      'salt',
      'confirmationCode',
      'confirmedAt',
    );
  }

  private hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }
}
