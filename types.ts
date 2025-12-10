export interface ItemLicitacao {
  item: number;
  descricao: string;
  especificacao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface ExtractedData {
  local: string;
  orgaoResponsavel: string;
  modalidade: string;
  dataInicioRecebimento: string;
  dataFimRecebimento: string;
  dataAbertura: string;
  inicioSessaoDisputa: string;
  habilitacaoJuridica: string[];
  habilitacaoFiscalSocialTrabalhista: string[];
  habilitacaoEconomicoFinanceira: string[];
  itens: ItemLicitacao[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export type AppState = 'upload' | 'analyzing' | 'dashboard';