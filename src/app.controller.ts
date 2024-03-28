import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { version } from '../package.json';

@Controller()
export class AppController {
  @Get('/say-hello')
  @ApiOperation({
    description: 'Health checking endpoint',
    summary:
      'Use this to make health checking at docker container, k8s and loadbalancers',
  })
  @ApiTags('Health Checker')
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Will be returned a simple text with a api version, like: "Payment api running at version 1.0.0"',
  })
  getHello(): string {
    return 'Payment api running at version ' + version;
  }
}
