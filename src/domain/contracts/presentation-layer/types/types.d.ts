import { HttpStatus } from '@nestjs/common';

export type HttpResponse<TBody = any> = {
  statusCode: Required<Readonly<HttpStatus>>;
  response?: TBody;
  error?: string;
};
