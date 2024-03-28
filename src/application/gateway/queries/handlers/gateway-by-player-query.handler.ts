import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GatewayByPlayerQuery } from '@application/gateway/queries/models/gateway-by-player.query';
import { GatewayRepository } from '@/domain/contracts/infra-layer/repository/gateway.repository';
import { firstValueFrom } from 'rxjs';

@QueryHandler(GatewayByPlayerQuery)
export class GatewayByPlayerQueryHandler
  implements IQueryHandler<GatewayByPlayerQuery>
{
  constructor(private readonly gatewayRepository: GatewayRepository) {}
  async execute(query: GatewayByPlayerQuery): Promise<any> {
    return firstValueFrom(
      this.gatewayRepository.getOne({
        player: query.player,
        tenantId: query.tenantId,
      }),
    );
  }
}
