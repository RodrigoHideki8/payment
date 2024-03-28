import { DomainEvent } from '@/domain/events/domain-event';
import { Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const WHEN_EVENT_KEY = 'EVENT_TARGET';
export const When = (value: string[]) => SetMetadata(WHEN_EVENT_KEY, value);

@Injectable()
export class ReplayEventsHelper<
  EntityType extends Record<string, any> = Record<string, any>,
> {
  constructor(private readonly reflector: Reflector) {}

  private extractMethods(entity: EntityType): string[] {
    return Object.getOwnPropertyNames(entity.__proto__).filter(
      (propriedade) =>
        typeof entity[propriedade] === 'function' &&
        propriedade !== 'constructor',
    );
  }

  private loadFromEvent(
    entity: EntityType,
    event: DomainEvent<EntityType>,
  ): void {
    const methods = this.extractMethods(entity);

    methods.forEach((method) => {
      const methodEnabled = this.reflector.get<string[]>(
        WHEN_EVENT_KEY,
        entity[method],
      );

      if (methodEnabled && methodEnabled.includes(event.type)) {
        entity[method](event.payload);
      }
    });
  }

  replayEvents(entity: EntityType, events: DomainEvent<EntityType>[]): void {
    events.forEach((event) => {
      this.loadFromEvent(entity, event);
    });
  }
}
