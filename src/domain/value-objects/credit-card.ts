import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ValueObject } from './value-object';
import { Split } from './split';
import { Type } from 'class-transformer';

export interface CreditCardProps {
  cvv: string;
  holder: string;
  number: string;
  expirationMonth: string;
  expirationYear: string;
  brand: Brand;
}

export enum Brand {
  MASTERCARD = 'MASTERCARD',
  MAESTRO = 'MAESTRO',
  VISA = 'VISA',
  VISA_ELECTRON = 'VISA ELECTRON',
  ELO_CREDITO = 'ELO CREDITO',
  ELO_DEBITO = 'ELO DEBITO',
  HIPERCARD = 'HIPERCARD',
  AMEX_CREDITO = 'AMEX CREDITO',
  BANRICOMPRAS = 'BANRICOMPRAS',
  CABAL = 'CABAL',
  JCB = 'JCB',
  CREDSYSTEM_CREDITO = 'CREDSYSTEM CREDITO',
  DINERS_CREDITO = 'DINERS CREDITO',
  DISCOVER = 'DISCOVER',
  AURA = 'AURA',
  SOROCRED_CREDITO = 'SOROCRED CREDITO',
  AGIPLAN_CREDITO = 'AGIPLAN CREDITO',
  BANESCARD_CREDITO = 'BANESCARD CREDITO',
  CREDZ_CREDITO = 'CREDZ CREDITO',
  BANESCARD_DEBITO = 'BANESCARD DEBITO',
}

export class CreditCard extends ValueObject<CreditCardProps> {
  @IsString()
  @IsNotEmpty()
  @MaxLength(3)
  @ApiProperty({
    description: 'cvv',
    example: '406',
  })
  cvv: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'holder',
    example: 'test teste',
  })
  holder: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  @MinLength(16)
  @ApiProperty({
    description: 'number',
    example: '4916330354627438',
  })
  number: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2)
  @MinLength(2)
  @ApiProperty({
    description: 'expirationMonth',
    example: '02',
  })
  expirationMonth: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2)
  @MinLength(2)
  @ApiProperty({
    description: 'expirationYear',
    example: '24',
  })
  expirationYear: string;

  @IsNotEmpty()
  @ApiProperty({ enum: Brand })
  brand: Brand;
}

export interface CreditCardPaymentProps {
  creditCard: CreditCard;
  amount: number;
  split: Split[];
}

export class CreditCardPayment extends ValueObject<CreditCardProps> {
  @IsNotEmpty()
  @IsObject()
  @ApiProperty({ type: () => CreditCard })
  creditCard: CreditCard;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Payment amount by credit card',
    example: '100',
  })
  amount: number;

  @Type(() => Split)
  @ApiProperty({ type: [Split] })
  @IsOptional()
  split: Split[];
}
