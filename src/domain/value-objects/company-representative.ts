import { Address } from '@domain/value-objects';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNotEmpty, IsString } from 'class-validator';
import { ValueObject } from './value-object';

export interface CompanyRepresentativeProps {
  name: string;
  email: string;
  address: Address;
  documentType: string;
  documentValue: string;
  phoneNumber: string;
  motherName: string;
  birthDate: Date | string;
  isPoliticallyExposedPerson: boolean;
}

export class CompanyRepresentative {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  address: Address;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  documentType: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  documentValue: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  motherName: string;

  @IsDateString()
  @IsNotEmpty()
  birthDate: string | Date;

  @IsBoolean()
  @IsNotEmpty()
  isPoliticallyExposedPerson: boolean;
}
