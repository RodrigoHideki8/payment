import { QueueServiceContract } from '@/domain/contracts/infra-layer/queue/queue-service.contract';
import { Queue } from '@/domain/value-objects';
import { Injectable, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as rabbitMqClient from 'amqplib';
import { Channel, Connection } from 'amqplib';

interface AmazonMqOpts {
  hostname: string;
  port: number;
  username: string;
  password: string;
  protocol: string;
  vhost: string;
}

@Injectable()
export class RabbitMqService implements QueueServiceContract {
  private readonly client: any;
  private static readonly TIMEOUT_TO_NACK_MESSAGE_IN_MILLISECONDS: number = 10000;
  private channelsAvailable: Map<string, Channel>;
  constructor(private readonly configService: ConfigService) {
    this.client = rabbitMqClient;
    this.channelsAvailable = new Map<string, Channel>();
  }

  async enqueue<T>(queue: Queue, payload: T): Promise<void> {
    this.validateQueue(queue);
    const channel: Channel | undefined = this.channelsAvailable.get(queue.name);
    if (channel) return this.send(channel, queue, payload);
    const newChannel = await this.connectToQueue(queue);
    this.channelsAvailable.set(queue.name, newChannel);
    this.send(newChannel, queue, payload);
  }

  async consume<T = any>(
    queue: Queue,
    callbackFn: (
      message: T,
      ackMessageFn: (mustBeAck: boolean) => void,
    ) => void,
  ): Promise<void> {
    this.validateQueue(queue);
    const channel: Channel = await this.connectToQueue(queue);
    await channel.consume(queue.name, async (msg) => {
      if (!msg) return;
      const stringData = msg.content.toString('utf8');
      const jsonData = JSON.parse(stringData);
      function ackMessageFn(mustBeAck: boolean): void {
        if (mustBeAck) return channel.ack(msg);
        setTimeout(() => {
          return channel.nack(msg);
        }, RabbitMqService.TIMEOUT_TO_NACK_MESSAGE_IN_MILLISECONDS);
      }
      await callbackFn(jsonData, ackMessageFn);
    });
  }

  private getConnection(): AmazonMqOpts {
    return {
      hostname: this.configService.get('AMAZON_MQ_HOST'),
      port: this.configService.get('AMAZON_MQ_PORT'),
      username: this.configService.get('AMAZON_MQ_USERNAME'),
      password: this.configService.get('AMAZON_MQ_PASSWORD'),
      protocol: this.configService.get('AMAZON_MQ_PROTOCOL'),
      vhost: this.configService.get('AMAZON_MQ_VHOST'),
    };
  }

  private send(channel: Channel, queue: Queue, payload: any): void {
    const data = { data: payload };
    const buffer = Buffer.from(JSON.stringify(data));
    channel.sendToQueue(queue.name, buffer, {
      expiration: queue.recordsMustBeExpiresAt,
    });
  }

  private validateQueue(queue: Queue): void | never {
    if (!queue || !queue.name) {
      throw new Error('Invalid queue sent');
    }
  }

  private async connectToQueue(queue: Queue): Promise<Readonly<Channel>> {
    const connectionObject: AmazonMqOpts = this.getConnection();
    const connection: Connection = await this.client.connect(connectionObject);
    const channel: Channel = await connection.createChannel();
    await channel.assertQueue(queue.name, {
      durable: queue.isDurable,
      expires: queue.recordsMustBeExpiresAt,
    });
    return channel;
  }
}

export const RabbitMqServiceProvider: Provider = {
  provide: QueueServiceContract,
  useClass: RabbitMqService,
};
