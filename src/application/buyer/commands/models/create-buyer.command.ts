import { IBuyer } from '@/domain/entities';

export class CreateBuyerCommand {
  public readonly buyer: IBuyer;
  constructor(buyer: IBuyer) {
    this.buyer = buyer;
  }
}
