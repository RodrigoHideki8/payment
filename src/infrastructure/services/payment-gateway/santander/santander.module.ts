import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SantanderPaymentGatewayProvider } from '@/infrastructure/services/payment-gateway/santander/santander-payment-gateway';
import {
  CancelPixPaymentTransactionSantanderProvider,
  CreatePixPaymentSantanderProvider,
  WebhookPixPaymentSantanderProvider,
} from '@/infrastructure/services/payment-gateway/santander/santander-pix-payment';
import { HttpModule } from '@nestjs/axios';
import { SantanderService } from '@/infrastructure/services/payment-gateway/santander/santander.service';
import { DatabaseModule } from '@/infrastructure/repositories/database.module';
import * as fs from 'fs';
import path from 'path';
import { Agent } from 'https';

const rootDir = path.resolve(__dirname, '../../../../../../');
const certPath = path.join(rootDir, 'certificates', 'ever_certificate.pfx');

@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.get('SANTANDER_URI'),
        httpsAgent: new Agent({
          requestCert: true,
          rejectUnauthorized: false,
          pfx: fs.readFileSync(certPath),
          passphrase: configService.get('SANTANDER_PFX_PASS'),
        }),
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
  ],
  providers: [
    SantanderService,
    SantanderPaymentGatewayProvider,
    CreatePixPaymentSantanderProvider,
    WebhookPixPaymentSantanderProvider,
    CancelPixPaymentTransactionSantanderProvider,
  ],
  exports: [SantanderPaymentGatewayProvider],
})
export class SantanderModule {}
