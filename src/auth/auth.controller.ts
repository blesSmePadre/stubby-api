import {
  Body,
  Controller,
  Post,
  UseGuards,
  ValidationPipe,
  Request,
  Put,
  HttpCode,
} from '@nestjs/common';
import { Public } from 'decorators/public';

import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up';
import { VerifyUserDto } from './dto/verify-user';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
@Public()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  async signUp(@Body(ValidationPipe) signUpDto: SignUpDto) {
    await this.authService.signUpUser(signUpDto);
  }

  @Put('/verify')
  async verify(@Body(ValidationPipe) verifyUserDto: VerifyUserDto) {
    return this.authService.verifyUser(verifyUserDto);
  }

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('/signin')
  async signIn(@Request() req) {
    return this.authService.signInUser(req.user);
  }
}
