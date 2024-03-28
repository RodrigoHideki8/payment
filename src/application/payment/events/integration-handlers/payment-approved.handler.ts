import { PaymentRepository } from '@/domain/contracts/infra-layer/repository/payment.repository';
import { IPayment } from '@/domain/entities/payment';
import { PaymentApprovedEvent } from '@/application/payment/events/models/payment-approved.event';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class PaymentApprovedIntegrationEventHandler {
  constructor(private readonly paymentRepo: PaymentRepository) {}
  @OnEvent(PaymentApprovedEvent.name)
  async handleEvent(event: PaymentApprovedEvent) {
    const payment = event.payload as IPayment;
    await this.paymentRepo.updateById(event.aggregateId, payment, null);
  }
}
