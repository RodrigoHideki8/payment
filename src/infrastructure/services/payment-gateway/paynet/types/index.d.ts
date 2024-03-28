export type PaymentPayNet = {
  documentNumber: string;
  transactionType: number;
  amount: number;
  currencyCode: string;
  productType: number;
  installments: number;
  captureType: number;
  recurrent: boolean;
};

export type CardInfo = {
  numberToken?: string;
  cardholderName: string;
  securityCode: string;
  brand: number;
  expirationMonth: string;
  expirationYear: string;
};

export type Brand = {
  code: number;
  description: string;
};

export type SellerInfo = {
  orderNumber: string;
  softDescriptor: string;
};

export type Customer = {
  documentType: number;
  documentNumberCDH: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  birthdate: string;
  ipAddress: string;
  country: string;
  number: string;
};

export type Billing = {
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

export type PayNetRequest = {
  payment: PaymentPayNet;
  cardInfo: CardInfo;
  sellerInfo: SellerInfo;
  customer: Customer;
  billing: Billing;
};

export type PayNetResponse = {
  description: string;
  returnCode: string;
  paymentId: string;
  orderNumber: string;
  authorizationCode: string;
  amount: number;
};
