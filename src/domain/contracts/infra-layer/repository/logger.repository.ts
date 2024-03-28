import { Observable } from 'rxjs';

export abstract class LoggerRepository<LoggerType> {
  abstract capture(logger: LoggerType): Observable<void>;
}
