export type ItemPagarme = {
  amount: number;
  description: string;
  quantity: number;
  code?: string;
};

export type PhonePagarme = {
  country_code: string;
  number: string;
  area_code: string;
};

export type HomePhonePagarme = {
  home_phone: PhonePagarme;
};

export type AddressPagarme = {
  line_1: string;
  zip_code: string;
  city: string;
  state: string;
  country: string;
  line_2?: string;
};

export type CustomerPagarme = {
  name: string;
  email: string;
  type: string;
  document: string;
  document_type?: string;
  phones?: HomePhonePagarme;
  address?: AddressPagarme;
};

export type AdditionalInformation = {
  name: string;
  value: string;
};

export type PaymentPixPagarme = {
  expires_at: Date;
  additional_information?: AdditionalInformation[];
};

export type PaymentBilletPagarme = {
  instructions: string;
  due_at: Date;
  document_number: string;
  type: string;
};

export type PaymentCreditCardPagarme = {
  card: {
    billing_address?: AddressPagarme;
    number: string;
    holder_name: string;
    exp_month: string;
    exp_year: string;
    cvv: string;
  };
  operation_type: string;
  installments: number;
  statement_descriptor: string;
};

export type PaymentSplitPagarme = {
  options: {
    charge_processing_fee: boolean;
    charge_remainder_fee: boolean;
    liable: boolean;
  };
  amount: number;
  recipient_id: string;
  type: string;
};

export type PaymentPagarme = {
  payment_method: string;
  pix?: PaymentPixPagarme;
  boleto?: PaymentBilletPagarme;
  credit_card?: PaymentCreditCardPagarme;
  split?: PaymentSplitPagarme[];
  amount?: number;
};

export type OrderPagarmeRequest = {
  items: ItemPagarme[];
  customer: CustomerPagarme;
  payments: PaymentPagarme[];
};

export type LastTransactionPagarmeResponse = {
  id: string;
  transaction_type: string;
  amount: number;
  status: string;
  success: boolean;
  created_at: Date;
  updated_at: Date;
  qr_code?: string;
  qr_code_url?: string;
  expires_at?: Date;
  barcode?: string;
  line?: string;
  nosso_numero?: string;
  due_at?: Date;
  pdf?: string;
  acquirer_message?: string;
  acquirer_return_code?: string;
  acquirer_auth_code?: string;
  acquirer_nsu?: string;
  gateway_response?: GatewayResponse;
};

export type GatewayResponse = {
  code: string;
  errors?: ErrorGatewayResponse[];
};

export type ErrorGatewayResponse = {
  message: string;
};

export type ChargePagarmeResponse = {
  id: string;
  code: string;
  gateway_id: string;
  amount: number;
  status: string;
  currency: string;
  payment_method: string;
  created_at: Date;
  updated_at: Date;
  last_transaction: LastTransactionPagarmeResponse;
};

export type OrderPagarmeResponse = {
  id: string;
  amount: number;
  status: string;
  charges: ChargePagarmeResponse[];
};
