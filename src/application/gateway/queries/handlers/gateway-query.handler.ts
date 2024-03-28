import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GatewayQuery } from '@application/gateway/queries/models/gateway.query';
import { GatewayRepository } from '@/domain/contracts/infra-layer/repository/gateway.repository';
import { firstValueFrom } from 'rxjs';

@QueryHandler(GatewayQuery)
export class GatewayQueryHandler implements IQueryHandler<GatewayQuery> {
  constructor(private readonly gatewayRepository: GatewayRepository) {}
  async execute(query: GatewayQuery): Promise<any> {
    return firstValueFrom(
      this.gatewayRepository.list(
        { tenantId: query.tenantId },
        query.page,
        query.limit,
      ),
    );
  }
}
