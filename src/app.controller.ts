import { Controller, Get } from '@nestjs/common';
import { Public } from 'decorators/public';
import { AppService } from './app.service';

@Controller()
@Public()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
