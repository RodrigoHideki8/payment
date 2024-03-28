import { UniqueIdentifier } from '@/domain/entities/types';
import { Prop, Schema } from '@nestjs/mongoose/dist';
export type ReceiverInGatewayDocument = ReceiverInGatewayModel & Document;

@Schema({
  collection: 'receiver-in-gateway',
  timestamps: { createdAt: 'created_at' },
})
export class ReceiverInGatewayModel {
  @Prop({ type: String, required: true })
  accountId: string;
  @Prop({ type: Number, required: true })
  adjustedValue: number;
  @Prop({ type: Number, required: true })
  installments: number;
  @Prop({ type: Number, required: true })
  taxAntecipation: number;
  @Prop({ type: Number, required: true })
  value: number;
  @Prop({ type: Array<number> })
  antecipationDays: Array<number>;
  @Prop({ type: Date })
  settlementDate: Date;
  @Prop({ type: String })
  gatewayId?: UniqueIdentifier;
}
