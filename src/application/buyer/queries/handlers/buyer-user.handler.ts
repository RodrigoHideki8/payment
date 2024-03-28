import { BuyerRepository } from '@/domain/contracts/infra-layer/repository/buyer.repository';
import { DeepPartial } from '@/domain/types/types';
import { RetrieveBuyerQuery } from '@/application/buyer/queries/models';
import { IBuyer } from '@domain/entities/buyer';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { firstValueFrom } from 'rxjs';

@QueryHandler(RetrieveBuyerQuery)
export class RetrieveBuyerHandler implements IQueryHandler<RetrieveBuyerQuery> {
  constructor(private readonly buyerRepo: BuyerRepository) {}
  execute(command: RetrieveBuyerQuery): Promise<DeepPartial<IBuyer>> {
    return firstValueFrom(this.buyerRepo.get(command.id));
  }
}
