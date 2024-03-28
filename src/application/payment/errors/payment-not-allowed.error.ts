import { DomainError } from '@/domain/errors/domain-error';
import { HttpStatus } from '@nestjs/common';

export class PaymentAllowedError extends DomainError {
  public statusCode: HttpStatus = HttpStatus.FORBIDDEN;
  constructor(message: string) {
    super();
    this.message = message;
  }
}
