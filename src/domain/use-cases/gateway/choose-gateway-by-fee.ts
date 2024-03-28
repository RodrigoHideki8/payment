import { IGateway, PaymentType } from '@/domain/entities';
import { UseCase } from '../use-case';
import { UniqueIdentifier } from '@/domain/entities/types';

export type ChooseGatewayByFeeInput = {
  tenantId: UniqueIdentifier;
  paymentType: PaymentType;
  installments?: number;
  amount: number;
};

export type ChooseGatewayByFeeOutput = IGateway;

export abstract class ChooseGatewayByFee extends UseCase<
  ChooseGatewayByFeeInput,
  ChooseGatewayByFeeOutput
> {}
