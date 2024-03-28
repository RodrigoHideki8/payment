import { PaymentRepository } from '@/domain/contracts/infra-layer/repository/payment.repository';
import { IPayment } from '@/domain/entities/payment';
import { PaymentPreApprovedEvent } from '@/application/payment/events/models/payment-pre-approved.event';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class PaymentPreApprovedIntegrationEventHandler {
  constructor(private readonly paymentRepo: PaymentRepository) {}
  @OnEvent(PaymentPreApprovedEvent.name)
  async handleEvent(event: PaymentPreApprovedEvent) {
    const payment = event.payload as IPayment;
    await this.paymentRepo.updateById(event.aggregateId, payment, null);
  }
}
