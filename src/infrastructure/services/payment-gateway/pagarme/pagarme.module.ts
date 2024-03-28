import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PagarmeService } from './pagarme.service';
import { PagarmePaymentGatewayProvider } from '@/infrastructure/services/payment-gateway/pagarme/pagarme-payment-gateway';
import {
  CreatePixPaymentPagarmeProvider,
  PagarmeCancelPixPaymentProvider,
} from '@/infrastructure/services/payment-gateway/pagarme/pagarme-pix-payment';
import { CreateBilletPaymentTransactionPagarmeProvider } from '@/infrastructure/services/payment-gateway/pagarme/pagarme-billet-payment';
import {
  PagarmeCancelCreditCardPaymentProvider,
  PagarmeCreditCardPaymentProvider,
} from './pagarme-credit-card-payment';
import { WebhookPaymentPagarmeProvider } from '@/infrastructure/services/payment-gateway/pagarme/pagarme-webhook-payment';
import { MongodbModule } from '@/infrastructure/repositories/mongodb/mongodb.module';
import { PaymentGatewayTaxAntecipationProvider } from './pagarme-tax-antecipation';

@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.get('PAGARME_URI'),
        headers: {
          Authorization: `Basic ${Buffer.from(
            configService.get('PAGARME_USER_KEY') + ':',
          ).toString('base64')}`,
        },
      }),
      inject: [ConfigService],
    }),
    MongodbModule,
  ],
  providers: [
    PagarmeService,
    CreatePixPaymentPagarmeProvider,
    CreateBilletPaymentTransactionPagarmeProvider,
    PagarmeCreditCardPaymentProvider,
    PagarmeCancelCreditCardPaymentProvider,
    WebhookPaymentPagarmeProvider,
    PagarmePaymentGatewayProvider,
    PagarmeCancelPixPaymentProvider,
    PaymentGatewayTaxAntecipationProvider
  ],
  exports: [PagarmePaymentGatewayProvider],
})
export class PagarmeModule {}
