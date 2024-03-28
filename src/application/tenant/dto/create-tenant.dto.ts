import {
  IsFQDN,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { UniqueIdentifier } from '@domain/entities/types';

export class CreateTenantInputDto {
  @IsString()
  @IsNotEmpty()
  @IsFQDN()
  domain: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;
}

export class CreateTenantOutputDto {
  @IsString()
  @IsUUID()
  id: UniqueIdentifier;

  @IsString()
  @IsNotEmpty()
  @IsFQDN()
  domain: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;
}
