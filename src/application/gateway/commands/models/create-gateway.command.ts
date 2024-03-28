import { IGateway } from '@/domain/entities/gateway';

export class CreateGatewayCommand {
  public readonly gateway: IGateway;
  constructor(gateway: IGateway) {
    this.gateway = gateway;
  }
}
