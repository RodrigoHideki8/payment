import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PaynetService } from '@/infrastructure/services/payment-gateway/paynet/paynet.service';
import { PaynetPaymentGatewayProvider } from '@/infrastructure/services/payment-gateway/paynet/paynet-payment-gateway';
import {
  PaynetCreditCardPaymentProvider,
  PaynetCaptureCreditCardPaymentProvider,
  PaynetCancelCreditCardPaymentProvider,
} from '@/infrastructure/services/payment-gateway/paynet/paynet-credit-card-payment';

@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.get('PAYNET_URI'),
        headers: {
          Version: 'v1',
          Route: configService.get('PAYNET_ROUTE'),
          'Content-type': 'application/json',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    PaynetService,
    PaynetPaymentGatewayProvider,
    PaynetCreditCardPaymentProvider,
    PaynetCancelCreditCardPaymentProvider,
    PaynetCaptureCreditCardPaymentProvider,
  ],
  exports: [PaynetPaymentGatewayProvider],
})
export class PaynetModule {}
