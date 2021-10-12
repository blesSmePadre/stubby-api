import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: this.configService.get<string>('MAILER_USER'),
        pass: this.configService.get<string>('MAILER_PASSWORD'),
      },
    });
  }

  private transporter: nodemailer.Transporter;

  async sendEmail(html: string, subject: string, to: string) {
    try {
      await this.transporter.sendMail({
        from: `Mocky <mocky@mail.com>`,
        to,
        subject,
        html,
      });
    } catch (err) {
      console.error('error', err);
    }
  }
}
