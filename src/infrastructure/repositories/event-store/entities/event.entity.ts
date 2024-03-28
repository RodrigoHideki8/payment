import { DomainEvent } from '@domain/events/domain-event';
import { UniqueIdentifier } from '@domain/entities/types';
import { DeepPartial } from '@domain/types/types';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('events')
export class EventEntity<
  Aggregate extends Record<string, any> = Record<string, any>,
> implements DomainEvent<Aggregate>
{
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: Required<Readonly<UniqueIdentifier>>;

  @Column({ type: 'uuid', name: 'aggregate_id' })
  aggregateId: Required<Readonly<UniqueIdentifier>>;

  @Column({ type: 'jsonb', name: 'payload' })
  payload: Readonly<DeepPartial<Aggregate>>;

  @Column({ type: 'timestamptz', nullable: false })
  timestamp: Required<Readonly<Date>>;

  @Column({ type: 'varchar' })
  type: Required<Readonly<string>>;

  @Column({ type: 'integer', default: 1 })
  version: Readonly<number>;

  @Column({ type: 'varchar' })
  streamName: Required<Readonly<string>>;
}
