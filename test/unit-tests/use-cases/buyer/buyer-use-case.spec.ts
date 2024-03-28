import { BuyerController } from '@/application/buyer/buyer.controller';
import { EventStore } from '@/domain/contracts/infra-layer/repository/event-store.repository';

import { CompanyRepresentativeProps } from '@/domain/value-objects';
import { LoggerModule } from '@/infrastructure/services/logger/logger.module';
import { HttpModule, HttpService } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import { of } from 'rxjs';
import { InMemoryEventStoreRepository } from '../../../_mocks/in-memory-event-store.repository';
import { CreateBuyer, CreateBuyerInput } from '@/domain/use-cases/buyer';
import {
  CreateBuyerUseCaseProvider,
  DeleteBuyerUseCaseProvider,
  RetrieveBuyerUseCaseProvider,
  UpdateBuyerUseCaseProvider,
} from '@/application/buyer/use-cases';
import { BuyerRepository } from '@/domain/contracts/infra-layer/repository/buyer.repository';
import { InMemoryCreateReceiverRepository } from '../../../_mocks/in-memory-receiver.repository';
import { BuyerModule } from '@/application/buyer/buyer.module';
import {
  CreateBuyerHandler,
  DeleteBuyerHandler,
  UpdateBuyerHandler,
} from '@/application/buyer/commands/handlers';
import { RetrieveBuyerHandler } from '@/application/buyer/queries/handlers';
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
import { GetBuyerUseCaseProvider } from '@/application/buyer/use-cases/get-buyer.use-case';
import { BuyerQueryHandler } from '@/application/buyer/queries/handlers/get-buyer.handler';

describe('Buyer Use Case', () => {
  let createBuyerUseCase: CreateBuyer;

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
        BuyerModule,
        HttpModule,
        LoggerModule,
        EventEmitterModule.forRoot(),
      ],
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
        CreateBuyerUseCaseProvider,
        GetBuyerUseCaseProvider,
        BuyerQueryHandler,
        {
          provide: BuyerRepository,
          useClass: InMemoryCreateReceiverRepository,
        },
        {
          provide: EventStore,
          useClass: InMemoryEventStoreRepository,
        },
      ],
      controllers: [BuyerController],
    })
      .overrideProvider(HttpService)
      .useValue(mockHttpService)
      .compile();

    await moduleRef.init();

    jest.useFakeTimers();

    createBuyerUseCase = moduleRef.get<CreateBuyer>(CreateBuyer);
  });

  describe('Create buyer test', () => {
    it('Create new buyer', (done) => {
      mockHttpService.post.mockReturnValue(
        of({
          data: {
            id: '1c8266e6-f314-4612-8269-59510b55f9f4',
          },
        }),
      );

      const address = {
        address: 'Test adress',
        complement: 'Test',
        neighborhood: 'Testt',
        city: 'Sao Paulo',
        state: 'SP',
        zipCode: '12980000',
        country: 'BRASIL',
        number: '123',
      };

      const companyRepresentative: CompanyRepresentativeProps = {
        name: 'Test',
        email: 'test@gmail.com',
        address,
        documentType: '',
        documentValue: '',
        phoneNumber: '',
        motherName: '',
        birthDate: '',
        isPoliticallyExposedPerson: false,
      };

      const requestBody: CreateBuyerInput = {
        tenantId: 'teste-1245',
        name: 'Test Buyer',
        email: 'test@example.com',
        address,
        documentType: 'CPF',
        documentValue: '66401553030',
        phoneNumber: '332424554233',
        motherName: 'TESTE',
        birthDate: new Date('1990-03-21'),
        companyRepresentative,
        companyTradingName: 'TESTE',
        isPoliticallyExposedPerson: false,
      };

      createBuyerUseCase.execute(requestBody).subscribe((response) => {
        expect(response.id).toHaveLength(36);
        done();
      });
    }, 1000);
  });
});
