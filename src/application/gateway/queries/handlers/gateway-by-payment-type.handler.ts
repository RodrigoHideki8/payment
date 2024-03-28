import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GatewayRepository } from '@/domain/contracts/infra-layer/repository/gateway.repository';
import { firstValueFrom } from 'rxjs';
import { GatewayByPaymentTypeQuery } from '@application/gateway/queries/models/gateway-by-payment-type.query';
import { IGateway } from '@/domain/entities';
import { DeepPartial } from '@/domain/types/types';

@QueryHandler(GatewayByPaymentTypeQuery)
export class GatewayByPaymentTypeQueryHandler
  implements IQueryHandler<GatewayByPaymentTypeQuery>
{
  constructor(private readonly gatewayRepository: GatewayRepository) {}
  async execute(
    query: GatewayByPaymentTypeQuery,
  ): Promise<DeepPartial<IGateway[]>> {
    return firstValueFrom(
      this.gatewayRepository.getBy({
        tenantId: query.tenantId,
        'rules.paymentType': query.paymentType,
      }),
    );
  }
}
