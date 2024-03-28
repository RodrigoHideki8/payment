import { Inject, Injectable, Provider } from '@nestjs/common';
import { DomainEvent } from '@domain/events/domain-event';
import { EventStore } from '@domain/contracts/infra-layer/repository/event-store.repository';
import { DataSource, Repository } from 'typeorm';
import { EventEntity } from '@/infrastructure/repositories/event-store/entities/event.entity';
import { UniqueIdentifier } from '@domain/entities/types';
import { Readable } from 'stream';
import { ObjectUtil } from '@domain/utils/object.util';

@Injectable()
export class EventStoreRepository<
  Aggregate extends Record<string, any> = Record<string, any>,
> implements EventStore<Aggregate>
{
  constructor(
    @Inject('EVENT_REPOSITORY')
    private readonly eventRepository: Repository<EventEntity>,
  ) {}

  async append(event: DomainEvent<Aggregate>): Promise<void> {
    const payload = ObjectUtil.RemoveUndefinedProperties(event.payload);
    const version: number = await this.getNextVersion(event.aggregateId);
    await this.eventRepository.insert({ ...event, payload, version });
  }

  private async getNextVersion(aggregateId: UniqueIdentifier): Promise<number> {
    const version = await this.getVersion(aggregateId);
    return version + 1;
  }

  async getVersion(aggregateId: UniqueIdentifier): Promise<number> {
    return await this.eventRepository.count({ where: { aggregateId } });
  }

  async getLastOccurrenceTo(
    aggregateId: UniqueIdentifier,
    streamName: string,
  ): Promise<DomainEvent<Aggregate>> {
    const version = await this.getVersion(aggregateId);
    return (await this.eventRepository.findOneBy({
      version,
      aggregateId,
      streamName,
    })) as DomainEvent<Aggregate>;
  }

  async replayTo(
    aggregateId: UniqueIdentifier,
  ): Promise<DomainEvent<Aggregate>[]> {
    return (await this.eventRepository.findBy({
      aggregateId,
    })) as DomainEvent<Aggregate>[];
  }

  replayAll(): Readable {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const readable = new Readable({ read(size: number) {} });

    return readable;
  }

  async hasAny(
    aggregateId: UniqueIdentifier,
    streamName: string,
  ): Promise<boolean> {
    return await this.eventRepository.exist({
      where: { aggregateId, streamName },
    });
  }
}

export const eventProviders: Provider[] = [
  {
    provide: 'EVENT_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(EventEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: EventStore,
    useClass: EventStoreRepository,
  },
];
