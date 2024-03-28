import { IBuyer } from '@/domain/entities';

export class DeleteBuyerCommand {
  public readonly buyer: IBuyer;
  constructor(buyer: IBuyer) {
    this.buyer = buyer;
  }
}
