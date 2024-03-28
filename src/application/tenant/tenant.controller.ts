import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { HttpResponseHelper } from '@application/_shared/helpers/http-response.helper';
import { Response } from 'express';
import { HttpResponse } from '@domain/contracts/presentation-layer/types/types';
import { CreateTenant } from '@domain/use-cases/tenant/create-tenant';
import {
  CreateTenantInputDto,
  CreateTenantOutputDto,
} from '@application/tenant/dto/create-tenant.dto';
import {
  UpdateTenantInputDto,
  UpdateTenantOutputDto,
} from '@application/tenant/dto/update-tenant.dto';
import { UpdateTenant } from '@domain/use-cases/tenant/update-tenant';

@Controller('tenants')
@ApiTags('Tenants')
export class TenantController {
  constructor(
    private readonly createTenantUseCase: CreateTenant,
    private readonly updateTenantUseCase: UpdateTenant,
  ) {}

  @ApiOperation({
    description: 'Create tenant endpoint',
    summary: 'Use this api to create a new tenant',
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Create tenant.' })
  @Post('/')
  createTenant(
    @Res() res: Response,
    @Body() createTenantInputDto: CreateTenantInputDto,
  ): Observable<HttpResponse<CreateTenantOutputDto>> {
    const createTenant$ =
      this.createTenantUseCase.execute(createTenantInputDto);
    return HttpResponseHelper.use(res)
      .makeSimpleHttpResponseTo(createTenant$)
      .onSuccessDefineStatusAs(HttpStatus.CREATED)
      .onErrorDefineStatusAs(HttpStatus.BAD_REQUEST)
      .build();
  }

  @ApiOperation({
    description: 'Update tenant endpoint',
    summary: 'Use this api to update a tenant',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Update tenant.' })
  @Patch('/:aggregate_id')
  updateTenant(
    @Res() res: Response,
    @Param('aggregate_id') aggregateId: string,
    @Body()
    updateTenantInputDto: UpdateTenantInputDto,
  ): Observable<HttpResponse<UpdateTenantOutputDto>> {
    const updateTenant$ = this.updateTenantUseCase.execute({
      aggregateId,
      ...updateTenantInputDto,
    });
    return HttpResponseHelper.use(res)
      .makeSimpleHttpResponseTo(updateTenant$)
      .onSuccessDefineStatusAs(HttpStatus.CREATED)
      .onErrorDefineStatusAs(HttpStatus.BAD_REQUEST)
      .build();
  }
}
