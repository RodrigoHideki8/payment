import {
  CreateGatewayInput,
  CreateGatewayOutput,
} from '@/domain/use-cases/gateway/create-gateway';
import { GatewayRule } from '@/domain/value-objects/gateway-rule';
import { UniqueIdentifier } from '@domain/entities/types';
import { ApiHideProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class CreateGatewayInputDto implements CreateGatewayInput {
  @ApiHideProperty()
  tenantId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsNotEmpty()
  @IsString()
  player: string;

  @Type(() => GatewayRule)
  @ValidateNested()
  @ArrayMinSize(1)
  @IsArray()
  rules: GatewayRule[];

  @IsOptional()
  @IsObject()
  gatewayConfigs?: Record<string, any>;
}

export class CreateGatewayOutputDto implements CreateGatewayOutput {
  @ApiHideProperty()
  tenantId: string;

  @IsString()
  @IsUUID()
  id: UniqueIdentifier;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsNotEmpty()
  @IsString()
  player: string;

  @Type(() => GatewayRule)
  @ValidateNested()
  @ArrayMinSize(1)
  @IsArray()
  rules: GatewayRule[];

  @IsOptional()
  @IsObject()
  gatewayConfigs?: Record<string, any>;
}
