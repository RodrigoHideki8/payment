import { Injectable, Provider } from '@nestjs/common';
import { Model } from 'mongoose';
import { Observable, of, mergeMap } from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import { LoggerRepository } from '@/domain/contracts/infra-layer/repository/logger.repository';
import {
  PaymentGatewayLogDocument,
  PaymentGatewayLogModel,
} from './models/payment-gateway-logger.model';
import { PaymentGatewayLog } from '@/domain/contracts/infra-layer/payment-gateway/payment-gateway-logger.contract';

@Injectable()
export class PaymentGatewayLoggerRepositoryImpl extends LoggerRepository<PaymentGatewayLog> {
  constructor(
    @InjectModel('payment-gateway-log')
    readonly model: Model<PaymentGatewayLogDocument>,
  ) {
    super();
  }

  capture(logger: PaymentGatewayLog): Observable<void> {
    const _promise = this.model.create([{ ...logger }]);
    return of(_promise).pipe(mergeMap(() => of(void 0)));
  }
}

export const PaymentGatewayLoggerRepositoryProvider: Provider = {
  provide: 'PAYMENT_GATEWAY_LOGGER',
  useClass: PaymentGatewayLoggerRepositoryImpl,
};
