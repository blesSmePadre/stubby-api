import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { NotificationsModule } from 'notifications/notifications.module';
import { UsersModule } from 'users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    NotificationsModule,
    JwtModule.registerAsync({
      useFactory: async () => ({
        /* TODO Find out how to use config service instead of direct usage of prcess.env */
        secret: process.env.JWT_SECRET,
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
})
export class AuthModule {}
