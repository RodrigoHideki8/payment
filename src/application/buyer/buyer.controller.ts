import {
  CreateBuyer,
  DeleteBuyer,
  RetrieveBuyer,
  UpdateBuyer,
} from '@/domain/use-cases/buyer';
import {
  CreateBuyerInputDto,
  CreateBuyerOutputDto,
  RetrieveBuyerOutputDto,
  UpdateBuyerInputDto,
  UpdateBuyerOutputDto,
} from '@/application/buyer/dto';
import { HttpResponseHelper } from '@application/_shared/helpers/http-response.helper';
import { HttpResponse } from '@domain/contracts/presentation-layer/types/types';
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
import { RequestExtended } from '@application/tenant/types/types';
import { GetBuyer, GetBuyerOutput } from '@/domain/use-cases/buyer/get-buyer';

@Controller('buyers')
@ApiTags('Buyers')
export class BuyerController {
  constructor(
    private readonly getBuyerUseCase: GetBuyer,
    private readonly createBuyerUseCase: CreateBuyer,
    private readonly updateBuyerUseCase: UpdateBuyer,
    private readonly deleteBuyerUseCase: DeleteBuyer,
    private readonly retrieveBuyerUseCase: RetrieveBuyer,
  ) {}

  @ApiOperation({
    description: 'Query receiver endpoint',
    summary: 'Use this api to receiver a payment based on query parameters',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get receiver status.',
  })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant Id',
    required: true,
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'email',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'documentValue',
    required: false,
    type: String,
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
  @Get('')
  getBuyerByFilter(
    @Query('name') name: string,
    @Query('email') email: string,
    @Query('documentValue') documentValue: string,
    @Query('page') page: number,
    @Query('size') size: number,
    @Res() res: Response,
  ): Observable<HttpResponse<GetBuyerOutput>> {
    const getBuyer$ = this.getBuyerUseCase.execute({
      name,
      email,
      documentValue,
      page,
      size,
    });
    return HttpResponseHelper.use(res)
      .makeSimpleHttpResponseTo(getBuyer$)
      .onSuccessDefineStatusAs(HttpStatus.OK)
      .onErrorDefineStatusAs(HttpStatus.NOT_FOUND)
      .build();
  }

  @ApiOperation({
    description: 'Retrieve buyer endpoint',
    summary: 'Use this api to retrieve a buyer',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Retrieve buyer.',
    type: RetrieveBuyerOutputDto,
  })
  @Get('/:aggregate_id')
  retrieveBuyer(
    @Res() res: Response,
    @Param('aggregate_id') aggregateId: string,
  ): Observable<HttpResponse<RetrieveBuyerOutputDto>> {
    const retrieveBuyer$ = this.retrieveBuyerUseCase.execute(aggregateId);
    return HttpResponseHelper.use(res)
      .makeSimpleHttpResponseTo(retrieveBuyer$)
      .onSuccessDefineStatusAs(HttpStatus.OK)
      .onErrorDefineStatusAs(HttpStatus.BAD_REQUEST)
      .build();
  }

  @ApiOperation({
    description: 'Register buyer endpoint',
    summary: 'Use this api to register a new buyer',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Register buyer.',
    type: CreateBuyerOutputDto,
  })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant Id',
    required: true,
  })
  @Post('/')
  createBuyer(
    @Req() req: RequestExtended,
    @Res() res: Response,
    @Body() createBuyerInputDto: CreateBuyerInputDto,
  ): Observable<HttpResponse<CreateBuyerOutputDto>> {
    const createBuyer$ = this.createBuyerUseCase.execute({
      tenantId: req.tenantId,
      ...createBuyerInputDto,
    });
    return HttpResponseHelper.use(res)
      .makeSimpleHttpResponseTo(createBuyer$)
      .onSuccessDefineStatusAs(HttpStatus.CREATED)
      .onErrorDefineStatusAs(HttpStatus.BAD_REQUEST)
      .build();
  }

  @ApiOperation({
    description: 'Update buyer endpoint',
    summary: 'Use this api to update a buyer',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Update buyer.',
    type: UpdateBuyerOutputDto,
  })
  @Patch('/:aggregate_id')
  updateBuyer(
    @Res() res: Response,
    @Param('aggregate_id') aggregateId: string,
    @Body()
    updateBuyerInputDto: UpdateBuyerInputDto,
  ): Observable<HttpResponse<UpdateBuyerOutputDto>> {
    const updateBuyer$ = this.updateBuyerUseCase.execute({
      aggregateId,
      ...updateBuyerInputDto,
    });
    return HttpResponseHelper.use(res)
      .makeSimpleHttpResponseTo(updateBuyer$)
      .onSuccessDefineStatusAs(HttpStatus.OK)
      .onErrorDefineStatusAs(HttpStatus.BAD_REQUEST)
      .build();
  }

  @ApiOperation({
    description: 'Delete buyer endpoint',
    summary: 'Use this api to delete a buyer',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Delete buyer.' })
  @Delete('/:aggregate_id')
  deleteBuyer(
    @Res() res: Response,
    @Param('aggregate_id') aggregateId: string,
  ): Observable<HttpResponse<any>> {
    const deleteBuyer$ = this.deleteBuyerUseCase.execute(aggregateId);
    return HttpResponseHelper.use(res)
      .makeSimpleHttpResponseTo(deleteBuyer$)
      .onSuccessDefineStatusAs(HttpStatus.OK)
      .onErrorDefineStatusAs(HttpStatus.BAD_REQUEST)
      .build();
  }
}
