import { DeleteGatewayInput } from '@/domain/use-cases/gateway/delete-gateway';
import { UniqueIdentifier } from '@domain/entities/types';
import { IsString, IsUUID } from 'class-validator';

export class DeleteGatewayInputDto implements DeleteGatewayInput {
  tenantId: string;

  @IsString()
  @IsUUID()
  aggregateId: UniqueIdentifier;
}
