import { Address } from '@/domain/value-objects';
import { UniqueIdentifier } from '@domain/entities/types';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateBuyerInputDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  email: string;

  @IsNotEmptyObject()
  @IsOptional()
  address: Address;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  documentType: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  documentValue: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  motherName: string;

  @IsDateString()
  @IsNotEmpty()
  @IsOptional()
  birthDate: string | Date;
}

export class UpdateBuyerOutputDto {
  @IsUUID()
  @IsString()
  id: UniqueIdentifier;
}
