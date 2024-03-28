import { DatabaseModule } from '@/infrastructure/repositories/database.module';
import { LoggerMiddleware } from '@application/_shared/middlewares/logger.middleware';
import { TenantMiddleware } from '@application/_shared/middlewares/tenant.middleware';
import { CreateGatewayHandler } from '@application/gateway/commands/handlers/create-gateway.handler';
import { DeleteGatewayHandler } from '@application/gateway/commands/handlers/delete-gateway.handler';
import { UpdateGatewayHandler } from '@application/gateway/commands/handlers/update-gateway.handler';
import {
  GatewayCreatedEventHandler,
  GatewayDeletedEventHandler,
  GatewayUpdatedEventHandler,
} from '@application/gateway/events/domain-handlers';
import {
  GatewayCreatedIntegrationEventHandler,
  GatewayDeletedIntegrationEventHandler,
  GatewayUpdatedIntegrationEventHandler,
} from '@application/gateway/events/integration-handlers';
import { GatewayController } from '@application/gateway/gateway.controller';
import { GatewayByIdQueryHandler } from '@application/gateway/queries/handlers/gateway-by-id-query.handler';
import { CreateGatewayUseCaseProvider } from '@application/gateway/use-cases/create-gateway.use-case';
import { DeleteGatewayUseCaseProvider } from '@application/gateway/use-cases/delete-gateway.use-case';
import { RetrieveAllGatewayUseCaseProvider } from '@application/gateway/use-cases/retrieve-all-gateway.use-case';
import { UpdateGatewayUseCaseProvider } from '@application/gateway/use-cases/update-gateway.use-case';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GatewayQueryHandler } from '@application/gateway/queries/handlers/gateway-query.handler';
import { GatewayByPaymentTypeQueryHandler } from '@application/gateway/queries/handlers/gateway-by-payment-type.handler';
import { ChooseGatewayByFeeUseCaseProvider } from '@application/gateway/use-cases/choose-gateway-by-fee.use-case';
import { GetGatewayByIdUseCaseProvider } from '@application/gateway/use-cases/get-gateway-by-id.use-case';
import { GetGatewayByPlayerUseCaseProvider } from '@application/gateway/use-cases/get-gateway-by-player.use-case';
import { GatewayByPlayerQueryHandler } from '@application/gateway/queries/handlers/gateway-by-player-query.handler';
@Module({
  imports: [CqrsModule, DatabaseModule],
  providers: [
    GatewayQueryHandler,
    RetrieveAllGatewayUseCaseProvider,
    GetGatewayByIdUseCaseProvider,
    GetGatewayByPlayerUseCaseProvider,
    CreateGatewayHandler,
    CreateGatewayUseCaseProvider,
    UpdateGatewayHandler,
    UpdateGatewayUseCaseProvider,
    DeleteGatewayHandler,
    DeleteGatewayUseCaseProvider,
    ChooseGatewayByFeeUseCaseProvider,
    GatewayCreatedEventHandler,
    GatewayUpdatedEventHandler,
    GatewayDeletedEventHandler,
    GatewayCreatedIntegrationEventHandler,
    GatewayDeletedIntegrationEventHandler,
    GatewayUpdatedIntegrationEventHandler,
    GatewayByIdQueryHandler,
    GatewayByPlayerQueryHandler,
    GatewayByPaymentTypeQueryHandler,
  ],
  controllers: [GatewayController],
})
export class GatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(TenantMiddleware, LoggerMiddleware)
      .forRoutes(GatewayController);
  }
}
