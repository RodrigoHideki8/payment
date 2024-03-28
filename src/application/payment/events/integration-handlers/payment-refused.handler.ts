import { PaymentRepository } from '@/domain/contracts/infra-layer/repository/payment.repository';
import { IPayment } from '@/domain/entities/payment';
import { PaymentRefusedEvent } from '@/application/payment/events/models/payment-refused.event';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class PaymentRefusedIntegrationEventHandler {
  constructor(private readonly paymentRepo: PaymentRepository) {}
  @OnEvent(PaymentRefusedEvent.name)
  async handleEvent(event: PaymentRefusedEvent) {
    const payment = event.payload as IPayment;
    await this.paymentRepo.updateById(event.aggregateId, payment, null);
  }
}
