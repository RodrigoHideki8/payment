import { PaymentStatus } from '@/domain/entities/payment';
import { UniqueIdentifier } from '@/domain/entities/types';
import { Metadata, Split } from '@/domain/value-objects';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBilletPaymentInputDto {
  @IsInt()
  @IsNotEmpty()
  @Min(100)
  @ApiProperty({
    description: 'Amount to paid in cents',
    example: '100',
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

  @IsDateString()
  @IsNotEmpty()
  expiresAt: Date;

  @Type(() => Split)
  @ApiProperty({ type: [Split] })
  @IsOptional()
  split?: Split[];
}

export class CreateBilletPaymentOutputDto {
  @IsString()
  @IsUUID()
  aggregateId: UniqueIdentifier;

  @IsNotEmpty()
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsString()
  @IsNotEmpty()
  orderNumber: string;

  @IsString()
  @IsNotEmpty()
  gateway: string;

  @IsDateString()
  @IsNotEmpty()
  expiresAt: Date;

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  @ApiProperty({
    description: 'Amount to paid in cents',
    example: '10',
  })
  amount: number;

  @IsString()
  @IsNotEmpty()
  qrCode: string;

  @IsString()
  @IsNotEmpty()
  pdfUrl: string;

  @IsString()
  @IsNotEmpty()
  barCode: string;
}
