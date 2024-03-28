import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EventEntity } from '@/infrastructure/repositories/event-store/entities/event.entity';
import { eventProviders } from '@/infrastructure/repositories/event-store/event-store.repository';

@Module({
  imports: [],
  providers: [
    {
      provide: 'DATA_SOURCE',
      useFactory: async () => {
        const dataSource = new DataSource({
          type: 'postgres',
          host: process.env.POSTGRES_HOST,
          port: Number(process.env.POSTGRES_PORT),
          username: process.env.POSTGRES_USERNAME,
          password: process.env.POSTGRES_PASSWORD,
          database: process.env.POSTGRES_DATABASE,
          entities: [EventEntity],
          synchronize: true,
        });
        return dataSource.initialize();
      },
    },
    ...eventProviders,
  ],
  exports: [...eventProviders],
})
export class PostgresDatabaseModule {}
