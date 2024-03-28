import {
  CreateCreditCardPayment,
  CreateCreditCardPaymentOutput,
} from '@/domain/use-cases/payment/create-credit-card-payment';
import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  Req,
  Get,
  Param,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiHeader,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiNoContentResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { Response } from 'express';
import { HttpResponse } from '@/domain/contracts/presentation-layer/types/types';
import {
  CreateCreditCardPaymentInputDto,
  CancelPaymentInputDto,
  CaptureCreditCardPaymentInputDto,
  CaptureCreditCardPaymentOutputDto,
  CreatePixPaymentInputDto,
  CreatePixPaymentOutputDto,
  CreateBilletPaymentInputDto,
  PaymentWebhookDto,
} from '@application/payment/dto';
import { HttpResponseHelper } from '@application/_shared/helpers/http-response.helper';
import { CancelCreditCardPayment } from '@/domain/use-cases/payment/cancel-credit-card-payment';
import { RequestExtended } from '@application/tenant/types/types';
import { GetPayment } from '@/domain/use-cases/payment/get-payment';
import { CaptureCreditCardPayment } from '@/domain/use-cases/payment/capture-credit-card-payment';
import { CreatePixPayment } from '@/domain/use-cases/payment/create-pix-payment';
import {
  CreateBilletPayment,
  CreateBilletPaymentOutput,
} from '@/domain/use-cases/payment/create-billet-payment';
import { Query } from '@nestjs/common/decorators';
import { UniqueIdentifier } from '@/domain/entities/types';
import { ProcessPaymentWebhook } from '@/domain/use-cases/payment/process-payment-webhook';
import { IPayment, PaymentStatus } from '@/domain/entities/payment';
import { CancelPixPayment } from '@/domain/use-cases/payment/cancel-pix-payment';
import { GetPaymentById } from '@/domain/use-cases/payment/get-payment-by-id';

@Controller('payments')
@ApiTags('Payments')
export class PaymentController {
  constructor(
    private readonly createCreditCardPaymentUseCase: CreateCreditCardPayment,
    private readonly getPaymentUseCase: GetPayment,
    private readonly getPaymentByIdUseCase: GetPaymentById,
    private readonly cancelCreditCardPaymentUseCase: CancelCreditCardPayment,
    private readonly cancelPixPaymentUseCase: CancelPixPayment,
    private readonly captureCreditCardPaymentUseCase: CaptureCreditCardPayment,
    private readonly createPixPaymentUseCase: CreatePixPayment,
    private readonly createBilletPaymentUseCase: CreateBilletPayment,
    private readonly processPaymentWebhookUseCase: ProcessPaymentWebhook,
  ) {}
  @ApiOperation({
    description: 'Get payment endpoint',
    summary: 'Use this api to get a payment by his aggregateId',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get payment status.',
  })
  @Get('/:aggregate_id')
  getPayment(
    @Param('aggregate_id') aggregateId: string,
    @Res() res: Response,
  ): Observable<HttpResponse<IPayment>> {
    const getPayment$ = this.getPaymentByIdUseCase.execute({
      aggregateId,
    });
    return HttpResponseHelper.use(res)
      .makeSimpleHttpResponseTo(getPayment$)
      .onSuccessDefineStatusAs(HttpStatus.OK)
      .onErrorDefineStatusAs(HttpStatus.NOT_FOUND)
      .build();
  }

