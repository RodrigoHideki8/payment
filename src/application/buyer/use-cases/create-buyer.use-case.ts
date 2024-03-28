import { IBuyer } from '@/domain/entities';
import { CreateBuyerCommand } from '@/application/buyer/commands/models';
import { Buyer } from '@/application/buyer/buyer';
import {
  CreateBuyer,
  CreateBuyerInput,
  CreateBuyerOutput,
} from '@domain/use-cases/buyer';
import { Injectable, Provider } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { from, map, Observable, switchMap } from 'rxjs';
import { BuyerRepository } from '@/domain/contracts/infra-layer/repository/buyer.repository';

@Injectable()
export class CreateBuyerUseCase implements CreateBuyer {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly buyerRepo: BuyerRepository,
  ) {}
  private static readonly MESSAGE_BUYER_EXISTS = 'Buyer already exists!';

  execute(input: CreateBuyerInput): Observable<CreateBuyerOutput> {
    const user = new Buyer()
      .setTenantId(input.tenantId)
      .setName(input.name)
      .setEmail(input.email)
      .setAddress(input.address)
      .setDocumentType(input.documentType)
      .setDocumentValue(input.documentValue)
      .setPhoneNumber(input.phoneNumber)
      .setMotherName(input.motherName)
      .setBirthDate(input.birthDate);

    const result = this.buyerRepo.getOne({
      documentValue: input.documentValue,
      tenantId: input.tenantId,
    });

    return from(result).pipe(
      switchMap((response) => {
        if (response == null) {
          const createBuyerCommand = new CreateBuyerCommand(user);
          const command$ = this.commandBus.execute(createBuyerCommand);
          return from(command$).pipe(
            map((createdBuyer: IBuyer) => {
              return { id: createdBuyer.id };
            }),
          );
        }
        throw Error(CreateBuyerUseCase.MESSAGE_BUYER_EXISTS);
      }),
    );
  }
}
export const CreateBuyerUseCaseProvider: Provider = {
  provide: CreateBuyer,
  useClass: CreateBuyerUseCase,
};
