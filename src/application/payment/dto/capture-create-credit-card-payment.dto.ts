import { PaymentStatus } from '@/domain/entities/payment';
import { UniqueIdentifier } from '@/domain/entities/types';
import { ApiProperty } from '@nestjs/swagger';

import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
} from 'class-validator';

export class CaptureCreditCardPaymentInputDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'aggregateId',
    example: '836d45c2-87cc-80ce-0139-1ec00847d28f',
  })
  @IsNotEmpty()
  @IsUUID()
  aggregateId: UniqueIdentifier;
}

export class CaptureCreditCardPaymentOutputDto {
  @IsString()
  @IsUUID()
  aggregateId: UniqueIdentifier;

  @IsNotEmpty()
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsUUID()
  gatewayId: UniqueIdentifier;

  @IsString()
  authorizationCode?: string;

  @IsNumber()
  amount: number;
}
