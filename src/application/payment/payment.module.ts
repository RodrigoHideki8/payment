import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PaymentController } from '@application/payment/payment.controller';
import { LoggerMiddleware } from '@application/_shared/middlewares/logger.middleware';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from '@/infrastructure/repositories/database.module';
import { CreateCreditCardPaymentUseCaseProvider } from '@application/payment/use-cases/create-credit-card-payment.use-case';
import { CreatePaymentHandler } from '@/application/payment/commands/handlers/create-payment.handler';
import { PaymentCreatedEventHandler } from '@application/payment/events/domain-handlers/payment-created.handler';
import { PaymentCreatedIntegrationEventHandler } from '@application/payment/events/integration-handlers/payment-created.integration-handler';
import { PaymentGatewayModule } from '@/infrastructure/services/payment-gateway/payment-gateway.module';
import { CancelPaymentHandler } from '@/application/payment/commands/handlers/cancel-payment.handler';
import { PaymentCancelEventHandler } from '@application/payment/events/domain-handlers/payment-cancel.handler';
import { CancelPaymentUseCaseProvider } from '@/application/payment/use-cases/cancel-credit-card-payment.use-case';
import { TenantMiddleware } from '@application/_shared/middlewares/tenant.middleware';
import { GetPaymentUseCaseProvider } from '@application/payment/use-cases/get-payment.use-case';
import { PaymentQueryHandler } from '@application/payment/queries/handlers/get-payment.handler';
import { CaptureCreditCardPaymentUseCaseProvider } from '@/application/payment/use-cases/capture-credit-card-payment.use-case';
import { PaymentCancelIntegrationEventHandler } from '@application/payment/events/integration-handlers/payment-cancel.handler';
import { CreatePixPaymentUseCaseProvider } from '@application/payment/use-cases/create-pix-payment.use-case';
import { CreateBilletPaymentUseCaseProvider } from '@application/payment/use-cases/create-billet-payment.use-case';
import { ProcessWebhookUseCaseProvider } from '@application/payment/use-cases/process-webhook.use-case';
import { PaymentByTransactionIdQueryHandler } from '@application/payment/queries/handlers/payment-by-transaction-id.query';
import { ReplayEventsHelper } from '@/application/_shared/helpers/event-replay.helper';
import { PaymentGatewayFacadeProvider } from '@application/payment/facade/payment-gateway.facade';
import { ChooseGatewayByFeeUseCaseProvider } from '@application/gateway/use-cases/choose-gateway-by-fee.use-case';
import { ApprovePaymentHandler } from '@application/payment/commands/handlers/approve-payment.handler';
import { PreApprovePaymentHandler } from '@application/payment/commands/handlers/pre-approve-payment.handler';
import { RefusePaymentHandler } from '@application/payment/commands/handlers/refuse-payment.handler';
import { PaymentApprovedIntegrationEventHandler } from '@application/payment/events/integration-handlers/payment-approved.handler';
import { PaymentPreApprovedIntegrationEventHandler } from '@application/payment/events/integration-handlers/payment-pre-approved.handler';
import { PaymentRefusedIntegrationEventHandler } from '@application/payment/events/integration-handlers/payment-refused.handler';
import { PaymentApprovedEventHandler } from '@application/payment/events/domain-handlers/payment-approved.handler';
import { PaymentPreApprovedEventHandler } from '@application/payment/events/domain-handlers/payment-pre-approved.handler';
import { PaymentRefusedEventHandler } from '@application/payment/events/domain-handlers/payment-refused.handler';
import { CancelPixPaymentUseCaseProvider } from '@application/payment/use-cases/cancel-pix-payment.use-case';
import { GetPaymentByIdUseCaseProvider } from '@application/payment/use-cases/get-payment-by-id.use-case';
import { PaymentQueryByIdHandler } from '@application/payment/queries/handlers/get-payment-by-id.handler';
import { GetGatewayByPlayerUseCaseProvider } from '../gateway/use-cases/get-gateway-by-player.use-case';
import { PaymentApprovedNotContetEventHandler } from './events/domain-handlers/payment-approved-not-content.handler';
import { ApprovePaymentNotContentHandler } from './commands/handlers/approve-payment-not-content.handler';

const commandHandlers = [
  ApprovePaymentHandler,
  ApprovePaymentNotContentHandler,
  CreatePaymentHandler,
  CancelPaymentHandler,
  PreApprovePaymentHandler,
  RefusePaymentHandler,
];

const queryHandlers = [
  PaymentQueryHandler,
  PaymentByTransactionIdQueryHandler,
  PaymentQueryByIdHandler,
];

const useCases = [
  CreateCreditCardPaymentUseCaseProvider,
  CaptureCreditCardPaymentUseCaseProvider,
  CreatePixPaymentUseCaseProvider,
  CreateBilletPaymentUseCaseProvider,
  CancelPaymentUseCaseProvider,
  GetPaymentUseCaseProvider,
  GetPaymentByIdUseCaseProvider,
  ChooseGatewayByFeeUseCaseProvider,
  GetGatewayByPlayerUseCaseProvider,
  ProcessWebhookUseCaseProvider,
  CancelPixPaymentUseCaseProvider,
];

const eventHandlers = [
  PaymentCreatedEventHandler,
  PaymentCreatedEventHandler,
  PaymentCancelEventHandler,
  PaymentApprovedEventHandler,
  PaymentPreApprovedEventHandler,
  PaymentRefusedEventHandler,
  PaymentCreatedIntegrationEventHandler,
  PaymentCancelIntegrationEventHandler,
  PaymentCreatedIntegrationEventHandler,
  PaymentApprovedIntegrationEventHandler,
  PaymentPreApprovedIntegrationEventHandler,
  PaymentRefusedIntegrationEventHandler,
  PaymentApprovedNotContetEventHandler,
];

@Module({
  imports: [CqrsModule, DatabaseModule, PaymentGatewayModule],
  providers: [
    ReplayEventsHelper,
    PaymentGatewayFacadeProvider,
    ...eventHandlers,
    ...useCases,
    ...commandHandlers,
    ...queryHandlers,
  ],
  controllers: [PaymentController],
})
export class PaymentModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(TenantMiddleware, LoggerMiddleware)
      .forRoutes(PaymentController);
  }
}
