import { Module } from '@nestjs/common';
import { MongodbModule } from '@/infrastructure/repositories/mongodb/mongodb.module';
import { PostgresDatabaseModule } from '@/infrastructure/repositories/event-store/postgres.module';

@Module({
  imports: [MongodbModule, PostgresDatabaseModule],
  exports: [MongodbModule, PostgresDatabaseModule],
})
export class DatabaseModule {}
