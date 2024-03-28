import { Prop, Schema } from '@nestjs/mongoose';
import { UniqueIdentifier } from '@/domain/entities/types';
import { WebhookProccessingStatus } from '@/domain/contracts/infra-layer/payment-gateway/webhook-logger.contract';

export type WebhookLogDocument = WebhookLogModel & Document;

@Schema({ collection: 'webhook-log', timestamps: { createdAt: 'created_at' } })
export class WebhookLogModel {
  @Prop({
    type: Date,
    default: Date.now,
    name: 'created_at',
    get() {
      return this.created_at;
    },
  })
  createdAt: Date;

  @Prop({ type: String, required: true })
  tenantId: string;

  @Prop({ type: String, required: true })
  gatewayId: UniqueIdentifier;

  @Prop({ type: String })
  status: WebhookProccessingStatus;

  @Prop({ type: String })
  reason: string;

  @Prop({ type: Map })
  payload: Record<string, any>;
}
