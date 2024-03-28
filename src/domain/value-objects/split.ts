import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ValueObject } from './value-object';
import { Type } from 'class-transformer';

export interface ExternalInfoType {
  gateway: string;
  externalId: string;
  priority?: boolean;
}

export class ExternalInfo extends ValueObject<ExternalInfoType> {
  @IsString()
  @ApiProperty({
    description: 'gateway',
    example: 'pagar-me',
  })
  gateway: string;

  @IsString()
  @ApiProperty({
    description: 'externalId',
    example: 'rt_aasdf5a4f64',
  })
  externalId: string;

  @IsBoolean()
  @ApiProperty({
    description: 'priority',
    example: 'true',
  })
  priority?: boolean;
}

export interface SplitType {
  amount: Required<number>;
  accountId: Required<string>;
  externalInfos?: ExternalInfo[];
  accountDeadLine?: number;
}

export class Split extends ValueObject<SplitType> {
  @IsInt()
  @IsNotEmpty()
  @Min(0)
  @ApiProperty({
    description: 'Amount to split in cents',
    example: '10',
  })
  amount: Required<number>;

  @ApiProperty({
    description: 'accountId',
    example: '836d45c2-87cc-80ce-0139-1ec00847d28f',
  })
  @IsNotEmpty()
  @IsString()
  accountId: Required<string>;

  @ApiProperty({
    description: 'Principal account',
    example: 'true',
  })
  @IsBoolean()
  @IsNotEmpty()
  principal: Required<boolean>;

  @Type(() => ExternalInfo)
  @IsOptional()
  @ApiProperty({ type: [ExternalInfo] })
  externalInfos: ExternalInfo[];

  @ApiProperty({
    description: 'Settlement deadline',
    example: '30',
  })
  @IsInt()
  @Min(0)
  accountDeadLine: number;
}
