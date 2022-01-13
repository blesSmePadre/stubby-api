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
import { OAuthToken } from './dto/oauth-token';

import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up';
import { VerifyUserDto } from './dto/verify-user';
import { LocalAuthGuard } from './local-auth.guard';
import { UsersService } from 'users/users.service';

import { signInCookie, signOutCookie } from 'templates/cookies';
import { GoogleAuthService } from './google-auth.service';

@Controller('auth')
@Public()
export class AuthController {
  constructor(
    private authService: AuthService,
    private googleAuthService: GoogleAuthService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  @Post('/oauth')
  async authenticate(
    @Body(ValidationPipe) oauthToken: OAuthToken,
    @Res() res: Response,
  ) {
    const user = await this.googleAuthService.authenticate(oauthToken.token);

    this.setAuthCookie(user, res);
    res.send(this.usersService.getUserData(user));
  }

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
    res.send(this.usersService.getUserData(user));
  }

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('/signin')
  async signIn(@Req() req: Request, @Res() res: Response) {
    this.setAuthCookie(req.user, res);
    res.send(this.usersService.getUserData(req.user));
  }

  @Put('/signout')
  @Public(false)
  async signOut(@Res() res: Response) {
    res.setHeader('Set-Cookie', signOutCookie);
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
