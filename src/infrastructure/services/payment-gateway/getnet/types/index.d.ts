export type GetnetOrder = {
  order_id: string;
  product_type: string;
};

export type GetnetCustomer = {
  customer_id: string;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  document_type: string;
  document_number: string;
  phone_number: string;
  billing_address: GetnetAddress;
};

export type GetnetShipping = {
  first_name: string;
  name: string;
  email: string;
  phone_number: string;
  address: GetnetAddress;
};

export type GetnetAddress = {
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
};

export type GetnetDevice = {
  ip_address: string;
  device_id: string;
};

export type GetnetOrderItem = {
  amount: number;
  currency: string;
  id: string;
  description: string;
  tax_percent?: number;
  tax_amount?: number;
};

export type GetnetMarketplaceSubsellerPayment = {
  subseller_sales_amount: number;
  subseller_id: string;
  order_items: GetnetOrderItem[];
};

export type GetnetCard = {
  number_token: string;
  cardholder_name: string;
  security_code: string;
  brand: string;
  expiration_month: string;
  expiration_year: string;
};

export type GetnetCreditCard = {
  delayed: boolean;
  pre_authorization: boolean;
  save_card_data: boolean;
  transaction_type: string;
  number_installments: number;
  soft_descriptor: string;
  card: GetnetCard;
};

export type GetnetCreditCardPaymentRequest = {
  seller_id: string;
  amount: number;
  currency: string;
  order: GetnetOrder;
  customer: GetnetCustomer;
  device: GetnetDevice;
  shippings: GetnetShipping[];
  marketplace_subseller_payments: GetnetMarketplaceSubsellerPayment[];
  credit: GetnetCreditCard;
};

export type GetnetAuthTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
};

export type GetnetCreditCardPaymentCredit = {
  delayed: false;
  authorization_code: string;
  authorized_at: Date | string;
  reason_code: string;
  reason_message: string;
  acquirer: string;
  soft_descriptor: string;
  brand: string;
  terminal_nsu: string;
  acquirer_transaction_id: string;
  transaction_id: string;
};

export type GetnetCreditCardPaymentSuccessResponse = {
  payment_id: string;
  seller_id: string;
  amount: number;
  currency: string;
  order_id: string;
  status: string;
  received_at: Date | string;
  credit: GetnetCreditCardPaymentCredit;
};

export type GetnetNumberTokenRequest = {
  card_number: string;
  customer_id?: string;
};

export type GetnetNumberTokenResponse = {
  number_token: string;
};

export type GetnetCancelCurrencyPaymentResponse = {
  payment_id: string;
  seller_id: string;
  amount: number;
  currency: string;
  order_id: string;
  status: string;
  credit_cancel: {
    canceled_at: string;
    message: string;
  };
};

export type GetnetCancelPaymentResponse = {
  seller_id: string;
  payment_id: string;
  cancel_request_at: Date | string;
  cancel_request_id: string;
  cancel_custom_key: string;
  status: string;
};

export type GetnetCancelPaymentRequest = {
  payment_id: string;
  cancel_amount: number;
};

export type GetnetCreditCardPaymentErrorResponse = {
  message: string;
  name: string;
  status_code: number;
  details: GetnetCreditCardPaymentErrorDetail[];
};

export type GetnetCreditCardPaymentErrorDetail = {
  status: string;
  error_code: string;
  description: string;
  description_detail: string;
  payment_id: string;
  authorization_code: string;
  terminal_nsu: string;
  acquirer_transaction_id: string;
  brand: string;
};
