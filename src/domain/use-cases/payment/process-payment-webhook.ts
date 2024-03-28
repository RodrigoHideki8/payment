import { UniqueIdentifier } from '@/domain/entities/types';
import { UseCase } from '@domain/use-cases/use-case';

export type ProcessPaymentWebhookInput = {
  gatewayId: UniqueIdentifier;
  tenantId: string;
  payload: Record<string, any>;
};

export abstract class ProcessPaymentWebhook extends UseCase<
  ProcessPaymentWebhookInput,
  void
> {}
