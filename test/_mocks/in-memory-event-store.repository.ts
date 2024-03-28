import { PaymentCreatedEvent } from '@/application/payment/events/models/payment-created.event';
import { EventStore } from '@/domain/contracts/infra-layer/repository/event-store.repository';
import {
  CaptureType,
  IPayment,
  PaymentStatus,
} from '@/domain/entities/payment';
import { UniqueIdentifier } from '@/domain/entities/types';
import { DomainEvent } from '@/domain/events/domain-event';
import { DeepPartial } from '@/domain/types/types';
import { Address, Document, Metadata, Phone } from '@/domain/value-objects';
import { CreditCard } from '@/domain/value-objects/credit-card';
import { Brand } from '@/infrastructure/services/payment-gateway/paynet/types';
import { Readable } from 'stream';

export class InMemoryEventStoreRepository<
  Aggregate extends Record<string, any> = Record<string, any>,
> implements EventStore<Aggregate>
{
  append(record: DomainEvent<Aggregate>): Promise<void> {
    return undefined;
  }
  getVersion(aggregateId: UniqueIdentifier): Promise<number> {
    return Promise.resolve(1);
  }
  replayTo(aggregateId: UniqueIdentifier): Readable {
    return undefined;
  }
  replayAll(aggregateId: UniqueIdentifier): Readable {
    return undefined;
  }
  hasAny(aggregateId: UniqueIdentifier): Promise<boolean> {
    return Promise.resolve(false);
  }
  getLastOccurrenceTo(
    aggregateId: UniqueIdentifier,
  ): Promise<DomainEvent<Aggregate>> {
    const test = {
      id: aggregateId,
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
      buyer: {
        email: 'teste@teste.com',
        birthdate: '16/10/2014',
        document: { number: '12345678944', type: 'CPF' } as Document,
        firstName: 'Teste',
        lastName: 'Teste',
        phone: {
          areaCode: '11',
          countryCode: '+55',
          number: '11988754474',
        } as Phone,
        address: {
          address: 'Rua tal',
          neighborhood: 'Tal que',
          city: 'City',
          state: 'SP',
          zipCode: '060111111',
          country: 'BR',
          number: '1',
        } as Address,
      },
      metadata: {
        userAgent: 'test',
        ipAddress: '127.0.0.1',
        device: 'test',
      } as Metadata,
      softDescription: 'Teste',
      gateway: 'PAYNET',
      orderId: '123',
      userId: '123',
      status: 'approved' as PaymentStatus,
    };

    const event: DomainEvent<Aggregate> = {
      type: 'PaymentCreatedEvent',
      aggregateId: aggregateId,
      payload: test as any,
      timestamp: new Date(),
      version: 1,
    };

    return Promise.resolve(event);
  }
}
