import { HttpStatus } from '@nestjs/common';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { HttpResponse } from '@domain/contracts/presentation-layer/types/types';
import { DomainError } from '@domain/errors/domain-error';
import { Response } from 'express';

export interface HttpResponseBuilder<PayloadType> {
  onSuccessDefineStatusAs: (
    statusCode: HttpStatus,
  ) => HttpResponseBuilder<PayloadType>;
  onErrorDefineStatusAs: (
    statusCode: HttpStatus,
  ) => HttpResponseBuilder<PayloadType>;
  onErrorDefineMessageAs: (message: string) => HttpResponseBuilder<PayloadType>;
  build: () => Observable<HttpResponse<PayloadType>>;
}

export class HttpResponseHelper {
  constructor(private httpResponse: Response) {}

  static use(res: Response): HttpResponseHelper {
    return new HttpResponseHelper(res);
  }

  makeSimpleHttpResponseTo<PayloadType>(
    observable$: Observable<PayloadType>,
  ): HttpResponseBuilder<PayloadType> {
    let _statusCode: HttpStatus = HttpStatus.OK;
    let _errorStatusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let _errorMessage;
    return {
      onSuccessDefineStatusAs: function (
        statusCode: HttpStatus,
      ): HttpResponseBuilder<PayloadType> {
        _statusCode = statusCode;
        return this;
      },
      onErrorDefineStatusAs: function (
        statusCode: HttpStatus,
      ): HttpResponseBuilder<PayloadType> {
        _errorStatusCode = statusCode;
        return this;
      },
      onErrorDefineMessageAs: function (
        message: string,
      ): HttpResponseBuilder<PayloadType> {
        _errorMessage = message;
        return this;
      },
      build: (): Observable<HttpResponse<PayloadType>> => {
        return HttpResponseHelper.buildResponse(
          observable$,
          _statusCode,
          _errorStatusCode,
          _errorMessage,
        ).pipe(
          tap((data) => {
            this.httpResponse.status(data.statusCode).json(data.response);
          }),
        );
      },
    };
  }

  private static buildResponse<PayloadType>(
    observable$: Observable<PayloadType>,
    _statusCode: HttpStatus,
    _errorStatusCode: HttpStatus,
    _errorMessage: string,
  ): Observable<HttpResponse<PayloadType>> {
    return observable$.pipe(
      map((data: PayloadType) => this.makeSuccessResponse(data, _statusCode)),
      catchError((err: DomainError) =>
        of(this.makeErrorResponse(err, _errorStatusCode, _errorMessage)),
      ),
    );
  }

  private static makeSuccessResponse<PayloadType>(
    response: PayloadType,
    statusCode: HttpStatus,
  ): HttpResponse<PayloadType> {
    return {
      response,
      statusCode: statusCode || HttpStatus.OK,
    } as HttpResponse<PayloadType>;
  }

  private static makeErrorResponse(
    err: DomainError,
    statusCode: HttpStatus,
    errorMessage?: string,
  ): HttpResponse {
    const _statusCode = err?.statusCode || statusCode;
    const response = {
      message: errorMessage || err?.message || 'Internal server error',
      statusCode: _statusCode,
      timestamp: new Date().toISOString(),
    };

    return {
      response,
      statusCode: _statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
    } as HttpResponse;
  }
}
