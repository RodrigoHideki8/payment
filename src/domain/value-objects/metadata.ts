import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ValueObject } from './value-object';

export interface MetadataProps {
  userAgent: Readonly<string>;
  ipAddress: Readonly<string>;
  device: Readonly<string>;
}

export class Metadata extends ValueObject<MetadataProps> {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'userAgent',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  })
  userAgent: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'ipAddress',
    example: '192.184.41.0',
  })
  ipAddress: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'device',
    example: 'f1a32sd1f3af1af',
  })
  device: string;
}
