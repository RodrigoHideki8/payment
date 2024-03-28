import { Injectable, Provider } from '@nestjs/common';
import { Model } from 'mongoose';
import { Observable, of, mergeMap } from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import { LoggerRepository } from '@/domain/contracts/infra-layer/repository/logger.repository';
import {
  ReceiverInGatewayDocument,
  ReceiverInGatewayModel,
} from './models/receiver-in-gateway.model';
import { ReceiverInGateway } from '@/domain/contracts/infra-layer/payment-gateway/receiver-in-gateway.contract';

@Injectable()
export class ReceiverInGatewayRepositoryImpl extends LoggerRepository<ReceiverInGateway> {
  constructor(
    @InjectModel('receiver-in-gateway')
    readonly model: Model<ReceiverInGatewayDocument>,
  ) {
    super();
  }

  capture(logger: ReceiverInGateway): Observable<void> {
    const _promise = this.model.create([{ ...logger }]);
    return of(_promise).pipe(mergeMap(() => of(void 0)));
  }
}

export const ReceiverInGatewayRepositoryProvider: Provider = {
  provide: 'RECEIVER_IN_GATEWAY',
  useClass: ReceiverInGatewayRepositoryImpl,
};
