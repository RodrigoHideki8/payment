import { Prop, Schema } from '@nestjs/mongoose';
import { BaseModel } from '@/infrastructure/repositories/mongodb/base-model';
import {
  PaymentSplit,
  PaymentStatus,
  PaymentTransaction,
  PaymentType,
} from '@/domain/entities/payment';
import { Metadata } from '@/domain/value-objects';
import { UniqueIdentifier } from '@/domain/entities/types';

export type PaymentDocument = PaymentModel & Document;

@Schema({ collection: 'payment' })
export class PaymentModel extends BaseModel {
  @Prop({ type: String, required: true })
  tenantId: string;

  @Prop({ type: String, required: true })
  buyerId: UniqueIdentifier;

  @Prop({ type: String, required: true })
  accountId: UniqueIdentifier;

  @Prop({ type: String, required: true })
  orderId: string;

  @Prop({ type: String })
  type: PaymentType;

  @Prop({ type: String, required: true })
  amount: number;

  @Prop({ type: String })
  status: PaymentStatus;

  @Prop({ type: String, required: true })
  gatewayId: UniqueIdentifier;

  @Prop({ type: Map })
  metadata: Metadata;

  @Prop({ type: Number })
  installments?: number;

  @Prop({ type: Array })
  transactions?: PaymentTransaction[];

  @Prop({
    type: Date,
    name: 'expiration_at',
    get() {
      return this.expirationAt;
    },
  })
  expirationAt?: Date;

  @Prop({ type: Array })
  split?: PaymentSplit[];
}
