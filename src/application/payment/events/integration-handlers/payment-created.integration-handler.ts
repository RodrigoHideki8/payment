import { IPayment } from '@/domain/entities/payment';
import { PaymentCreatedEvent } from '@application/payment/events/models/payment-created.event';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PaymentRepository } from '@/domain/contracts/infra-layer/repository/payment.repository';

@Injectable()
export class PaymentCreatedIntegrationEventHandler {
  constructor(private readonly paymentRepo: PaymentRepository) {}

  @OnEvent(PaymentCreatedEvent.name)
  async handleEvent(event: PaymentCreatedEvent) {
    await this.paymentRepo.create(event.payload as IPayment);
  }
}
