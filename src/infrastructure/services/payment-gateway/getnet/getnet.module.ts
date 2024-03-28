import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { GetnetService } from './getnet.service';
import { GetnetPaymentGatewayProvider } from './getnet-payment-gateway';
import {
  GetnetCancelCreditCardPaymentProvider,
  GetnetCreditCardPaymentProvider,
} from './getnet-credit-card-payment';
import { MongodbModule } from '@/infrastructure/repositories/mongodb/mongodb.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.get('GETNET_URI'),
      }),
      inject: [ConfigService],
    }),
    MongodbModule,
  ],
  providers: [
    GetnetService,
    GetnetCreditCardPaymentProvider,
    GetnetCancelCreditCardPaymentProvider,
    GetnetPaymentGatewayProvider,
  ],
  exports: [GetnetPaymentGatewayProvider],
})
export class GetnetModule {}
