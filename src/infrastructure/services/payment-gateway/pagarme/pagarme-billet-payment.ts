import {
  BilletPaymentInputType,
  BilletPaymentOutputType,
  BilletPaymentTransaction,
} from '@/domain/contracts/infra-layer/payment-gateway';
import { Injectable, Provider } from '@nestjs/common';
import { PagarmeService } from '@/infrastructure/services/payment-gateway/pagarme/pagarme.service';
import {
  OrderPagarmeRequest,
  OrderPagarmeResponse,
} from '@/infrastructure/services/payment-gateway/pagarme/types';
import { firstValueFrom, map } from 'rxjs';
import { PaymentStatus } from '@/domain/entities';
import { removeSpecialCharacters } from '@/domain/utils/string.utils';

@Injectable()
export class CreateBilletPaymentTransactionPagarme extends BilletPaymentTransaction {
  constructor(private readonly paymentService: PagarmeService) {
    super();
  }
  async execute(
    input: BilletPaymentInputType,
  ): Promise<BilletPaymentOutputType> {
    const {
      softDescription,
      buyer,
      amount,
      orderNumber,
      expiresAt,
      gateway,
      split,
    } = input;

    const orderPagarmeRequest: OrderPagarmeRequest =
      this.paymentService.mapToBilletOrder(
        removeSpecialCharacters(softDescription),
        buyer,
        amount,
        orderNumber,
        expiresAt,
        gateway,
        split,
      );

    return await firstValueFrom(
      this.paymentService.createOrder(gateway, orderPagarmeRequest).pipe(
        map((data: OrderPagarmeResponse) => {
          const lastTransaction = data.charges[0].last_transaction;
          const status =
            data.charges[0].status === 'pending' ||
            data.charges[0].status === 'processing' ||
            data.charges[0].status === 'generated'
              ? PaymentStatus.WAITING
              : PaymentStatus.CANCELED;
          const response: BilletPaymentOutputType = {
            status,
            expiresAt: lastTransaction.due_at,
            paymentId: data.charges[0].id,
            qrCode: lastTransaction.qr_code,
            barCode: lastTransaction.line,
            pdfUrl: lastTransaction.pdf,
            ourNumber: lastTransaction.nosso_numero,
          };
          return response;
        }),
      ),
    );
  }
}

export const CreateBilletPaymentTransactionPagarmeProvider: Provider = {
  provide: BilletPaymentTransaction,
  useClass: CreateBilletPaymentTransactionPagarme,
};
