import { ErrorTracerContract } from '@/domain/contracts/infra-layer/error-tracer/error-tracer.contract';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class ExceptionInterceptor implements NestInterceptor {
  constructor(private readonly errorTracer: ErrorTracerContract) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      tap({
        error: (error) => {
          this.errorTracer.captureException(error).subscribe();
        },
      }),
    );
  }
}
