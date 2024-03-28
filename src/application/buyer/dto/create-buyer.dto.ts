import { UniqueIdentifier } from '@/domain/entities/types';
import { CreateBuyerOutput } from '@/domain/use-cases/buyer';
import { Address } from '@/domain/value-objects';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
} from 'class-validator';

export class CreateBuyerInputDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Name buyer',
    example: 'Name buyer',
  })
  name: string;

  @IsString()
  @IsOptional()
  email: string;

  @IsOptional()
  @IsNotEmptyObject()
  address: Address;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'CNPJ or CPF',
    example: 'CPF',
  })
  documentType: string;

  @IsNotEmpty()
  @IsString()
  documentValue: string;

  @IsString()
  @IsOptional()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  motherName: string;

  @IsOptional()
  @IsDateString()
  birthDate: Date;
}

export class CreateBuyerOutputDto implements CreateBuyerOutput {
  @IsUUID()
  @IsString()
  id: UniqueIdentifier;
}
