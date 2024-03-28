import { GatewayRepositoryProvider } from '@/infrastructure/repositories/mongodb/gateway/gateway.repository';
import { GatewayModel } from '@/infrastructure/repositories/mongodb/gateway/models/gateway.model';
import { PaymentModel } from '@/infrastructure/repositories/mongodb/payment/models/payment.model';
import { PaymentRepositoryProvider } from '@/infrastructure/repositories/mongodb/payment/payment.repository';
import { RepositoryFactory } from '@/infrastructure/repositories/mongodb/repository.factory';
import { TenantModel } from '@/infrastructure/repositories/mongodb/tenant/models/tenant.model';
import { TenantRepositoryProvider } from '@/infrastructure/repositories/mongodb/tenant/tenant.repository';
import { ReceiverModel } from '@/infrastructure/repositories/mongodb/receiver/models/receiver.model';
import { ReceiverRepositoryProvider } from '@/infrastructure/repositories/mongodb/receiver/receiver.repository';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { WebhookLoggerRepositoryProvider } from '@/infrastructure/repositories/mongodb/webhook-logger/webhook-logger.repository';
import { WebhookLogModel } from '@/infrastructure/repositories/mongodb/webhook-logger/models/webhook-logger.model';
import { BuyerModel } from '@/infrastructure/repositories/mongodb/buyer/models/buyer.model';
import { BuyerRepositoryProvider } from '@/infrastructure/repositories/mongodb/buyer/buyer.repository';
import { PaymentGatewayLoggerRepositoryProvider } from '@/infrastructure/repositories/mongodb/payment-gateway-logger/payment-gateway-logger.repository';
import { PaymentGatewayLogModel } from '@/infrastructure/repositories/mongodb/payment-gateway-logger/models/payment-gateway-logger.model';
import { ReceiverInGatewayModel } from './receiver-in-gateway/models/receiver-in-gateway.model';
import { ReceiverInGatewayRepositoryProvider } from './receiver-in-gateway/receiver-in-gateway.repository';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_CONNECTION_STRING'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      {
        name: 'gateway',
        schema:
          RepositoryFactory.CreateSchemaWithPaginationPlugin(GatewayModel),
      },
      {
        name: 'tenant',
        schema: RepositoryFactory.CreateSchemaWithPaginationPlugin(TenantModel),
      },
      {
        name: 'payment',
        schema:
          RepositoryFactory.CreateSchemaWithPaginationPlugin(PaymentModel),
      },
      {
        name: 'receiver',
        schema:
          RepositoryFactory.CreateSchemaWithPaginationPlugin(ReceiverModel),
      },
      {
        name: 'buyer',
        schema: RepositoryFactory.CreateSchemaWithPaginationPlugin(BuyerModel),
      },
      {
        name: 'webhook-log',
        schema:
          RepositoryFactory.CreateSchemaWithPaginationPlugin(WebhookLogModel),
      },
      {
        name: 'payment-gateway-log',
        schema: RepositoryFactory.CreateSchemaWithPaginationPlugin(
          PaymentGatewayLogModel,
        ),
      },
      {
        name: 'receiver-in-gateway',
        schema: RepositoryFactory.CreateSchemaWithPaginationPlugin(
          ReceiverInGatewayModel,
        ),
      },
    ]),
  ],
  providers: [
    GatewayRepositoryProvider,
    TenantRepositoryProvider,
    PaymentRepositoryProvider,
    ReceiverRepositoryProvider,
    BuyerRepositoryProvider,
    WebhookLoggerRepositoryProvider,
    PaymentGatewayLoggerRepositoryProvider,
    ReceiverInGatewayRepositoryProvider
  ],
  exports: [
    GatewayRepositoryProvider,
    TenantRepositoryProvider,
    PaymentRepositoryProvider,
    ReceiverRepositoryProvider,
    BuyerRepositoryProvider,
    WebhookLoggerRepositoryProvider,
    PaymentGatewayLoggerRepositoryProvider,
    ReceiverInGatewayRepositoryProvider,
  ],
})
export class MongodbModule {}
