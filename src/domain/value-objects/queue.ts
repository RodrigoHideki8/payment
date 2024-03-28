import { ValueObject } from '@domain/value-objects/value-object';
import { QueueProps } from '@domain/value-objects/types';

export class Queue extends ValueObject<QueueProps> {
  name: Required<Readonly<string>>;
  endpoint?: Readonly<string>;
  isDurable?: Readonly<boolean>;
  recordsMustBeExpiresAt?: Readonly<number>;
  constructor(
    name: string,
    isDurable?: boolean,
    recordsMustBeExpiresAt?: number,
    endpoint?: string,
  ) {
    super({ name, isDurable, recordsMustBeExpiresAt, endpoint });
    this.name = name;
    this.isDurable = isDurable;
    this.recordsMustBeExpiresAt = recordsMustBeExpiresAt;
    this.endpoint = endpoint;
  }
}
