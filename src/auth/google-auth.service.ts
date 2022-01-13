import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, Auth } from 'googleapis';

import { UsersService } from 'users/users.service';

@Injectable()
export class GoogleAuthService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');

    this.oauthClient = new google.auth.OAuth2(clientId, clientSecret);
  }

  private oauthClient: Auth.OAuth2Client;

  async authenticate(token: string) {
    const tokenInfo = await this.oauthClient.getTokenInfo(token);

    try {
      const user = await this.usersService.getUserByEmail(tokenInfo.email);

      if (!user) {
        return this.usersService.createOAuthUser(tokenInfo.email);
      }

      if (!user.oauth) {
        throw new UnauthorizedException();
      }

      return user;
    } catch (err) {
      console.error('error', err);
    }
  }
}
