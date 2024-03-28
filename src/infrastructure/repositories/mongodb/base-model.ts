import { UniqueIdentifier } from '@/domain/entities/types';
import { Prop } from '@nestjs/mongoose';
import { Schema } from '@nestjs/mongoose/dist';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class BaseModel {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({
    type: Date,
    default: Date.now,
    name: 'created_at',
    get() {
      return this.created_at;
    },
  })
  createdAt?: Date;

  @Prop({
    type: Date,
    default: Date.now,
    name: 'updated_at',
    get() {
      return this.updatedAt;
    },
  })
  updatedAt?: Date;

  @Prop({
    type: Boolean,
    default: true,
  })
  active?: boolean;
}
