import { PaymentStatus } from '@/domain/entities/payment';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetPaymentInputDto {
  @IsString()
  @IsOptional()
  orderId: string;

  @IsString()
  @IsOptional()
  accountId: string;

  @IsEnum(PaymentStatus)
  @IsOptional()
  status: PaymentStatus;

  @ApiProperty({
    description: 'Date initial',
    example: '2013-01-01',
  })
  @IsOptional()
  startDate: Date;

  @ApiProperty({
    description: 'Date final',
    example: '2013-01-31',
  })
  @IsOptional()
  endDate: Date;

  @IsNumber()
  page = 0;

  @IsNumber()
  size = 10;
}
