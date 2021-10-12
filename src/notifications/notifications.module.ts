import { Module } from '@nestjs/common';
import { MailService } from './test-mail.service';

@Module({
  providers: [MailService],
  exports: [MailService],
})
export class NotificationsModule {}
