import { PaymentOutputType } from '@/domain/contracts/infra-layer/payment-gateway/payment-gateway.contract';
import { PaymentRepository } from '@/domain/contracts/infra-layer/repository/payment.repository';
import { PaginatedList } from '@/domain/contracts/infra-layer/repository/types';
import {
  CaptureType,
  IPayment,
  PaymentStatus,
} from '@/domain/entities/payment';
import { UniqueIdentifier } from '@/domain/entities/types';
import { Address, Document, Metadata, Phone } from '@/domain/value-objects';
import { CreditCard } from '@/domain/value-objects/credit-card';
import { Brand } from '@/infrastructure/services/payment-gateway/paynet/types';
import { ClientSession } from 'mongoose';
import { Observable, of } from 'rxjs';
import { DeepPartial } from 'typeorm';

export class InMemoryCreateCreditCardRepository implements PaymentRepository {
  public payment: PaymentOutputType[] = [];

  create(input: any, session?: ClientSession): Observable<void> {
    return of();
  }

  updateById(
    id: UniqueIdentifier,
    record: DeepPartial<IPayment>,
    session?: any,
  ): Observable<void> {
    return of();
  }

  updateOne(
    input: any,
    record: DeepPartial<IPayment>,
    session?: any,
  ): Observable<void> {
    return of();
  }

  updateMany(
    query: any,
    record: DeepPartial<IPayment>,
    session?: any,
  ): Observable<void> {
    throw new Error('not implemented');
  }

  deactivate(id: UniqueIdentifier, session?: any): Observable<void> {
    throw new Error('not implemented');
  }

  activate(id: UniqueIdentifier, session?: any): Observable<void> {
    throw new Error('not implemented');
  }

  get(
    id: UniqueIdentifier,
    select?: string,
    session?: any,
  ): Observable<DeepPartial<IPayment>> {
    const test = {
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
      aggregateId: 'b1bffc9f-fde9-4a12-842c-3d24851aa296',
      status: 'approved' as PaymentStatus,
    };
    return of(test);
  }

  getOne(
    query: any,
    select?: string,
    session?: any,
  ): Observable<DeepPartial<IPayment>> {
    return of(undefined);
  }

  list(
    query: any,
    page: number,
    limit: number,
    select?: string,
  ): Observable<PaginatedList<DeepPartial<IPayment>>> {
    throw new Error('not implemented');
  }

  has(tenantId: string, query: any): Observable<boolean> {
    throw new Error('not implemented');
  }

  normalize(obj: IPayment): DeepPartial<IPayment> {
    throw new Error('not implemented');
  }
}
