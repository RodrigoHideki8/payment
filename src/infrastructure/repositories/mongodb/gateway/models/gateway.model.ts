import { GatewayRule } from '@/domain/value-objects';
import { BaseModel } from '@/infrastructure/repositories/mongodb/base-model';
import { Prop, Schema } from '@nestjs/mongoose/dist';

export type GatewayDocument = GatewayModel & Document;

@Schema({ collection: 'gateway' })
export class GatewayModel extends BaseModel {
  @Prop({ type: String, required: true })
  tenantId: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  player: string;

  @Prop({ type: Object })
  rules: GatewayRule[];

  @Prop({ type: Object })
  gatewayConfigs?: Record<string, any>;
}
