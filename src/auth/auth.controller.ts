import {
  Body,
  Controller,
  Post,
  UseGuards,
  ValidationPipe,
  Req,
  Res,
  Put,
  HttpCode,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { Public } from 'decorators/public';
import { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up';
import { VerifyUserDto } from './dto/verify-user';
import { LocalAuthGuard } from './local-auth.guard';

import { signInCookie, signOutCookie } from 'templates/cookies';

@Controller('auth')
@Public()
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  @Post('/signup')
  async signUp(@Body(ValidationPipe) signUpDto: SignUpDto) {
    return this.authService.signUpUser(signUpDto);
  }

  @Put('/verify')
  async verify(
    @Body(ValidationPipe) verifyUserDto: VerifyUserDto,
    @Res() res: Response,
  ) {
    const user = await this.authService.verifyUser(verifyUserDto);

    this.setAuthCookie(user, res);
    res.sendStatus(200);
  }

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('/signin')
  async signIn(@Req() req: Request, @Res() res: Response) {
    this.setAuthCookie(req.user, res);
    res.sendStatus(200);
  }

  @Put('/signout')
  @Public(false)
  async signOut(@Res() res: Response) {
    await res.setHeader('Set-Cookie', signOutCookie);
    res.sendStatus(200);
  }

  private setAuthCookie(user: User, res: Response) {
    res.setHeader(
      'Set-Cookie',
      signInCookie({
        token: this.jwtService.sign({
          sub: user.id,
        }),
        exp: this.configService.get('JWT_EXPIRATION_TIME'),
      }),
    );
  }
}
