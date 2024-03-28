import { IsOptional, IsString } from 'class-validator';

export class GetBuyerInputDto {
  @IsString()
  @IsOptional()
  id: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  documentValue: string;

  @IsString()
  @IsOptional()
  page: number;

  @IsString()
  @IsOptional()
  size: number;
}
