import { PaymentRepository } from '@/domain/contracts/infra-layer/repository/payment.repository';
import { IPayment } from '@/domain/entities/payment';
import { PaymentCanceledEvent } from '@/application/payment/events/models/payment-canceled.event';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class PaymentCancelIntegrationEventHandler {
  constructor(private readonly paymentRepo: PaymentRepository) {}
  @OnEvent(PaymentCanceledEvent.name)
  async handleEvent(event: PaymentCanceledEvent) {
    const payment = event.payload as IPayment;
    await this.paymentRepo.updateById(event.aggregateId, payment, null);
  }
}
