import { RequestExtended } from '@/application/tenant/types/types';
import { PaginatedList } from '@/domain/contracts/infra-layer/repository/types';
import { DeleteGateway } from '@/domain/use-cases/gateway/delete-gateway';
import { RetrieveAllGateway } from '@/domain/use-cases/gateway/retrieve-all-gateway';
import {
  UpdateGateway,
  UpdateGatewayOutput,
} from '@/domain/use-cases/gateway/update-gateway';
import { HttpResponseHelper } from '@application/_shared/helpers/http-response.helper';
import {
  CreateGatewayInputDto,
  CreateGatewayOutputDto,
} from '@application/gateway/dto/create-gateway.dto';
import {
  UpdateGatewayInputDto,
  UpdateGatewayOutputDto,
} from '@application/gateway/dto/update-gateway.dto';
import { HttpResponse } from '@domain/contracts/presentation-layer/types/types';
import { CreateGateway } from '@domain/use-cases/gateway/create-gateway';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { Observable } from 'rxjs';
import {
  RetrieveGatewayOutputDto,
  RetrieveGatewayOutputDtoList,
} from './dto/retrieve-gateway.dto';
import { GetGatewayById } from '@/domain/use-cases/gateway/get-gateway-by-id';

@Controller('gateways')
@ApiTags('Gateways')
export class GatewayController {
  constructor(
    private readonly retrieveAllGatewayUseCase: RetrieveAllGateway,
    private readonly gatewayById: GetGatewayById,
    private readonly createGatewayUseCase: CreateGateway,
    private readonly updateGatewayUseCase: UpdateGateway,
    private readonly deleteGatewayUseCase: DeleteGateway,
  ) {}

  @ApiOperation({
    description: 'List all gateways endpoint',
    summary: 'Use this api to see gateways previously registered',
  })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant Id',
    required: true,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 0,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    type: Number,
  })
  @ApiResponse({ status: HttpStatus.OK, type: RetrieveGatewayOutputDtoList })
  @Get('/')
  retrieveAllGateway(
    @Req() req: RequestExtended,
    @Res() res: Response,
    @Query('page') page = 0,
    @Query('limit') limit = 10,
  ): Observable<HttpResponse<PaginatedList<RetrieveGatewayOutputDto>>> {
    const createGateway$ = this.retrieveAllGatewayUseCase.execute({
      tenantId: req.tenantId,
      page,
      limit,
    });
    return HttpResponseHelper.use(res)
      .makeSimpleHttpResponseTo(createGateway$)
      .onSuccessDefineStatusAs(HttpStatus.OK)
      .onErrorDefineStatusAs(HttpStatus.BAD_REQUEST)
      .build();
  }

  @ApiOperation({
    description: 'Retrieve a gateway by id',
    summary: 'Use this api to get a gateway by id',
  })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant Id',
    required: true,
  })
  @ApiResponse({ status: HttpStatus.OK, type: RetrieveGatewayOutputDto })
  @Get('/:aggregate_id')
  getGatewayById(
    @Req() req: RequestExtended,
    @Res() res: Response,
    @Param('aggregate_id') aggreageteId: string,
  ): Observable<HttpResponse<RetrieveGatewayOutputDto>> {
    const createGateway$ = this.gatewayById.execute({
      tenantId: req.tenantId,
      aggreageteId,
    });
    return HttpResponseHelper.use(res)
      .makeSimpleHttpResponseTo(createGateway$)
      .onSuccessDefineStatusAs(HttpStatus.OK)
      .onErrorDefineStatusAs(HttpStatus.BAD_REQUEST)
      .build();
  }

  @ApiOperation({
    description:
      'The payment gateway may contain specific settings. Used in communication with providers. ' +
      'Below are the available settings and enabled gateways: \n' +
      '\n\tpaynet \n\t\t DOCUMENT_EC - "Business document" \n' +
      '\n\tsantander \n\t\t MERCHANT_NAME - "Merchant name" \n\t\t MERCHANT_CITY - "Merchant city" \n\t\t PIX_KEY - "Pix key" \n' +
      '\n\tpagar-me \n\t\t SELLER_ID - "recipient_id in pagarme gateway"\n\n' +
      '\n\tgetnet \n\t\t SELLER_ID - "recipient_id in getnet gateway"\n\n' +
      'Payment types can be: \n' +
      '\n\t - PIX \n\t - BILLET \n\t - CREDIT_CARD \n' +
      'Gateway Tax Appliance can be: \n' +
      '\n\t - PERCENT \n\t - AMOUNT \n\n' +
      'OBS: The selection of the payment gateway is made based on the calculation of the lowest fee for the payment type.',

    summary: 'Use this api to register a new gateway',
  })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant Id',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Register gateway.',
    type: CreateGatewayOutputDto,
  })
  @Post('/')
  createGateway(
    @Req() req: RequestExtended,
    @Res() res: Response,
    @Body() createGatewayInputDto: CreateGatewayInputDto,
  ): Observable<HttpResponse<CreateGatewayOutputDto>> {
    const createGateway$ = this.createGatewayUseCase.execute({
      tenantId: req.tenantId,
      ...createGatewayInputDto,
    });
    return HttpResponseHelper.use(res)
      .makeSimpleHttpResponseTo(createGateway$)
      .onSuccessDefineStatusAs(HttpStatus.CREATED)
      .onErrorDefineStatusAs(HttpStatus.BAD_REQUEST)
      .build();
  }

  @ApiOperation({
    description: 'Update gateway endpoint',
    summary: 'Use this api to update a gateway',
  })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant Id',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Update gateway.',
    type: UpdateGatewayOutputDto,
  })
  @Patch('/:aggregate_id')
  updateGateway(
    @Req() req: RequestExtended,
    @Res() res: Response,
    @Param('aggregate_id') aggregateId: string,
    @Body()
    updateGatewayInputDto: UpdateGatewayInputDto,
  ): Observable<HttpResponse<UpdateGatewayOutput>> {
    const updateGateway$ = this.updateGatewayUseCase.execute({
      aggregateId,
      tenantId: req.tenantId,
      ...updateGatewayInputDto,
    });
    return HttpResponseHelper.use(res)
      .makeSimpleHttpResponseTo(updateGateway$)
      .onSuccessDefineStatusAs(HttpStatus.OK)
      .onErrorDefineStatusAs(HttpStatus.BAD_REQUEST)
      .build();
  }

  @ApiOperation({
    description: 'Delete gateway endpoint',
    summary: 'Use this api to delete a gateway',
  })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant Id',
    required: true,
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Delete gateway.' })
  @Delete('/:aggregate_id')
  deleteGateway(
    @Req() req: RequestExtended,
    @Res() res: Response,
    @Param('aggregate_id') aggregateId: string,
  ): Observable<HttpResponse<void>> {
    const deleteGateway$ = this.deleteGatewayUseCase.execute({
      tenantId: req.tenantId,
      aggregateId,
    });
    return HttpResponseHelper.use(res)
      .makeSimpleHttpResponseTo(deleteGateway$)
      .onSuccessDefineStatusAs(HttpStatus.OK)
      .onErrorDefineStatusAs(HttpStatus.BAD_REQUEST)
      .build();
  }
}