  @ApiOperation({
    description: 'Query payment endpoint',
    summary: 'Use this api to retrieve a payment based on query parameters',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get payment status.',
  })
  @ApiQuery({ name: 'status', enum: PaymentStatus })
  @ApiQuery({
    name: 'orderId',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'accountId',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'buyerId',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: PaymentStatus,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: Date,
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: Date,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'size',
    required: false,
    type: Number,
  })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant Id',
    required: true,
  })
  @Get()
  getPaymentByFilter(
    @Query('orderId') orderId: string,
    @Query('accountId') accountId: string,
    @Query('buyerId') buyerId: string,
    @Query('status') status: PaymentStatus,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Query('page') page: number,
    @Query('size') size: number,
    @Req() req: RequestExtended,
    @Res() res: Response,
  ): Observable<HttpResponse<IPayment>> {
    const getPayment$ = this.getPaymentUseCase.execute({
      orderId,
      accountId,
      buyerId,
      status,
      startDate,
      endDate,
      page,
      size,
      tenantId: req.tenantId,
    });
    return HttpResponseHelper.use(res)
      .makeSimpleHttpResponseTo(getPayment$)
      .onSuccessDefineStatusAs(HttpStatus.OK)
      .onErrorDefineStatusAs(HttpStatus.NOT_FOUND)
      .build();
  }

  @ApiOperation({
    description: 'Credit card payment endpoint',
    summary: 'Use this api to make credit card payments',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Credit card payment status.',
  })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant Id',
    required: true,
  })
  @Post('/credit-card')
  createCreditCardPayment(
    @Req() req: RequestExtended,
    @Res() res: Response,
    @Body() createCreditCardPaymentInputDto: CreateCreditCardPaymentInputDto,
  ): Observable<HttpResponse<CreateCreditCardPaymentOutput>> {
    const createCreditCardPayment$ =
      this.createCreditCardPaymentUseCase.execute({
        tenantId: req.tenantId,
        ...createCreditCardPaymentInputDto,
      });
    return HttpResponseHelper.use(res)
      .makeSimpleHttpResponseTo(createCreditCardPayment$)
      .onSuccessDefineStatusAs(HttpStatus.OK)
      .onErrorDefineStatusAs(HttpStatus.BAD_REQUEST)
      .build();
  }

  @ApiOperation({
    description: 'Cancel payment endpoint',
    summary: 'Use this api to cancel the payment',
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Cancel payment.' })
  @Post('/credit-card/cancel')
  cancelPayment(
    @Res() res: Response,
    @Body() cancelPaymentInputDto: CancelPaymentInputDto,
  ): Observable<HttpResponse<CancelPaymentInputDto>> {
    const cancelPayment$ = this.cancelCreditCardPaymentUseCase.execute(
      cancelPaymentInputDto,
    );
    return HttpResponseHelper.use(res)
      .makeSimpleHttpResponseTo(cancelPayment$)
      .onSuccessDefineStatusAs(HttpStatus.CREATED)
      .onErrorDefineStatusAs(HttpStatus.BAD_REQUEST)
      .build();
  }

  @ApiOperation({
    description: 'Capture credit card payment endpoint',
    summary: 'Use this api to capture credit card payments',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Capture redit card payment status.',
  })
  @Post('/credit-card/capture')
  captureCreditCardPayment(
    @Req() req: RequestExtended,
    @Res() res: Response,
    @Body() captureCreditCardPaymentInputDto: CaptureCreditCardPaymentInputDto,
  ): Observable<HttpResponse<CaptureCreditCardPaymentOutputDto>> {
    const captureCreditCardPayment$ =
      this.captureCreditCardPaymentUseCase.execute({
        tenantId: req.tenantId,
        ...captureCreditCardPaymentInputDto,
      });
    return HttpResponseHelper.use(res)
      .makeSimpleHttpResponseTo(captureCreditCardPayment$)
      .onSuccessDefineStatusAs(HttpStatus.OK)
      .onErrorDefineStatusAs(HttpStatus.BAD_REQUEST)
      .build();
  }

  @ApiOperation({
    description: 'Pix payment endpoint',
    summary: 'Use this api to make pix payments',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pix payment status.',
  })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant Id',
    required: true,
  })
  @Post('/pix-qrcode')
  createPixPayment(
    @Req() req: RequestExtended,
    @Res() res: Response,
    @Body() createPixPaymentInputDto: CreatePixPaymentInputDto,
  ): Observable<HttpResponse<CreatePixPaymentOutputDto>> {
    const createPixPayment$ = this.createPixPaymentUseCase.execute({
      tenantId: req.tenantId,
      ...createPixPaymentInputDto,
    });
    return HttpResponseHelper.use(res)
      .makeSimpleHttpResponseTo(createPixPayment$)
      .onSuccessDefineStatusAs(HttpStatus.OK)
      .onErrorDefineStatusAs(HttpStatus.BAD_REQUEST)
      .build();
  }

  @ApiOperation({
    description: 'Cancel pix payment endpoint',
    summary: 'Use this api to cancel the payment',
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Cancel payment.' })
  @Post('/pix/cancel')
  cancelPixPayment(
    @Res() res: Response,
    @Body() cancelPaymentInputDto: CancelPaymentInputDto,
  ): Observable<HttpResponse<CancelPaymentInputDto>> {
    const cancelPayment$ = this.cancelPixPaymentUseCase.execute(
      cancelPaymentInputDto,
    );
    return HttpResponseHelper.use(res)
      .makeSimpleHttpResponseTo(cancelPayment$)
      .onSuccessDefineStatusAs(HttpStatus.CREATED)
      .onErrorDefineStatusAs(HttpStatus.BAD_REQUEST)
      .build();
  }

  @ApiOperation({
    description: 'Billet payment endpoint',
    summary: 'Use this api to make billet payments',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Billet payment status.',
  })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant Id',
    required: true,
  })
  @Post('/billet')
  createBilletPayment(
    @Req() req: RequestExtended,
    @Res() res: Response,
    @Body() createBilletPaymentInputDto: CreateBilletPaymentInputDto,
  ): Observable<HttpResponse<CreateBilletPaymentOutput>> {
    const createBilletPayment$ = this.createBilletPaymentUseCase.execute({
      tenantId: req.tenantId,
      ...createBilletPaymentInputDto,
    });
    return HttpResponseHelper.use(res)
      .makeSimpleHttpResponseTo(createBilletPayment$)
      .onSuccessDefineStatusAs(HttpStatus.OK)
      .onErrorDefineStatusAs(HttpStatus.BAD_REQUEST)
      .build();
  }

  @ApiOperation({
    description: 'Payment webhook endpoint',
    summary: 'This endpoint can be used to process payments webhooks.',
  })
  @ApiCreatedResponse({ description: 'Webhook processed' })
  @ApiNoContentResponse({ description: 'Webhook processed' })
  @ApiParam({
    name: 'gateway_id',
    description: 'gateway id',
  })
  @ApiParam({
    name: 'tenant_id',
    description: 'tenant id',
  })
  @ApiBody({
    description: 'Player webhook body',
    examples: {
      'Webhook - Paynet': {
        value: {
          orderId: 'abc',
          timestamp: '121321213212',
          signature: 'abcd',
          status: 'paid',
          proofDoc: '123214',
        },
      },
      'Webhook - Pix Santander': {
        value: {
          pix: [
            {
              endToEndId: 'E1803615022211340s08793XPJ',
              txid: '65432114243442798242729',
              valor: '120.12',
              horario: '2020-12-26T18:21:12.123Z',
              infoPagador: 'servicos prestados',
            },
          ],
        },
      },
      'Webhook - Pix Pagarme': {
        value: {
          id: 'hook_RyEKQO789TRpZjv5',
          type: 'order.paid',
          created_at: '2017-06-29T20:23:47',
          data: {
            id: 'or_ZdnB5BBCmYhk534R',
            code: '1303724',
            amount: 12356,
            currency: 'BRL',
            status: 'paid',
            charges: [
              {
                id: 'ch_d22356Jf4WuGr8no',
                code: '1303624',
                gateway_id: 'da7f2304-1937-42a4-b995-0f4ea2b36264',
                amount: 12356,
                status: 'paid',
                currency: 'BRL',
                payment_method: 'credit_card',
                paid_at: '2022-06-29T20:23:47',
                created_at: '2022-06-29T20:23:42',
                updated_at: '2022-06-29T20:23:47',
                last_transaction: {
                  id: 'tran_opAqDj2390S1lKQO',
                  transaction_type: 'credit_card',
                  gateway_id: '3b12320a-0d67-4c06-b497-6622fe9763c8',
                  amount: 12356,
                  status: 'captured',
                  success: true,
                  operation_type: 'capture',
                },
              },
            ],
          },
        },
      },
    },
  })
  @Post('/webhooks/:gateway_id/:tenant_id')
  processWebhook(
    @Res() res: Response,
    @Param('gateway_id') gatewayId: UniqueIdentifier,
    @Param('tenant_id') tenantId: string,
    @Body() payload: PaymentWebhookDto,
  ): Observable<HttpResponse<void>> {
    const processWebhook$ = this.processPaymentWebhookUseCase.execute({
      gatewayId,
      tenantId,
      payload,
    });
    return HttpResponseHelper.use(res)
      .makeSimpleHttpResponseTo(processWebhook$)
      .onSuccessDefineStatusAs(HttpStatus.NO_CONTENT)
      .onErrorDefineStatusAs(HttpStatus.BAD_REQUEST)
      .build();
  }
}
