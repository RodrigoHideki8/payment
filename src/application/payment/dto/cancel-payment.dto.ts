import { UniqueIdentifier } from '@/domain/entities/types';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CancelPaymentInputDto {
  @ApiProperty({
    description: 'aggregateId',
    example: '836d45c2-87cc-80ce-0139-1ec00847d28f',
  })
  @IsString()
  @IsUUID()
  aggregateId: UniqueIdentifier;
}
