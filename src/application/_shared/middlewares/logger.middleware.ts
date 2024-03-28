import { Injectable, LoggerService, NestMiddleware } from '@nestjs/common';
import { RequestExtended } from '@application/tenant/types/types';
import { NextFunction, Response } from 'express';
import { WinstonAdapter } from '@/infrastructure/services/logger/adapters/winston.adapter';

Injectable();
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService = new WinstonAdapter()) {}
  use(req: RequestExtended, res: Response, next: NextFunction): any {
    const { ip, method, path, url, tenantId } = req;
    this.logger.log(
      `[${method.toUpperCase()}] => x-tenant-id ${tenantId} => ${ip} => ${url} ${path}`,
    );
    next();
  }
}
