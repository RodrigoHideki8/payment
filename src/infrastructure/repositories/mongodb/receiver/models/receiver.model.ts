import { Address, CompanyRepresentative } from '@/domain/value-objects';
import { BaseModel } from '@/infrastructure/repositories/mongodb/base-model';
import { Prop, Schema } from '@nestjs/mongoose/dist';

export type ReceiverDocument = ReceiverModel & Document;

@Schema({ collection: 'receiver' })
export class ReceiverModel extends BaseModel {
  @Prop({ type: String, required: true })
  tenantId: string;
  @Prop({ type: String, required: true })
  name: string;
  @Prop({ type: String, required: true })
  email: string;
  @Prop({ type: Map, required: true })
  address: Address;
  @Prop({ type: String, required: true })
  documentType: string;
  @Prop({ type: String, required: true })
  documentValue: string;
  @Prop({ type: String })
  phoneNumber?: string;
  @Prop({ type: Map })
  companyRepresentative?: CompanyRepresentative;
  @Prop({ type: String })
  motherName?: string;
  @Prop({ type: Date })
  birthDate?: Date;
  @Prop({ type: String })
  companyTradingName?: string;
  @Prop({ type: Boolean })
  isPoliticallyExposedPerson?: boolean;
}
