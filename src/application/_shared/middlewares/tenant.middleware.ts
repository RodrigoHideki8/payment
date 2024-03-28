import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { RequestExtended } from '@application/tenant/types/types';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  static readonly TENANT_HEADER = 'x-tenant-id';
  use(req: RequestExtended, res: Response, next: NextFunction): any {
    const header = req.headers[TenantMiddleware.TENANT_HEADER] as string;
    req.tenantId = header?.toString() || null;
    next();
  }
}
