import { Controller, Get } from '@nestjs/common';

@Controller('test')
export class TestController {
  @Get('/')
  root() {
    return { ok: true };
  }
}
