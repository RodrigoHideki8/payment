import { DomainError } from '@/domain/errors/domain-error';
import { HttpStatus } from '@nestjs/common';

export class UnprocessablePaymentError extends DomainError {
  public statusCode: HttpStatus = HttpStatus.BAD_REQUEST;
  constructor(message: string) {
    super();
    this.message = message;
  }
}
