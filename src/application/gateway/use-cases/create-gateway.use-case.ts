import { Injectable, Provider } from '@nestjs/common';
import {
  CreateGateway,
  CreateGatewayInput,
  CreateGatewayOutput,
} from '@domain/use-cases/gateway/create-gateway';
import { from, map, mergeMap, Observable } from 'rxjs';
import { CommandBus } from '@nestjs/cqrs';
import { CreateGatewayCommand } from '@application/gateway/commands/models/create-gateway.command';
import { Gateway } from '../gateway';
import { GatewayRepository } from '@/domain/contracts/infra-layer/repository/gateway.repository';

@Injectable()
export class CreateGatewayUseCase implements CreateGateway {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly gatewayRepo: GatewayRepository,
  ) {}
  private static readonly MESSAGE_GATEWAY_EXISTS = 'Gateway already exists!';

  execute(input: CreateGatewayInput): Observable<CreateGatewayOutput> {
    const gateway = new Gateway()
      .setTenantId(input.tenantId)
      .setName(input.name)
      .setPlayer(input.player)
      .setRules(input.rules)
      .setGatewayConfigs(input.gatewayConfigs);
    const result = this.gatewayRepo.getOne({
      player: input.player,
    });
    return from(result).pipe(
      mergeMap((response) => {
        if (response == null) {
          const createGatewayCommand = new CreateGatewayCommand(gateway);
          const command$ = this.commandBus.execute(createGatewayCommand);
          return from(command$);
        }
        throw Error(CreateGatewayUseCase.MESSAGE_GATEWAY_EXISTS);
      }),
      map((response) => {
        return response;
      }),
    );
  }
}
export const CreateGatewayUseCaseProvider: Provider = {
  provide: CreateGateway,
  useClass: CreateGatewayUseCase,
};
