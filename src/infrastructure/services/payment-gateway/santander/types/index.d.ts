export type CreatePixRequestInput = {
  calendario: Calendario;
  devedor?: Devedor;
  valor: Valor;
  chave: string;
  solicitacaoPagador: string;
  infoAdicionais?: InfoAdicionais[];
};

export type CreatePixRequestOutput = CreatePixRequestInput & {
  location: string;
  revisao: number;
  txid: string;
  status: 'ATIVA' | 'CONCLUIDA';
};

export type Calendario = {
  /**
   * Tempo de vida da cobrança, especificado em segundos a partir da data de criação (Calendario.criacao)
   */
  criacao?: string;
  expiracao: number;
};

export type Devedor = {
  cnpj: string;
  nome: string;
};

export type InfoAdicionais = {
  nome: string;
  valor: string;
};

export type Valor = {
  original: string;
};

export type Pix = {
  endToEndId: string;
  txid: string;
  valor: string;
  horario: string;
  infoPagador: string;
};

export type GenerateTokenRequestOutput = {
  refreshUrl: string;
  token_type: string;
  client_id: string;
  access_token: string;
  refresh_token: string;
  scopes: string;
  expires_in: string;
};

export type SearchPixResponse = CreatePixRequestOutput & {
  pix: Pix[];
};

export type RefoundPixResponse = {
  id: string;
  rtrId: string;
  valor: string;
  horario: {
    solicitacao: string;
    liquidacao: string;
  };
  status: string;
  motivo: string;
};
