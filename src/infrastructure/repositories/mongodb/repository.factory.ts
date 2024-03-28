import mongoosePaginate from 'mongoose-paginate-v2';
import { SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export abstract class RepositoryFactory {
  static CreateSimpleSchema(schema: any): mongoose.Schema<any> {
    return SchemaFactory.createForClass(schema);
  }
  static CreateSchemaWithPaginationPlugin(schema: any): mongoose.Schema<any> {
    const entitySchema = SchemaFactory.createForClass(schema);
    entitySchema.plugin(mongoosePaginate);
    return entitySchema;
  }
}
