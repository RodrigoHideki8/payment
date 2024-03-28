import { Observable } from 'rxjs';

export abstract class DistributedCache {
  abstract setValue<T = any>(
    key: string,
    value: T,
    ttl?: number,
  ): Observable<void>;
  abstract getValue<T = any>(key: string): Observable<T>;
  abstract clearCache(): Observable<void>;
  abstract unsetValue(key: string): Observable<void>;
}
