import { EventStore } from '@/domain/contracts/infra-layer/repository/event-store.repository';
import { IGateway } from '@/domain/entities';
import { DomainEvent } from '@/domain/events/domain-event';
import { DeleteGatewayCommand } from '@application/gateway/commands/models/delete-gateway.command';
import {
  DeleteGateway,
  DeleteGatewayInput,
} from '@domain/use-cases/gateway/delete-gateway';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  Provider,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Observable, from, map, switchMap, tap } from 'rxjs';
import { Gateway } from '../gateway';

@Injectable()
export class DeleteGatewayUseCase implements DeleteGateway {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventStore: EventStore<IGateway>,
  ) {}
  execute(input: DeleteGatewayInput): Observable<void> {
    const lastOccurrence$ = this.eventStore.getLastOccurrenceTo(
      input.aggregateId,
      Gateway.name,
    );
    return from(lastOccurrence$).pipe(
      tap((gateway: DomainEvent<IGateway>) => {
        if (gateway === null)
          throw new NotFoundException(
            `Payment [${input.aggregateId}] not found.`,
          );
      }),
      map((domainEvent) => domainEvent.payload),
      tap((gateway: IGateway) => {
        if (gateway.tenantId !== input.tenantId)
          throw new ForbiddenException(
            `This entity is not from this tentantId.`,
          );
      }),
      switchMap((gateway: IGateway) => {
        const updateGatewayCommand = new DeleteGatewayCommand(gateway.id);
        const command$ = this.commandBus.execute(updateGatewayCommand);
        return from(command$).pipe(map((res) => void 0));
      }),
    );
  }
}
export const DeleteGatewayUseCaseProvider: Provider = {
  provide: DeleteGateway,
  useClass: DeleteGatewayUseCase,
};
