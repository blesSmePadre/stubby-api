import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { random } from 'lodash';

import { SignInCredentialsDto } from './dto/sign-in-credentials';
import { UsersService } from 'users/users.service';
import { SignUpDto } from './dto/sign-up';
import { MailService } from 'notifications/test-mail.service';
import { VerifyUserDto } from './dto/verify-user';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  private notifyUserAboutVerification(confirmationCode: string, email: string) {
    const appEnv = this.configService.get<string>('APP_ENV');

    if (appEnv !== 'development') {
      return this.mailService.sendEmail(
        `Your confirmation code: ${confirmationCode}`,
        'Confirmation',
        email,
      );
    } else {
      console.info('confirmation code: ', confirmationCode);
      return Promise.resolve();
    }
  }

  async signUpUser(signUpDto: SignUpDto) {
    const confirmationCode = String(random(111111, 999999));

    const user = await this.usersService.getUserByEmail(signUpDto.email);

    if (!user) {
      await this.usersService.createUser({
        ...signUpDto,
        confirmationCode: confirmationCode,
      });

      return this.notifyUserAboutVerification(
        confirmationCode,
        signUpDto.email,
      );
    }

    if (!user.confirmedAt) {
      await this.usersService.setConfirmationCode(user, confirmationCode);

      return this.notifyUserAboutVerification(
        confirmationCode,
        signUpDto.email,
      );
    }

    throw new BadRequestException('The email or username already exists');
  }

  async verifyUser({ confirmationCode, email }: VerifyUserDto) {
    const user = await this.usersService.getUserByEmail(email);

    if (confirmationCode !== user.confirmationCode) {
      throw new BadRequestException('Invalid confirmation code');
    }

    await this.usersService.confirmUser(user);

    return this.signInUser(user);
  }

  signInUser(user: User) {
    return {
      accessToken: this.jwtService.sign({
        sub: user.id,
      }),
    };
  }

  async validateUser(signInCredentialsDto: SignInCredentialsDto) {
    return this.usersService.validateUser(signInCredentialsDto);
  }
}
