import { DatabaseModule } from '@/infrastructure/repositories/database.module';
import {
  CreateBuyerHandler,
  DeleteBuyerHandler,
  UpdateBuyerHandler,
} from '@/application/buyer/commands/handlers';
import {
  BuyerCreatedEventHandler,
  BuyerDeletedEventHandler,
  BuyerUpdatedEventHandler,
} from '@/application/buyer/events/domain-handlers';
import {
  BuyerCreatedIntegrationEventHandler,
  BuyerDeletedIntegrationEventHandler,
  BuyerUpdatedIntegrationEventHandler,
} from '@/application/buyer/events/integration-handlers';
import { RetrieveBuyerHandler } from '@/application/buyer/queries/handlers';
import {
  CreateBuyerUseCaseProvider,
  DeleteBuyerUseCaseProvider,
  RetrieveBuyerUseCaseProvider,
  UpdateBuyerUseCaseProvider,
} from '@/application/buyer/use-cases';
import { BuyerController } from '@/application/buyer/buyer.controller';
import { LoggerMiddleware } from '@application/_shared/middlewares/logger.middleware';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetBuyerUseCaseProvider } from './use-cases/get-buyer.use-case';
import { BuyerQueryHandler } from './queries/handlers/get-buyer.handler';
import { TenantMiddleware } from '../_shared/middlewares/tenant.middleware';
@Module({
  imports: [CqrsModule, DatabaseModule],
  providers: [
    CreateBuyerHandler,
    CreateBuyerUseCaseProvider,
    UpdateBuyerHandler,
    UpdateBuyerUseCaseProvider,
    DeleteBuyerHandler,
    DeleteBuyerUseCaseProvider,
    RetrieveBuyerHandler,
    RetrieveBuyerUseCaseProvider,
    BuyerCreatedEventHandler,
    BuyerUpdatedEventHandler,
    BuyerDeletedEventHandler,
    BuyerCreatedIntegrationEventHandler,
    BuyerDeletedIntegrationEventHandler,
    BuyerUpdatedIntegrationEventHandler,
    GetBuyerUseCaseProvider,
    BuyerQueryHandler,
  ],
  controllers: [BuyerController],
})
export class BuyerModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(TenantMiddleware, LoggerMiddleware)
      .forRoutes(BuyerController);
  }
}
