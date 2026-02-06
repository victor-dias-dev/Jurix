import { Controller, Get } from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  @SetMetadata('isPublic', true)
  check() {
    return {
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'jurix-backend',
        version: '1.0.0',
      },
    };
  }
}
