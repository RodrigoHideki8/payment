import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  Provider,
} from '@nestjs/common';
import {
  UpdateGateway,
  UpdateGatewayInput,
  UpdateGatewayOutput,
} from '@domain/use-cases/gateway/update-gateway';
import { from, map, Observable, switchMap, tap } from 'rxjs';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateGatewayCommand } from '@application/gateway/commands/models/update-gateway.command';
import { Gateway } from '@application/gateway/gateway';
import { EventStore } from '@/domain/contracts/infra-layer/repository/event-store.repository';
import { DomainEvent } from '@/domain/events/domain-event';
import { IGateway } from '@/domain/entities';

@Injectable()
export class UpdateGatewayUseCase implements UpdateGateway {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventStore: EventStore<IGateway>,
  ) {}
  execute(input: UpdateGatewayInput): Observable<UpdateGatewayOutput> {
    const lastOccurrence$ = this.eventStore.getLastOccurrenceTo(
      input.aggregateId,
      Gateway.name,
    );
    return from(lastOccurrence$).pipe(
      tap((user: DomainEvent<IGateway>) => {
        if (user == null)
          throw new NotFoundException(
            `Payment [${input.aggregateId}] not found.`,
          );
      }),
      map((domainEvent) => domainEvent.payload),
      tap((gateway: IGateway) => {
        if (gateway.tenantId != input.tenantId)
          throw new ForbiddenException(
            `This entity is not from this tentantId.`,
          );
      }),
      switchMap((gateway: IGateway) => {
        delete input.aggregateId;
        Object.assign(gateway, input);
        gateway = Gateway.fromIGateway(gateway);
        const updateGatewayCommand = new UpdateGatewayCommand(gateway);
        const command$ = this.commandBus.execute(updateGatewayCommand);
        return from(command$);
      }),
    );
  }
}

export const UpdateGatewayUseCaseProvider: Provider = {
  provide: UpdateGateway,
  useClass: UpdateGatewayUseCase,
};
