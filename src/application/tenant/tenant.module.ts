import { DatabaseModule } from '@/infrastructure/repositories/database.module';
import { CreateTenantHandler } from '@application/tenant/commands/handlers/create-tenant.handler';
import { UpdateTenantHandler } from '@application/tenant/commands/handlers/udpate-tenant.handler';
import {
  TenantCreatedEventHandler,
  TenantUpdatedEventHandler,
} from '@application/tenant/events/domain-handlers';
import {
  TenantCreatedIntegrationEventHandler,
  TenantUpdatedIntegrationEventHandler,
} from '@application/tenant/events/integration-handlers';
import { TenantController } from '@application/tenant/tenant.controller';
import { CreateTenantUseCaseProvider } from '@application/tenant/use-cases/create-tenant.use-case';
import { UpdateTenantUseCaseProvider } from '@application/tenant/use-cases/update-tenant.use-case';
import { LoggerMiddleware } from '@application/_shared/middlewares/logger.middleware';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [CqrsModule, DatabaseModule],
  providers: [
    CreateTenantHandler,
    CreateTenantUseCaseProvider,
    UpdateTenantHandler,
    UpdateTenantUseCaseProvider,
    TenantCreatedEventHandler,
    TenantUpdatedEventHandler,
    TenantCreatedIntegrationEventHandler,
    TenantUpdatedIntegrationEventHandler,
  ],
  controllers: [TenantController],
})
export class TenantModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(LoggerMiddleware).forRoutes(TenantController);
  }
}
