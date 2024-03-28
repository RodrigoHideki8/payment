import { IsNumber, IsString } from 'class-validator';

export class PaynetWebhookPayload {
  @IsNumber()
  id: number;
  @IsString()
  document: string;
  @IsString()
  authorization: string;
  @IsNumber()
  amount: number;
  @IsString()
  terminal_identification: string;
  @IsString()
  response_code: string;
  @IsString()
  payment_method: string;
  @IsString()
  brand: string;
  @IsString()
  card_number: string;
  @IsNumber()
  installments: number;
  @IsString()
  message: string;
}
