import { UniqueIdentifier } from '@/domain/entities/types';

export type PaymentGatewayLog = {
  tenantId: string;
  gatewayId: UniqueIdentifier;
  createdAt?: Date;
  player: string;
  statusCode: number;
  request: Record<string, any>;
  response: Record<string, any>;
};
