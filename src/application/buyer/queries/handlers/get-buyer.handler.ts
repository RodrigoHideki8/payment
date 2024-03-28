import { BuyerQuery } from '@/application/buyer/queries/models/buyer.query';
import { BuyerRepository } from '@/domain/contracts/infra-layer/repository/buyer.repository';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { firstValueFrom } from 'rxjs';

@QueryHandler(BuyerQuery)
export class BuyerQueryHandler implements IQueryHandler<BuyerQuery> {
  constructor(private readonly receiverRepository: BuyerRepository) {}

  async execute(command: BuyerQuery): Promise<any> {
    let filterBuyer = undefined;

    if (isNaN(command.page)) {
      filterBuyer = { ...filterBuyer, page: 0 };
    }

    if (isNaN(command.size)) {
      filterBuyer = { ...filterBuyer, size: 10 };
    }

    if (command.id) {
      filterBuyer = { ...filterBuyer, _id: command.id };
    }

    if (command.name) {
      filterBuyer = { ...filterBuyer, name: command.name };
    }

    if (!isNaN(command.page)) {
      filterBuyer = { ...filterBuyer, page: command.page };
    }

    if (!isNaN(command.size)) {
      filterBuyer = { ...filterBuyer, size: command.size };
    }

    if (command.email) {
      filterBuyer = { ...filterBuyer, email: command.email };
    }

    if (command.documentValue) {
      filterBuyer = {
        ...filterBuyer,
        documentValue: command.documentValue,
      };
    }

    return firstValueFrom(
      this.receiverRepository.list(
        filterBuyer,
        filterBuyer.page,
        filterBuyer.size,
        null,
      ),
    );
  }
}
