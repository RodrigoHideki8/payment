import { IsObject, IsString } from 'class-validator';
import { PaynetWebhookPayload } from '@/infrastructure/services/payment-gateway/paynet/dto';

export class PaynetWebhookDto {
  @IsString()
  orderId: string;
  @IsString()
  timestamp: string;
  @IsString()
  signature: string;
  @IsString()
  status: 'paid' | 'fail';
  @IsString()
  proofDoc: string;
  @IsObject()
  data: PaynetWebhookPayload;
}
