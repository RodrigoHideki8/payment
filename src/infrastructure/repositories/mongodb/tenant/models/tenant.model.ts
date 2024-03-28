import { BaseModel } from '@/infrastructure/repositories/mongodb/base-model';
import { Prop, Schema } from '@nestjs/mongoose/dist';

export type TenantDocument = TenantModel & Document;

@Schema({ collection: 'tenant' })
export class TenantModel extends BaseModel {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  domain: string;
}
