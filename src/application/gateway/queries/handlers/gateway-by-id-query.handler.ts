import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GatewayByIdQuery } from '@application/gateway/queries/models/gateway-by-id.query';
import { GatewayRepository } from '@/domain/contracts/infra-layer/repository/gateway.repository';
import { firstValueFrom } from 'rxjs';

@QueryHandler(GatewayByIdQuery)
export class GatewayByIdQueryHandler
  implements IQueryHandler<GatewayByIdQuery>
{
  constructor(private readonly gatewayRepository: GatewayRepository) {}
  async execute(query: GatewayByIdQuery): Promise<any> {
    return firstValueFrom(this.gatewayRepository.get(query.id));
  }
}
