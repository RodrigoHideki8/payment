import { Observable } from 'rxjs';
import { DomainError } from '@domain/errors/domain-error';

export abstract class ErrorTracerContract {
  abstract captureMessage(message: string): Observable<void>;
  abstract captureException(exception: DomainError | Error): Observable<void>;
}
