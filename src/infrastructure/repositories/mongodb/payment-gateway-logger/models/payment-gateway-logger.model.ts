import { Prop, Schema } from '@nestjs/mongoose';
import { UniqueIdentifier } from '@/domain/entities/types';

export type PaymentGatewayLogDocument = PaymentGatewayLogModel & Document;

@Schema({
  collection: 'payment-gateway-log',
  timestamps: { createdAt: 'created_at' },
})
export class PaymentGatewayLogModel {
  @Prop({
    type: Date,
    default: Date.now,
    name: 'created_at',
    get() {
      return this.created_at;
    },
  })
  createdAt?: Date;

  @Prop({ type: String, required: true })
  tenantId: string;

  @Prop({ type: String, required: true })
  gatewayId: UniqueIdentifier;

  @Prop({ type: String, required: true })
  player: string;

  @Prop({ type: Number })
  statusCode: number;

  @Prop({ type: Map })
  request: Record<string, any>;

  @Prop({ type: Map })
  response: Record<string, any>;
}
