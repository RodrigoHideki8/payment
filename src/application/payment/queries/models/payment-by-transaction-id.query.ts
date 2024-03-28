export class PaymentByTransactionIdQuery {
  constructor(
    private readonly _transactionId: string,
    private readonly _tenantId: string,
  ) {}

  public get transactionId(): string {
    return this._transactionId;
  }

  public get tenantId(): string {
    return this._tenantId;
  }
}
