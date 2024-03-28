import { IBuyer } from '@/domain/entities';

export class UpdateBuyerCommand {
  public readonly buyer: IBuyer;
  constructor(buyer: IBuyer) {
    this.buyer = buyer;
  }
}
