import { Global, Module } from '@nestjs/common';
import { RabbitMqServiceProvider } from './rabbitmq/rabbit-mq.adapter';

@Global()
@Module({
  providers: [RabbitMqServiceProvider],
  exports: [RabbitMqServiceProvider],
})
export class QueueModule {}
