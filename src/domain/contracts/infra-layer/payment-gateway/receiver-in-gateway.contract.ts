import { UniqueIdentifier } from '@/domain/entities/types';

export type ReceiverInGateway = {
  accountId: string;
  adjustedValue: number;
  value: number;
  installments: number;
  antecipationDays: Array<number>;
  taxAntecipation: number;
  settlementDate: Date;
  gatewayId: UniqueIdentifier;
};
