import { Queue } from '@domain/value-objects/queue';

export abstract class QueueServiceContract {
  abstract enqueue<T>(queue: Queue, payload: T): Promise<void>;
  abstract consume<T = any>(
    queue: Queue,
    callbackFn: (
      message: T,
      ackMessageFn: (mustBeAck: boolean) => void,
    ) => Promise<void>,
  ): Promise<void>;
}
