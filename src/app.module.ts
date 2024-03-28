import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { LoggerModule } from '@/infrastructure/services/logger/logger.module';
import { LoggerMiddleware } from '@application/_shared/middlewares/logger.middleware';
import { TenantMiddleware } from '@application/_shared/middlewares/tenant.middleware';
import { TenantModule } from '@application/tenant/tenant.module';
import { GatewayModule } from '@application/gateway/gateway.module';
import { EventEmitterModule } from '@nestjs/event-emitter/dist/event-emitter.module';
import { PaymentModule } from '@application/payment/payment.module';
import { ErrorTracerModule } from '@/infrastructure/services/error-tracer/error-tracer.module';
import { BuyerModule } from './application/buyer/buyer.module';
import { ConfigModule } from '@nestjs/config';
import { QueueModule } from './infrastructure/services/queue/adapters/queue.module';

@Module({
  imports: [
    LoggerModule,
    TenantModule,
    GatewayModule,
    PaymentModule,
    BuyerModule,
    QueueModule,
    EventEmitterModule.forRoot(),
    ErrorTracerModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AppController],
  providers: [],
  exports: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(TenantMiddleware, LoggerMiddleware).forRoutes(AppController);
  }
}
