import { DomainError } from '@/domain/errors/domain-error';
import { HttpStatus } from '@nestjs/common';

export class TenantNotFoundError extends DomainError {
  public statusCode: HttpStatus = HttpStatus.NOT_FOUND;
  constructor(message: string) {
    super();
    this.message = message;
  }
}
