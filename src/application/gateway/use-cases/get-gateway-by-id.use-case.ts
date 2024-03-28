import {
  GetGatewayById,
  GetGatewayByIdInput,
  GetGatewayByIdOutput,
} from '@/domain/use-cases/gateway/get-gateway-by-id';
import { Injectable, Provider } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Observable, from, map } from 'rxjs';
import { GatewayByIdQuery } from '@/application/gateway/queries/models/gateway-by-id.query';
import { IGateway } from '@/domain/entities';

@Injectable()
export class GetGatewayByIdUseCase implements GetGatewayById {
  constructor(private readonly queryBus: QueryBus) {}

  execute(input: GetGatewayByIdInput): Observable<GetGatewayByIdOutput> {
    return from(
      this.queryBus.execute(new GatewayByIdQuery(input.aggreageteId)),
    ).pipe(
      map((response: IGateway) => {
        return { id: response.id, ...response };
      }),
    );
  }
}

export const GetGatewayByIdUseCaseProvider: Provider = {
  provide: GetGatewayById,
  useClass: GetGatewayByIdUseCase,
};
