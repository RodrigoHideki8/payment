import { CaptureType, PaymentStatus } from '@/domain/entities/payment';
import { UniqueIdentifier } from '@/domain/entities/types';
import { Metadata } from '@/domain/value-objects';
import { CreditCardPayment } from '@/domain/value-objects/credit-card';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCreditCardPaymentInputDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Tipo de captura',
    example: 'AUTORIZACAO',
  })
  captureType: CaptureType;

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  @ApiProperty({
    description: 'Number installments',
    example: '1',
  })
  installments: number;

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  @ApiProperty({
    description: 'Amount to paid in cents',
    example: '10',
  })
  amount: number;

  @ApiProperty({
    description: 'buyerId',
    example: '836d45c2-87cc-80ce-0139-1ec00847d28f',
  })
  @IsNotEmpty()
  @IsUUID()
  buyerId: UniqueIdentifier;

  @IsNotEmpty()
  metadata: Metadata;

  @IsString()
  @IsNotEmpty()
  @MaxLength(18)
  softDescription: string;

  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({
    description: 'accountId',
    example: '836d45c2-87cc-80ce-0139-1ec00847d28f',
  })
  @IsNotEmpty()
  @IsString()
  accountId: string;

  @Type(() => CreditCardPayment)
  @ValidateNested()
  @ArrayMinSize(1)
  @IsArray()
  @Type(() => CreditCardPayment)
  payments: CreditCardPayment[];
}

export class CreateCreditCardPaymentOutputDto {
  @IsString()
  @IsUUID()
  aggregateId: UniqueIdentifier;

  @IsNotEmpty()
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsString()
  orderNumber: string;

  @IsInt()
  amount: number;

  @IsString()
  authorizationCode?: string;
}
