import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Check if the API is running' })
  @ApiOkResponse({
    description: 'Healthcheck response wrapped in the standard data envelope.',
  })
  health() {
    return {
      status: 'ok',
      service: 'management-api',
      timestamp: new Date().toISOString(),
    };
  }
}
