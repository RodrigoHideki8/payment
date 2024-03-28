import { PaginatedList } from '@/domain/contracts/infra-layer/repository/types';
import {
  RetrieveAllGateway,
  RetrieveAllGatewayInput,
  RetrieveAllGatewayOutput,
} from '@/domain/use-cases/gateway/retrieve-all-gateway';
import { Injectable, Provider } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Observable, from } from 'rxjs';
import { GatewayQuery } from '@application/gateway/queries/models/gateway.query';

@Injectable()
export class RetrieveAllGatewayUseCase implements RetrieveAllGateway {
  constructor(private readonly queryBus: QueryBus) {}

  execute(
    input?: Partial<RetrieveAllGatewayInput>,
  ): Observable<PaginatedList<RetrieveAllGatewayOutput>> {
    return from(
      this.queryBus.execute(
        new GatewayQuery(input.tenantId, input.page, input.limit),
      ),
    );
  }
}
export const RetrieveAllGatewayUseCaseProvider: Provider = {
  provide: RetrieveAllGateway,
  useClass: RetrieveAllGatewayUseCase,
};
