import { CancelPaymentHandler } from '@/application/payment/commands/handlers/cancel-payment.handler';
import { CreatePaymentHandler } from '@/application/payment/commands/handlers/create-payment.handler';
import { PaymentQueryHandler } from '@/application/payment/queries/handlers/get-payment.handler';
import { PaymentCancelEventHandler } from '@/application/payment/events/domain-handlers/payment-cancel.handler';
import { PaymentCreatedEventHandler } from '@/application/payment/events/domain-handlers/payment-created.handler';
import { PaymentCancelIntegrationEventHandler } from '@/application/payment/events/integration-handlers/payment-cancel.handler';
import { PaymentCreatedIntegrationEventHandler } from '@/application/payment/events/integration-handlers/payment-created.integration-handler';
import { PaymentController } from '@/application/payment/payment.controller';
import { CancelPaymentUseCaseProvider } from '@/application/payment/use-cases/cancel-credit-card-payment.use-case';
import { CaptureCreditCardPaymentUseCaseProvider } from '@/application/payment/use-cases/capture-credit-card-payment.use-case';
import { CreateBilletPaymentUseCaseProvider } from '@/application/payment/use-cases/create-billet-payment.use-case';
import { CreateCreditCardPaymentUseCaseProvider } from '@/application/payment/use-cases/create-credit-card-payment.use-case';
import { CreatePixPaymentUseCaseProvider } from '@/application/payment/use-cases/create-pix-payment.use-case';
import { GetPaymentUseCaseProvider } from '@/application/payment/use-cases/get-payment.use-case';
import { EventStore } from '@/domain/contracts/infra-layer/repository/event-store.repository';
import { PaymentRepository } from '@/domain/contracts/infra-layer/repository/payment.repository';
import { CaptureType } from '@/domain/entities/payment';
import {
  CancelCreditCardPayment,
  CancelCreditCardPaymentInput,
} from '@/domain/use-cases/payment/cancel-credit-card-payment';
import {
  CaptureCreditCardPayment,
  CaptureCreditCardPaymentInput,
} from '@/domain/use-cases/payment/capture-credit-card-payment';
import {
  CreateBilletPayment,
  CreateBilletPaymentInput,
} from '@/domain/use-cases/payment/create-billet-payment';
import {
  CreateCreditCardPayment,
  CreateCreditCardPaymentInput,
} from '@/domain/use-cases/payment/create-credit-card-payment';
import { CreatePixPayment } from '@/domain/use-cases/payment/create-pix-payment';
import { Metadata } from '@/domain/value-objects';
import { Brand, CreditCard } from '@/domain/value-objects/credit-card';
import { LoggerModule } from '@/infrastructure/services/logger/logger.module';
import { PagarmePaymentGateway } from '@/infrastructure/services/payment-gateway/pagarme/pagarme-payment-gateway';
import { PagarmeService } from '@/infrastructure/services/payment-gateway/pagarme/pagarme.service';
import { ChargePagarmeResponse } from '@/infrastructure/services/payment-gateway/pagarme/types';
import { PaymentGatewayModule } from '@/infrastructure/services/payment-gateway/payment-gateway.module';
import { PaynetPaymentGateway } from '@/infrastructure/services/payment-gateway/paynet/paynet-payment-gateway';
import { PaynetService } from '@/infrastructure/services/payment-gateway/paynet/paynet.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import { of } from 'rxjs';
import { InMemoryEventStoreRepository } from '../../../_mocks/in-memory-event-store.repository';
import { InMemoryCreateCreditCardRepository } from '../../../_mocks/in-memory-payment.repository';
import { ProcessWebhookUseCaseProvider } from '@/application/payment/use-cases/process-webhook.use-case';

