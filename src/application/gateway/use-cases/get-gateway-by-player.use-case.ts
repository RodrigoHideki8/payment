import {
  GetGatewayByPlayer,
  GetGatewayByPlayerInput,
  GetGatewayByPlayerOutput,
} from '@/domain/use-cases/gateway/get-gateway-by-player';
import { Injectable, Provider } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Observable, from } from 'rxjs';
import { GatewayByPlayerQuery } from '@/application/gateway/queries/models/gateway-by-player.query';

@Injectable()
export class GetGatewayByPlayerUseCase implements GetGatewayByPlayer {
  constructor(private readonly queryBus: QueryBus) {}

  execute(
    input: GetGatewayByPlayerInput,
  ): Observable<GetGatewayByPlayerOutput> {
    return from(
      this.queryBus.execute(
        new GatewayByPlayerQuery(input.tenantId, input.player),
      ),
    );
  }
}

export const GetGatewayByPlayerUseCaseProvider: Provider = {
  provide: GetGatewayByPlayer,
  useClass: GetGatewayByPlayerUseCase,
};
