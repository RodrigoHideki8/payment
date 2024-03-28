import { IGateway } from '@/domain/entities/gateway';

export class UpdateGatewayCommand {
  public readonly gateway: IGateway;
  constructor(gateway: IGateway) {
    this.gateway = gateway;
  }
}