describe('Payment Use Case', () => {
  let createCreditCardPaymentUseCase: CreateCreditCardPayment;
  let cancelCreditCardPaymentUseCase: CancelCreditCardPayment;
  let captureCreditCardPaymentUseCase: CaptureCreditCardPayment;
  let createBilletPaymentUseCase: CreateBilletPayment;
  let createPixPaymentUseCase: CreatePixPayment;

  const mockHttpService = {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    put: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        CqrsModule,
        PaymentGatewayModule,
        HttpModule,
        LoggerModule,
        EventEmitterModule.forRoot(),
      ],
      providers: [
        CreateCreditCardPaymentUseCaseProvider,
        CaptureCreditCardPaymentUseCaseProvider,
        CreatePixPaymentUseCaseProvider,
        CreateBilletPaymentUseCaseProvider,
        CreatePaymentHandler,
        PaymentCreatedEventHandler,
        PaymentCreatedIntegrationEventHandler,
        GetPaymentUseCaseProvider,
        PaymentQueryHandler,
        CancelPaymentHandler,
        PaymentCancelEventHandler,
        PaymentCancelIntegrationEventHandler,
        CancelPaymentUseCaseProvider,
        ProcessWebhookUseCaseProvider,
        PaynetService,
        PagarmeService,
        ProcessWebhookUseCaseProvider,
        {
          provide: PaymentRepository,
          useClass: InMemoryCreateCreditCardRepository,
        },
        {
          provide: EventStore,
          useClass: InMemoryEventStoreRepository,
        },
        {
          provide: 'PAYNET_SERVICE',
          useClass: PaynetPaymentGateway,
        },
        {
          provide: 'PAGARME_SERVICE',
          useClass: PagarmePaymentGateway,
        },
      ],
      controllers: [PaymentController],
    })
      .overrideProvider(HttpService)
      .useValue(mockHttpService)
      .compile();

    await moduleRef.init();

    createCreditCardPaymentUseCase = moduleRef.get<CreateCreditCardPayment>(
      CreateCreditCardPayment,
    );

    cancelCreditCardPaymentUseCase =
      moduleRef.get<CancelCreditCardPayment>(CancelCreditCardPayment);

    captureCreditCardPaymentUseCase = moduleRef.get<CaptureCreditCardPayment>(
      CaptureCreditCardPayment,
    );

    createBilletPaymentUseCase =
      moduleRef.get<CreateBilletPayment>(CreateBilletPayment);

    createPixPaymentUseCase = moduleRef.get<CreatePixPayment>(CreatePixPayment);
  });

  describe('Credit Card payment tests', () => {
    it('Create new credit card payment', (done) => {
      mockHttpService.post.mockReturnValue(
        of({
          data: {
            description: 'Sucesso',
            returnCode: '00',
            paymentId: '1e9cb0ba-254b-498f-9651-bd632cb1c9b3',
            orderNumber: '40018701',
            authorizationCode: '002433',
            nsu: '000000209100',
            amount: 10,
          },
        }),
      );
      const requestBody: CreateCreditCardPaymentInput = {
        tenantId: 'test',
        creditCard: {
          cvv: '123',
          holder: 'TESTE TESTE',
          number: '1231123112311231',
          expirationMonth: '02',
          expirationYear: '30',
          brand: {
            code: 3,
            description: 'Visa',
          } as Brand,
        } as CreditCard,
        captureType: CaptureType.AUTORIZACAO,
        installments: 1,
        amount: 100,
        buyerId: 'abc123',
        metadata: {
          userAgent: 'test',
          ipAddress: '127.0.0.1',
          device: 'test',
        } as Metadata,
        softDescription: 'Teste',
        orderId: '123',
        accountId: '123',
        accountDeadLine: 30,
      };
      createCreditCardPaymentUseCase
        .execute(requestBody)
        .subscribe((response) => {
          expect(response.aggregateId).toBeDefined();
          expect(response.status).toBe('confirmed');
          done();
        });
    }, 15000);

    it('Cancel credit card payment', (done) => {
      mockHttpService.post.mockReturnValue(
        of({
          data: {
            description: 'Sucesso',
            returnCode: '0',
            paymentId: 'b1bffc9f-fde9-4a12-842c-3d24851aa296',
            orderNumber: '40018701',
            authorizationCode: '002433',
            amount: 100,
            releaseAt: '2023-03-17T15:26:01.9724675-03:00',
          },
        }),
      );

      const requestBody: CancelCreditCardPaymentInput = {
        aggregateId: 'b1bffc9f-fde9-4a12-842c-3d24851aa296',
      };

      cancelCreditCardPaymentUseCase
        .execute(requestBody)
        .subscribe((response) => {
          expect(response.status).toBe('canceled');
          done();
        });
    }, 15000);

    it('Capture credit card payment', (done) => {
      mockHttpService.post.mockReturnValue(
        of({
          data: {
            description: 'Sucesso',
            returnCode: '00',
            paymentId: 'b1bffc9f-fde9-4a12-842c-3d24851aa296',
            orderNumber: '40018701',
            authorizationCode: '002433',
            nsu: '000000209100',
            amount: 10,
          },
        }),
      );
      const requestBody: CaptureCreditCardPaymentInput = {
        tenantId: 'test',
        aggregateId: 'b1bffc9f-fde9-4a12-842c-3d24851aa296',
        amount: 10,
      };
      captureCreditCardPaymentUseCase
        .execute(requestBody)
        .subscribe((response) => {
          expect(response.aggregateId).toBeDefined();
          expect(response.status).toBe('confirmed');
          done();
        });
    }, 15000);
  });

  describe('Create Billet payment tests', () => {
    it('Create new billet payment', (done) => {
      const charges: ChargePagarmeResponse[] = [
        {
          id: '123',
          code: '234',
          gateway_id: '1234',
          amount: 10,
          status: 'pending',
          currency: 'test',
          payment_method: 'test',
          created_at: new Date(),
          updated_at: new Date(),
          last_transaction: {
            id: '',
            transaction_type: '',
            amount: 10,
            status: 'pending',
            success: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
        },
      ];

      mockHttpService.post.mockReturnValue(
        of({
          data: {
            description: 'Sucesso',
            returnCode: '00',
            paymentId: 'b1bffc9f-fde9-4a12-842c-3d24851aa296',
            orderNumber: '40018701',
            authorizationCode: '002433',
            nsu: '000000209100',
            amount: 10,
            charges,
          },
        }),
      );

      const requestBody: CreateBilletPaymentInput = {
        tenantId: 'Test',
        amount: 10,
        buyerId: 'abc123',
        metadata: {
          userAgent: 'test',
          ipAddress: '127.0.0.1',
          device: 'test',
        } as Metadata,
        softDescription: 'Teste',
        orderId: '2235',
        accountId: '1234',
        expiresAt: new Date(),
      };
      createBilletPaymentUseCase.execute(requestBody).subscribe((response) => {
        expect(response.status).toBe('waiting');
        done();
      });
    }, 15000);
  });

  describe('Create Pix payment tests', () => {
    it('Create new pix payment', (done) => {
      const charges: ChargePagarmeResponse[] = [
        {
          id: '123',
          code: '234',
          gateway_id: '1234',
          amount: 10,
          status: 'pending',
          currency: 'test',
          payment_method: 'test',
          created_at: new Date(),
          updated_at: new Date(),
          last_transaction: {
            id: '',
            transaction_type: '',
            amount: 10,
            status: 'pending',
            success: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
        },
      ];

      mockHttpService.post.mockReturnValue(
        of({
          data: {
            description: 'Sucesso',
            returnCode: '00',
            paymentId: 'b1bffc9f-fde9-4a12-842c-3d24851aa296',
            orderNumber: '40018701',
            authorizationCode: '002433',
            nsu: '000000209100',
            amount: 10,
            charges,
          },
        }),
      );

      const requestBody: CreateBilletPaymentInput = {
        tenantId: 'Test',
        amount: 10,
        buyerId: 'abc123',
        metadata: {
          userAgent: 'test',
          ipAddress: '127.0.0.1',
          device: 'test',
        } as Metadata,
        softDescription: 'Teste',
        orderId: '2235',
        accountId: '1234',
        expiresAt: new Date(),
      };
      createPixPaymentUseCase.execute(requestBody).subscribe((response) => {
        expect(response.status).toBe('waiting');
        done();
      });
    }, 15000);
  });
});
