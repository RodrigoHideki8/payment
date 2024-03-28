import { Address, CompanyRepresentative } from '@/domain/value-objects';
import { BaseModel } from '@/infrastructure/repositories/mongodb/base-model';
import { Prop, Schema } from '@nestjs/mongoose/dist';

export type BuyerDocument = BuyerModel & Document;

@Schema({ collection: 'buyer' })
export class BuyerModel extends BaseModel {
  @Prop({ type: String, required: true })
  tenantId: string;
  @Prop({ type: String, required: true })
  name: string;
  @Prop({ type: String })
  email: string;
  @Prop({ type: Map })
  address: Address;
  @Prop({ type: String, required: true })
  documentType: string;
  @Prop({ type: String, required: true })
  documentValue: string;
  @Prop({ type: String })
  phoneNumber: string;
  @Prop({ type: Map })
  companyRepresentative?: CompanyRepresentative;
  @Prop({ type: String })
  motherName: string;
  @Prop({ type: Date })
  birthDate: Date;
  @Prop({ type: String })
  companyTradingName?: string;
  @Prop({ type: Boolean })
  isPoliticallyExposedPerson: boolean;
}
