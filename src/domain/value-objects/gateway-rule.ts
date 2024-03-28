import { ValueObject } from '@/domain/value-objects/value-object';
import { PaymentType } from '@domain/entities';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export enum TaxAppliance {
  PERCENT = 'PERCENT',
  AMOUNT = 'AMOUNT',
}

export interface GatewayRulerops {
  paymentType: PaymentType;
  installments?: number;
  gatewayTax: number;
  gatewayTaxAppliance: TaxAppliance;
  retryIn?: string;
}

export class GatewayRule extends ValueObject<GatewayRulerops> {
  @IsEnum(PaymentType)
  @ApiProperty({ enum: PaymentType })
  paymentType: PaymentType;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  installments: number;

  @IsNumber()
  @ApiProperty()
  gatewayTax: number;

  @IsEnum(TaxAppliance)
  @ApiProperty({ enum: TaxAppliance })
  gatewayTaxAppliance: TaxAppliance;

  @IsOptional()
  @IsString()
  @ApiProperty({
    name: 'retryIn',
    required: false,
    description:
      'Optional name of the gateway to retry the process in case of failure',
  })
  retryIn?: string;
}
