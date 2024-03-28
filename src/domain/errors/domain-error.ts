import { HttpStatus } from '@nestjs/common';

export abstract class DomainError extends Error {
  public readonly statusCode: HttpStatus;
  protected constructor() {
    super();
    this.name = DomainError.name;
    this.statusCode = HttpStatus.BAD_REQUEST;
  }
}
