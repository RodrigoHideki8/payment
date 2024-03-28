import { Observable } from 'rxjs';

export abstract class UseCase<Input, Output> {
  abstract execute(input?: Input): Observable<Output>;
}
