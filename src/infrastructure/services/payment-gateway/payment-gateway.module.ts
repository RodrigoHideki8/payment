import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PaymentGatewayFactoryProvider } from '@/infrastructure/services/payment-gateway/payment-gateway.factory';
import { PaynetModule } from '@/infrastructure/services/payment-gateway/paynet/paynet.module';
import { PagarmeModule } from '@/infrastructure/services/payment-gateway/pagarme/pagarme.module';
import { WebhookLoggerServiceProvider } from './webhook-logger/webhook-logger.service';
import { MongodbModule } from '@/infrastructure/repositories/mongodb/mongodb.module';
import { SantanderModule } from '@/infrastructure/services/payment-gateway/santander/santander.module';
import { GetnetModule } from '@/infrastructure/services/payment-gateway/getnet/getnet.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule,
    PaynetModule,
    PagarmeModule,
    SantanderModule,
    GetnetModule,
    MongodbModule,
  ],
  providers: [PaymentGatewayFactoryProvider, WebhookLoggerServiceProvider],
  exports: [PaymentGatewayFactoryProvider, WebhookLoggerServiceProvider],
})
export class PaymentGatewayModule {}
